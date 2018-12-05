"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Chapter_1 = require("./Chapter");
var Logging = require("./Logging");
var BaseFic_1 = require("./BaseFic");
var Async = require("async");
var request = require("request");
var FicFFNET = (function (_super) {
    __extends(FicFFNET, _super);
    function FicFFNET() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FicFFNET.prototype.gatherFicInfos = function (completedCallback) {
        var self = this;
        Async.waterfall([
            function (callback) {
                var id = self.findId();
                if (!id)
                    return callback("Couldn't find fic ID.");
                callback(null);
            },
            function (callback) {
                self.getPageSourceCode(0, callback);
            },
            function (body, callback) {
                if (self.isValidFic(body)) {
                    var infos = self.findFicInfos(body);
                    callback(null);
                }
                else
                    callback("Invalid fic URL.");
            }
        ], completedCallback);
    };
    FicFFNET.prototype.gatherChaptersInfos = function (completedCallback) {
        var self = this;
        Async.times(this.getChapterCount() + 1, function (i, next) {
            if (i > 0) {
                var retry_1 = 0;
                Async.retry({ times: 3, interval: 0 }, function (callback) {
                    retry_1++;
                    Logging.log("Getting chapter #" + i);
                    self.getPageSourceCode(i, function () {
                        var chapter = self.findChapterInfos(i);
                        if (!chapter.isValid()) {
                            self._event.emit("warning", "Error while fetching chapter #" + i + "... Retrying " + retry_1 + "/3.");
                            callback("Error while fetching chapter #" + i);
                        }
                        else
                            callback(null, chapter);
                    });
                }, function (err, chapter) {
                    if (!err)
                        self.getChapters().push(chapter);
                    self._event.emit("chapReady", self.getChapterCount());
                    next(err);
                });
            }
            else
                next();
        }, completedCallback);
    };
    ;
    FicFFNET.prototype.getPageSourceCode = function (chapNum, callback) {
        var self = this;
        request(this.getURL(chapNum), function (err, res, body) {
            if (!err && res.statusCode == 200) {
                self.setPageSource(chapNum, body);
                callback(null, body);
            }
            else {
                self.setPageSource(chapNum, "");
                callback("Couldn't find page source for Infos page.");
            }
        });
    };
    ;
    FicFFNET.prototype.findId = function () {
        if (this.getFicId())
            return this.getFicId();
        if (!this.getUrl())
            return 0;
        var matches = this.getUrl().match(/fanfiction\.net\/s\/([0-9]+)/i);
        if (matches === null)
            return 0;
        var id = parseInt(matches[1]);
        if (!id)
            return 0;
        this.setFicId(id);
        return id;
    };
    ;
    FicFFNET.prototype.getURL = function (chapNum) {
        if (chapNum === 0)
            return "http://www.fanfiction.net/s/" + this.getFicId();
        else {
            if (chapNum < 0)
                return "";
            return "http://m.fanfiction.net/s/" + this.getFicId() + "/" + chapNum;
        }
    };
    ;
    FicFFNET.prototype.findFicInfos = function (body) {
        this.setTitle(this.findTitle(body));
        var author = this.findAuthor(body);
        this.setAuthor(author.name);
        this.setAuthorId(author.id);
        this.setFicType(this.findFicType(body));
        this.setFandom(this.findFandom(body));
        this.setSummary(this.findSummary(body));
        this.setPublishedDate(this.findPublishedDate(body));
        this.setUpdatedDate(this.findUpdatedDate(body));
        this.setWordsCount(this.findWordsCount(body));
        this.setChapterCount(this.findChapterCount(body));
        this.setPairing(this.findPairing(body));
        this.setStatus(this.findStatus(body));
    };
    ;
    FicFFNET.prototype.findChapterInfos = function (chapNum) {
        var source = this.getPageSource(chapNum);
        if (source.length <= 0) {
            Logging.log("Chap #" + chapNum + ": Invalid source.");
            return new Chapter_1.Chapter(-1);
        }
        var chapter = new Chapter_1.Chapter(0);
        chapter.chapId = chapNum;
        chapter.title = this.findChapterTitle(source, chapNum);
        chapter.text = this.findChapterText(source);
        if (chapter.text.length === 0) {
            Logging.log("Chap #" + chapNum + ": No text found.");
            return new Chapter_1.Chapter(-1);
        }
        return chapter;
    };
    ;
    FicFFNET.prototype.findTitle = function (source) {
        var matches = source.match(/Follow\/Fav<\/button><b class='xcontrast_txt'>(.+?)<\/b>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic title.");
            return "Untitled";
        }
        return matches[1];
    };
    ;
    FicFFNET.prototype.findAuthor = function (source) {
        var matches = source.match(/By:<\/span> <a class='xcontrast_txt' href='\/u\/([0-9]+?)\/.*?'>(.+?)<\/a>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic author.");
            return { name: "Unknown", id: 0 };
        }
        var id = parseInt(matches[1]);
        if (!id)
            return { name: "Unknown", id: 0 };
        return { name: matches[2], id: id };
    };
    ;
    FicFFNET.prototype.findFicType = function (source) {
        var matches = source.match(/<a class=xcontrast_txt href='.*?'>(.+?)<\/a><span class='xcontrast_txt icon-chevron-right xicon-section-arrow'><\/span><a class=xcontrast_txt href=.*?>(.+?)<\/a>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic type.");
            return "";
        }
        return matches[1] + "/" + matches[2];
    };
    ;
    FicFFNET.prototype.findFandom = function (source) {
        var matches = source.match(/<title>.+?, a (.+?) fanfic | FanFiction<\/title>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic fandom.");
            return "";
        }
        return matches[1];
    };
    ;
    FicFFNET.prototype.findSummary = function (source) {
        var matches = source.match(/<div style='margin-top:2px' class='xcontrast_txt'>(.+?)<\/div>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic summary.");
            return "";
        }
        return matches[1];
    };
    ;
    FicFFNET.prototype.findPublishedDate = function (source) {
        var matches = source.match(/Published: <span data-xutime='([0-9]+?)'>.*?<\/span>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic published date.");
            return -1;
        }
        var date = parseInt(matches[1]);
        if (!date)
            return -1;
        return date;
    };
    ;
    FicFFNET.prototype.findUpdatedDate = function (source) {
        var matches = source.match(/Updated: <span data-xutime='([0-9]+?)'>.*?<\/span>/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic last updated date.");
            return this.getPublishedDate();
        }
        var date = parseInt(matches[1]);
        if (!date)
            return -1;
        return date;
    };
    ;
    FicFFNET.prototype.findWordsCount = function (source) {
        var matches = source.match(/- Words: (.+?) -/i);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic last updated date.");
            return 0;
        }
        var count = parseInt(matches[1]);
        if (!count)
            return -1;
        return count;
    };
    ;
    FicFFNET.prototype.findChapterCount = function (source) {
        var matches = source.match(/<option  value=.+?>/gi);
        if (matches === null)
            return 1;
        return matches.length / 2; // Dividing by 2 because there is a chapter selection on top and bottom of page
    };
    ;
    FicFFNET.prototype.findPairing = function (source) {
        var matches = source.match(/target='rating'>.+?<\/a> - .*?-  (.+?) -/gi);
        if (matches === null) {
            this.warningEvent("Coulnd't find fic pairing.");
            return "";
        }
        return matches[1];
    };
    FicFFNET.prototype.findStatus = function (source) {
        var matches = source.match(/- Status: Complete -/i);
        if (matches === null)
            return "In progress";
        return "Completed";
    };
    ;
    FicFFNET.prototype.findChapterTitle = function (source, chapNum) {
        var matches = source.match(/Chapter [0-9]+?: (.+?)<br><\/div><div role='main' aria-label='story content' style='font-size:1.1em;'>/i);
        if (matches === null)
            return "Chapter " + chapNum;
        return matches[1];
    };
    ;
    FicFFNET.prototype.findChapterText = function (source) {
        var matches = source.match(/<div style='padding:5px 10px 5px 10px;' class='storycontent nocopy' id='storycontent' >([\s\S]+?)<\/div>/i);
        if (matches === null)
            return "";
        return matches[1];
    };
    ;
    FicFFNET.prototype.isValidFic = function (source) {
        var matches = source.match(/<span class='gui_warning'>Story Not Found/i);
        if (matches === null)
            return true;
        return false;
    };
    ;
    return FicFFNET;
}(BaseFic_1.BaseFic));
exports.FicFFNET = FicFFNET;
//# sourceMappingURL=FicFFNET.js.map