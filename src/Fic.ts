import * as Logging from "./Logging";
import * as FileMgr from "./FileMgr";
import * as Enums from "./Enums";
import * as Utils from "./Utils";
import { FicInfos } from "./FicInfos";
import { BaseFic } from "./BaseFic"
import { FicFFNET } from "./FicFFNET"
import { DBHandler } from "./DBHandler";
let Mailer = require("nodemailer");


export class Fic
{
    private _ficId: number;
    private _url: string;
    private _forceUpdate: boolean = false;
    private _source: Enums.Sources = Enums.Sources.INVALID;
    private _event: any;
    private _handler: BaseFic;
    private _fileType: Enums.FileType;
    private _sendEmail: boolean = false;
    private _emailAddress: string;
    private _filePath: string;

    constructor(event:any)
    {
        let self = this;
        this._event = event;
    }

    // Setters
    setFicId(id: number) { this._ficId = id; };
    setUrl(url: string) { this._url = url; };
    setForceUpdate(force: boolean) { this._forceUpdate = force; };
    setSource(source: Enums.Sources) { this._source = source; };
    setHandler(handler: BaseFic) { this._handler = handler; };
    setFileType(type: Enums.FileType) { this._fileType = type; };
    setSendEmail(send: boolean) { this._sendEmail = send; };
    setEmailAddress(email: string) { this._emailAddress = email; };
    setFilePath(path: string) { this._filePath = path; };

    // Getters
    getFicId() : number { return this._ficId; };
    getUrl() : string { return this._url; };
    getForceUpdate() : boolean { return this._forceUpdate; };
    getSource() : Enums.Sources { return this._source; };
    getHandler() : BaseFic { return this._handler; };
    getFileType() : Enums.FileType { return this._fileType; };
    getSendEmail() : boolean { return this._sendEmail; };
    getEmailAddress() : string { return this._emailAddress; };
    getFilePath() : string { return this._filePath; };

    start(infos: FicInfos)
    {
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

        if (!Utils.isValidSource(self._source))
        {
            if (typeof self._url === "string")
                self.setSource(Utils.findSource(self._url));
            else
                return self._event.emit("critical", "Couldn't find fic source (Website).");
        }
        if (!Utils.isValidSource(self._source))
            return self._event.emit("critical", "Couldn't find fic source (Website).");
        
        
        switch (self.getSource())
        {
            case Enums.Sources.FFNET:
                self.setHandler(new FicFFNET(self._event));

                if (self.getFicId() !== -1)
                    self.getHandler().setFicId(self.getFicId());
                else
                    self.getHandler().setUrl(self.getUrl());

                self.getHandler().setSource(self.getSource());
                break;

        }
        if (self.getHandler() === undefined)        
            return self._event.emit("critical", "An unknown error has occured.");;
        
        self.getHandler().gatherFicInfos(self.gatherFicInfosCallback.bind(self));
    };

    sendFileReady()
    {
        var self = this;
        self._event.emit("fileReady", {
            source: Utils.sourceToShortString(this.getSource()),
            id: this.getHandler().getFicId(),
            fileType: Utils.fileTypeToString(this.getFileType())
        });
        if (!self.getSendEmail() || self.getEmailAddress().length <= 0)
            return;

        self._event.emit("emailStart");
        var mailOpts =
        {
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

        var smtpConfig =
        {
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWD
            }
        };

        //var trans = Mailer.createTransport('smtps://ff2ebook%40gmail.com:Reev9tee@smtp.gmail.com');
        var trans = Mailer.createTransport(smtpConfig);

        trans.verify(function (err: any, success: any)
        {
            if (err)
                return Logging.log(err);
            else
            {

                Logging.log("SMTP connection good.");
                trans.sendMail(mailOpts, function (err: any, info: any)
                {
                    if (err)
                    {
                        self._event.emit("emailSent", "An error has occured.");
                        return Logging.log(err);
                    }
                    else
                    {
                        self._event.emit("emailSent");
                        Logging.log("Email sent.");
                    }

                });
            }
        });
    };


    gatherFicInfosCallback(err:any)
    {
        var self = this;

        if (err)
            return self._event.emit("critical", err);

        self._event.emit("ficInfosReady");

        if (self.getForceUpdate() === true)
            return self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation

        // Check if fic is in DB
        if (DBHandler.isValid()) // Checking if mysql connection is valid.  If not, skip this step.
        {
            let db = DBHandler.getDB();
            db.query("SELECT * FROM `fic_archive` WHERE `id`=?;", [self.getHandler().getFicId()], function (err: any, result: any)
            {
                if (err)
                {
                    Logging.log(err);
                    return self._event.emit("critical", "Error while accessing database, please try again later");
                }

                if ((result.length > 0 && result[0].updated >= self.getHandler().getUpdatedDate())) // If is in DB and is up to date, check if filetype requested is mobi, then send appropiate file.
                {
                    var epub = process.env.ARCHIVE_DIR + "/" + result[0].filename;
                    var mobi = epub.substr(0, epub.length - 4) + "mobi";
                    FileMgr.fileExist(epub, function (exist)
                    {
                        if (exist) // Epub exist
                        {
                            if (self.getFileType() == Enums.FileType.MOBI)
                            {
                                FileMgr.fileExist(mobi, function (exist)
                                {
                                    if (exist)
                                    {
                                        self.setFilePath(mobi);
                                        return self.sendFileReady(); // Send fileReady to client for MOBI file if it already exists
                                    }
                                    else
                                    {
                                        self._event.emit("mobiStart");
                                        self._event.emit("status", "Converting to mobi...");
                                        FileMgr.createMobi(epub, function (err, file)
                                        {
                                            if (err)
                                                return self._event.emit("critical", "An error as occured while converting to mobi.");

                                            self.setFilePath(file);
                                            return self.sendFileReady();// Send fileReady to client for MOBI file after creating it
                                        });
                                    }
                                });
                            }
                            else // EPUB exist and EPUB file requested
                            {
                                Logging.log("Epub already exist and is up to date.");
                                self.setFilePath(epub);
                                return self.sendFileReady();// Send fileReady to client for EPUB file that already exists
                            }
                        }
                        else // EPUB doesnt exist
                        {
                            self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation
                            db.query("DELETE FROM `fic_archive` WHERE `id`=?", [self.getHandler().getFicId()], function (err: any) // Delete entry in DB if the file is not on the server anymore.
                            {
                                if (err)
                                    Logging.trace(err);
                            });
                        }
                    });
                }
                else // File is not in database
                {
                    self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation
                }
            });
        }
        else // No database connection
            self.getHandler().gatherChaptersInfos(self.gatherChaptersInfosCallback.bind(self)); // Keep going in file creation if mysql connection isnt valid
    };



    gatherChaptersInfosCallback(err: any) : any
    {
        var self = this;

        if (err)
            return self._event.emit("critical", err);

        // Start epub creation
        self._event.emit("epubStart");
        FileMgr.createEpub(self.getHandler(), function (err: any, filepath: any)
        {
            if (err)
                return self._event.emit("critical", err);

            let path = require("path");

            // Add fic infos to database only if mysql connection is valid
            if (DBHandler.isValid())
            {
                let db = DBHandler.getDB();
                db.query("REPLACE INTO `fic_archive` (`site`,`id`,`title`,`author`,`authorID`,`updated`,`filename`) VALUES (?,?,?,?,?,?,?);",
                [Utils.sourceToShortString(self.getSource()), self.getHandler().getFicId(), self.getHandler().getTitle(), self.getHandler().getAuthor(), self.getHandler().getAuthorId(), self.getHandler().getUpdatedDate(), path.basename(filepath)],
                function (err: any)
                {
                    if (err)
                    {
                        Logging.log(err);
                        return self._event.emit("critical", "Error while accessing database, please try again later");
                    }
                });
            }

                // Start mobi convertion if filetype is mobi
            self._event.emit("mobiStart");
            self._event.emit("status", "Epub ready.");
            if (self.getFileType() == Enums.FileType.MOBI)
            {
                self._event.emit("status", "Converting to Mobi...");
                FileMgr.createMobi(filepath, function (err, mobi)
                {
                    if (err)
                        return self._event.emit("critical", "Error while converting to Mobi.");

                    self.setFilePath(mobi);
                    return self.sendFileReady()
                });
            }
            else
            {
                self.setFilePath(filepath);
                return self.sendFileReady(); // Tell the client that the EPUB is ready
            }
        });
    }
};
