"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var FileMgr = require("./FileMgr");
var Enums = require("./Enums");
var Utils = require("./Utils");
var FicFFNET_1 = require("./FicFFNET");
var DBHandler_1 = require("./DBHandler");
var Mailer = require("nodemailer");
var Fic = (function () {
    function Fic(event) {
        this._forceUpdate = false;
        this._source = Enums.Sources.INVALID;
        this._sendEmail = false;
        var self = this;
        this._event = event;
        self._event.on("warning", function (msg) {
            self._event.emit("warning", msg);
        });
    }
    // Setters
    Fic.prototype.setFicId = function (id) { this._ficId = id; };
    ;
    Fic.prototype.setUrl = function (url) { this._url = url; };
    ;
    Fic.prototype.setForceUpdate = function (force) { this._forceUpdate = force; };
    ;
    Fic.prototype.setSource = function (source) { this._source = source; };
    ;
    Fic.prototype.setHandler = function (handler) { this._handler = handler; };
    ;
    Fic.prototype.setFileType = function (type) { this._fileType = type; };
    ;
    Fic.prototype.setSendEmail = function (send) { this._sendEmail = send; };
    ;
    Fic.prototype.setEmailAddress = function (email) { this._emailAddress = email; };
    ;
    Fic.prototype.setFilePath = function (path) { this._filePath = path; };
    ;
    // Getters
    Fic.prototype.getFicId = function () { return this._ficId; };
    ;
    Fic.prototype.getUrl = function () { return this._url; };
    ;
    Fic.prototype.getForceUpdate = function () { return this._forceUpdate; };
    ;
    Fic.prototype.getSource = function () { return this._source; };
    ;
    Fic.prototype.getHandler = function () { return this._handler; };
    ;
    Fic.prototype.getFileType = function () { return this._fileType; };
    ;
    Fic.prototype.getSendEmail = function () { return this._sendEmail; };
    ;
    Fic.prototype.getEmailAddress = function () { return this._emailAddress; };
    ;
    Fic.prototype.getFilePath = function () { return this._filePath; };
    ;
    Fic.prototype.start = function (infos) {
        var self = this;
        if (!infos)
            return self._event.emit("error", "Invalid infos object");
        self._ficId = infos.ficId;
        self._source = infos.source;
        self._url = infos.url;
        self._forceUpdate = infos.forceUpdate;
        self._fileType = infos.fileType;
        self._sendEmail = infos.sendEmail;
        self._emailAddress = infos.emailAddress;
        if (self._fileType != Enums.FileType.EPUB && self._fileType != Enums.FileType.MOBI)
            return self._event.emit("critical", "Invalid filetype.");
        if (!Utils.isValidSource(self._source)) {
            if (typeof self._url === "string")
                self.setSource(Utils.findSource(self._url));
            else
                return self._event.emit("critical", "Couldn't find fic source (Website).");
        }
        if (!Utils.isValidSource(self._source))
            return self._event.emit("critical", "Couldn't find fic source (Website).");
        switch (self.getSource()) {
            case Enums.Sources.FFNET:
                self.setHandler(new FicFFNET_1.FicFFNET(self._event));
                if (self.getFicId() !== -1)
                    self.getHandler().setFicId(self.getFicId());
                else
                    self.getHandler().setUrl(self.getUrl());
                self.getHandler().setSource(self.getSource());
                break;
        }
        if (self.getHandler() === undefined)
            return self._event.emit("critical", "An unknown error has occured.");
        ;
        self.getHandler().gatherFicInfos(self.gatherFicInfosCallback.bind(self));
    };
    ;
    Fic.prototype.sendFileReady = function () {
        var self = this;
        self._event.emit("fileReady", {
            source: this.getSource(),
            id: this.getHandler().getFicId(),
            fileType: this.getFileType()
        });
        if (!self.getSendEmail() || self.getEmailAddress().length <= 0)
            return;
        self._event.emit("emailStart");
        var mailOpts = {
            from: '"FF2EBOOK" <ebook-sender@ff2ebook.com>',
            to: self.getEmailAddress(),
            subject: "Your eBook: " + self.getHandler().getTitle() + " - " + self.getHandler().getAuthor(),
            text: "Enjoy!",
            attachments: [
                {
                    filename: self.getHandler().getTitle() + " - " + self.getHandler().getAuthor() + "." + Utils.fileTypeToString(self.getFileType()),
                    path: self.getFilePath()
                }
            ]
        };
        var smtpConfig = {
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWD
            }
        };
        //var trans = Mailer.createTransport('smtps://ff2ebook%40gmail.com:Reev9tee@smtp.gmail.com');
        var trans = Mailer.createTransport(smtpConfig);
        trans.verify(function (err, success) {
            if (err)
                return Logging.log(err);
            else {
                Logging.log("SMTP connection good.");
                trans.sendMail(mailOpts, function (err, info) {
                    if (err) {
                        self._event.emit("emailSent", "An error has occured.");
                        return Logging.log(err);
                    }
                    else {
                        self._event.emit("emailSent");
                        Logging.log("Email sent.");
                    }
                });
            }
        });
    };
    ;
    Fic.prototype.gatherFicInfosCallback = function (err) {
        var self = this;
        if (err)
            return self._event.emit("critical", err);
        self._event.emit("ficInfosReady");
        if (self.getForceUpdate() === true)
            return self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation
        // Check if fic is in DB
        var db = DBHandler_1.DBHandler.getDB();
        db.query("SELECT * FROM `fic_archive` WHERE `id`=?;", [self.getHandler().getFicId()], function (err, result) {
            if (err) {
                Logging.log(err);
                return self._event.emit("critical", "Error while accessing database, please try again later");
            }
            if ((result.length > 0 && result[0].updated >= self.getHandler().getUpdatedDate())) {
                var epub = process.env.ARCHIVE_DIR + "/" + result[0].filename;
                var mobi = epub.substr(0, epub.length - 4) + "mobi";
                FileMgr.fileExist(epub, function (exist) {
                    if (exist) {
                        if (self.getFileType() == Enums.FileType.MOBI) {
                            FileMgr.fileExist(mobi, function (exist) {
                                if (exist) {
                                    self.setFilePath(mobi);
                                    return self.sendFileReady(); // Send fileReady to client for MOBI file if it already exists
                                }
                                else {
                                    self._event.emit("mobiStart");
                                    self._event.emit("status", "Converting to mobi...");
                                    FileMgr.createMobi(epub, function (err, file) {
                                        if (err)
                                            return self._event.emit("critical", "An error as occured while converting to mobi.");
                                        self.setFilePath(file);
                                        return self.sendFileReady(); // Send fileReady to client for MOBI file after creating it
                                    });
                                }
                            });
                        }
                        else {
                            Logging.log("Epub already exist and is up to date.");
                            self.setFilePath(epub);
                            return self.sendFileReady(); // Send fileReady to client for EPUB file that already exists
                        }
                    }
                    else {
                        self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation
                        db.query("DELETE FROM `fic_archive` WHERE `id`=?", [self.getHandler().getFicId()], function (err) {
                            if (err)
                                Logging.trace(err);
                        });
                    }
                });
            }
            else {
                self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation
            }
        });
    };
    ;
    Fic.prototype.gatherChaptersInfosCallback = function (err) {
        var self = this;
        if (err)
            return self._event.emit("critical", err);
        // Start epub creation
        self._event.emit("epubStart");
        FileMgr.createEpub(self.getHandler(), function (err, filepath) {
            if (err)
                return self._event.emit("critical", err);
            var path = require("path");
            var db = DBHandler_1.DBHandler.getDB();
            db.query("REPLACE INTO `fic_archive` (`site`,`id`,`title`,`author`,`authorID`,`updated`,`filename`) VALUES (?,?,?,?,?,?,?);", [self.getSource(), self.getHandler().getFicId(), self.getHandler().getTitle(), self.getHandler().getAuthor(), self.getHandler().getAuthorId(), self.getHandler().getUpdatedDate(), path.basename(filepath)], function (err) {
                if (err) {
                    Logging.log(err);
                    return self._event.emit("critical", "Error while accessing database, please try again later");
                }
                else {
                    // Start mobi convertion if filetype is mobi
                    self._event.emit("mobiStart");
                    self._event.emit("status", "Epub ready.");
                    if (self.getFileType() == Enums.FileType.MOBI) {
                        self._event.emit("status", "Converting to Mobi...");
                        FileMgr.createMobi(filepath, function (err, mobi) {
                            if (err)
                                return self._event.emit("critical", "Error while converting to Mobi.");
                            self.setFilePath(mobi);
                            return self.sendFileReady();
                        });
                    }
                    else {
                        self.setFilePath(filepath);
                        return self.sendFileReady(); // Tell the client that the EPUB is ready
                    }
                }
            });
        });
    };
    return Fic;
}());
exports.Fic = Fic;
;
//# sourceMappingURL=Fic.js.map