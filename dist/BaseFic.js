"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums = require("./Enums");
var BaseFic = (function () {
    function BaseFic(event) {
        this._source = Enums.Sources.INVALID;
        this._pageSource = []; // pageSource[0] is fic info page
        this._chapters = [];
        this._event = event;
    }
    // Setters
    BaseFic.prototype.setUrl = function (url) {
        if (!url)
            return this._event.emit("critical", "Invalid url.");
        this._url = url;
    };
    ;
    BaseFic.prototype.setSource = function (source) { this._source = source; };
    ;
    BaseFic.prototype.setFicId = function (id) {
        if (!id)
            return this._event.emit("critical", "Invalid ficId.");
        this._ficId = id;
    };
    ;
    BaseFic.prototype.setTitle = function (title) { this._title = title; };
    ;
    BaseFic.prototype.setAuthor = function (author) { this._author = author; };
    ;
    BaseFic.prototype.setAuthorId = function (id) { this._authorId = id; };
    ;
    BaseFic.prototype.setFicType = function (type) { this._ficType = type; };
    ;
    BaseFic.prototype.setFandom = function (fandom) { this._fandom = fandom; };
    ;
    BaseFic.prototype.setSummary = function (sum) { this._summary = sum; };
    ;
    BaseFic.prototype.setPublishedDate = function (date) { this._publishedDate = date; };
    ;
    BaseFic.prototype.setUpdatedDate = function (date) { this._updatedDate = date; };
    ;
    BaseFic.prototype.setWordsCount = function (count) { this._wordsCount = count; };
    ;
    BaseFic.prototype.setChapterCount = function (count) { this._chapterCount = count; };
    ;
    BaseFic.prototype.setPairing = function (pairing) { this._pairing = pairing; };
    ;
    BaseFic.prototype.setStatus = function (status) { this._status = status; };
    ;
    BaseFic.prototype.setPageSource = function (num, http) { this._pageSource[num] = http; };
    ;
    BaseFic.prototype.setChapters = function (num, chapter) { this._chapters[num] = chapter; };
    ;
    // Getters
    BaseFic.prototype.getUrl = function () { return this._url; };
    ;
    BaseFic.prototype.getSource = function () { return this._source; };
    ;
    BaseFic.prototype.getFicId = function () { return this._ficId; };
    ;
    BaseFic.prototype.getTitle = function () { return this._title; };
    ;
    BaseFic.prototype.getAuthor = function () { return this._author; };
    ;
    BaseFic.prototype.getAuthorId = function () { return this._authorId; };
    ;
    BaseFic.prototype.getFicType = function () { return this._ficType; };
    ;
    BaseFic.prototype.getFandom = function () { return this._fandom; };
    ;
    BaseFic.prototype.getSummary = function () { return this._summary; };
    ;
    BaseFic.prototype.getPublishedDate = function () { return this._publishedDate; };
    ;
    BaseFic.prototype.getUpdatedDate = function () { return this._updatedDate; };
    ;
    BaseFic.prototype.getWordsCount = function () { return this._wordsCount; };
    ;
    BaseFic.prototype.getChapterCount = function () { return this._chapterCount; };
    ;
    BaseFic.prototype.getPairing = function () { return this._pairing; };
    ;
    BaseFic.prototype.getStatus = function () { return this._status; };
    ;
    BaseFic.prototype.getPageSource = function (num) { return this._pageSource[num]; };
    ;
    BaseFic.prototype.getChapters = function () { return this._chapters; };
    ;
    BaseFic.prototype.getChapter = function (num) { return this._chapters[num]; };
    ;
    BaseFic.prototype.findFicInfos = function (body) {
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
    BaseFic.prototype.warningEvent = function (msg) {
        if (this._event)
            this._event.emit("warning", msg);
    };
    ;
    return BaseFic;
}());
exports.BaseFic = BaseFic;
//# sourceMappingURL=BaseFic.js.map