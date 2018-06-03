"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var Utils = require("./Utils");
var async = require("async");
var tidy = require("htmltidy2").tidy;
var EpubGen = require("epub-generator");
var fs = require("fs");
// HTML Tidy options
var tidyOpts = {
    doctype: 'xhtml',
    indent: true,
    "indent-spaces": 4,
    clean: true
};
var EpubFile = (function () {
    function EpubFile(content, path, type, title, order) {
        this._content = content;
        this._filePath = path;
        this._title = title;
        this._order = (order === undefined) ? 0 : order;
        this._fileType = type;
    }
    EpubFile.prototype.setContent = function (content) { this._content = content; };
    ;
    EpubFile.prototype.setFilePath = function (path) { this._filePath = path; };
    ;
    EpubFile.prototype.setTitle = function (title) { this._title = title; };
    ;
    EpubFile.prototype.setOrder = function (order) { this._order = order; };
    ;
    EpubFile.prototype.setFileType = function (filetype) { this._fileType = filetype; };
    ;
    EpubFile.prototype.getContent = function () { return this._content; };
    ;
    EpubFile.prototype.getFilePath = function () { return this._filePath; };
    ;
    EpubFile.prototype.getTitle = function () { return this._title; };
    ;
    EpubFile.prototype.getOrder = function () { return this._order; };
    ;
    EpubFile.prototype.getFileType = function () { return this._fileType; };
    ;
    return EpubFile;
}());
var Epub = (function () {
    function Epub(fic, callback) {
        this._content = [];
        this._epub = false; // Set to EpubGen
        this.setEpubPath(process.env.ARCHIVE_DIR + "/" + Utils.sourceToShortString(fic.getSource()) + "_" + fic.getFicId() + "_" + fic.getUpdatedDate() + ".epub");
        this.setFic(fic);
        this._callback = callback;
        this.createEpub();
    }
    Epub.prototype.setEpubPath = function (path) { this._epubPath = path; };
    ;
    Epub.prototype.setContents = function (content) { this._content = content; };
    ;
    Epub.prototype.setFic = function (fic) { this._fic = fic; };
    ;
    Epub.prototype.setCallback = function (cb) { this._callback = cb; };
    ;
    Epub.prototype.setEpub = function (epub) { this._epub = epub; };
    ;
    Epub.prototype.getEpubPath = function () { return this._epubPath; };
    ;
    Epub.prototype.getContents = function () { return this._content; };
    ;
    Epub.prototype.getFic = function () { return this._fic; };
    ;
    Epub.prototype.sendCallback = function (err, succ) { this._callback(err, succ); };
    ;
    Epub.prototype.getEpub = function () { return this._epub; };
    ;
    Epub.prototype.createEpub = function () {
        var self = this;
        async.series([
            function (callback) {
                fs.stat(process.env.ARCHIVE_DIR, function (err, stats) {
                    if (!stats) {
                        fs.mkdir(process.env.ARCHIVE_DIR, function (err) {
                            if (err)
                                self.sendCallback("Couldn't create archive dir.");
                            Logging.log("Dir created");
                        });
                    }
                });
                callback(null);
            },
            function (callback) {
                fs.stat(self.getEpubPath(), function (err, stats) {
                    if (stats !== undefined) {
                        fs.unlink(self.getEpubPath(), function (err) {
                            if (err)
                                self.sendCallback("Couldn't delete existing epub.");
                            else
                                Logging.log(self.getEpubPath() + " Deleted.");
                        });
                    }
                });
                callback(null);
            }
        ], self.genTitlePage());
    };
    ;
    Epub.prototype.genTitlePage = function () {
        var self = this;
        fs.readFile("./blanks/title.xhtml", 'utf8', function (err, data) {
            if (err)
                self.sendCallback("Couldn't read title.xhtml.");
            else {
                var find = ["%title%", "%titleLink%", "%author%", "%fandom%", "%summary%", "%status%", "%ficType%", "%pairing%", "%published%", "%updated%", "%wordsCount%", "%chapCount%", "%convertDate%"];
                var replace = [
                    self.getFic().getTitle(),
                    Utils.genFicUrl(self.getFic().getSource(), self.getFic().getFicId(), self.getFic().getTitle()),
                    Utils.genAuthorURL(self.getFic().getSource(), self.getFic().getAuthorId(), self.getFic().getAuthor()),
                    Utils.formatValue("Fandom", self.getFic().getFandom()),
                    Utils.formatValue("Summary", self.getFic().getSummary()),
                    Utils.formatValue("Status", self.getFic().getStatus()),
                    Utils.formatValue("FicType", self.getFic().getFicType()),
                    Utils.formatValue("Pairing/Main char.", self.getFic().getPairing()),
                    Utils.formatValue("Published date", Utils.getDateYYYYMMDD(new Date(self.getFic().getPublishedDate() * 1000))),
                    Utils.formatValue("Updated date", Utils.getDateYYYYMMDD(new Date(self.getFic().getUpdatedDate() * 1000))),
                    Utils.formatValue("Words count", self.getFic().getWordsCount()),
                    Utils.formatValue("Chapter count", self.getFic().getChapterCount()),
                    Utils.getDateYYYYMMDD(new Date())
                ];
                tidy(Utils.stringReplaceWithArray(data, find, replace), tidyOpts, function (err, html) {
                    if (err)
                        self.sendCallback("Couldn't use htmltidy on title page.");
                    else {
                        self.getContents().push(new EpubFile(html, "Content/title.xhtml", "xhtml", "Title Page", 1));
                        self.genChaptersPages();
                    }
                });
            }
        });
    };
    ;
    Epub.prototype.genChaptersPages = function () {
        var self = this;
        fs.readFile("./blanks/chapter.xhtml", 'utf8', function (err, data) {
            if (err)
                self.sendCallback("Couldn't read chapter.xhtml.");
            else {
                async.each(self.getFic().getChapters(), function (chap, callback) {
                    if (chap) {
                        var find = ["%title%", "%chapNum%", "%body%"];
                        var replace = [chap.title, chap.chapId, chap.text];
                        tidy(Utils.stringReplaceWithArray(data, find, replace), tidyOpts, function (err, html) {
                            if (err) {
                                self.sendCallback("Couldn't tidy chapter #" + chap.chapId);
                                callback(err);
                            }
                            else {
                                self.getContents().push(new EpubFile(html, "Content/chapter" + chap.chapId + ".xhtml", "xhtml", chap.title, parseInt(chap.chapId) + 1));
                                callback(null);
                            }
                        });
                    }
                    else
                        callback(null);
                }, function () {
                    Logging.log("Tidy finished");
                    self.genStyle();
                });
            }
        });
    };
    ;
    Epub.prototype.genStyle = function () {
        var self = this;
        fs.readFile("./blanks/style.css", 'utf8', function (err, data) {
            if (err) {
                self.sendCallback("Couldn't read content.opf.");
            }
            else {
                self._content.push(new EpubFile(data, "Styles/style.css", "css"));
                self.createFile();
            }
        });
    };
    ;
    Epub.prototype.createFile = function (err) {
        if (err) {
            this.sendCallback("Error while generating files.");
        }
        var self = this;
        Logging.log("Starting file creation...");
        this.setEpub(new EpubGen({
            title: self.getFic().getTitle(),
            author: self.getFic().getAuthor()
        }));
        var content = this.getContents().sort(function (a, b) {
            return a.getOrder() - b.getOrder();
        });
        content.forEach(function (value) {
            self.getEpub().add(value.getFilePath(), value.getContent(), { title: value.getTitle(), toc: value.getFileType() == "xhtml" });
        });
        self.getEpub().end().pipe(fs.createWriteStream(self.getEpubPath()));
        self.getEpub().on('error', function (err) {
            Logging.trace(err);
        });
        self.getEpub().on("finish", function () {
            Logging.log("Epub ready.");
            self.sendCallback(null, self.getEpubPath());
        });
    };
    ;
    return Epub;
}());
exports.Epub = Epub;
//# sourceMappingURL=Epub.js.map