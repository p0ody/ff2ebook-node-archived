"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var Events = require("events");
var FicEventHandler = (function () {
    function FicEventHandler() {
    }
    FicEventHandler.prototype.onWarning = function (msg) { Logging.log("Warning: " + msg); };
    ;
    FicEventHandler.prototype.onError = function (msg) { Logging.log("Error: " + msg); };
    ;
    FicEventHandler.prototype.onStart = function (data) { Logging.log("Starting conversion"); };
    ;
    FicEventHandler.prototype.onFileReady = function (infos) { Logging.log("File Ready."); };
    ;
    FicEventHandler.prototype.onEmailStart = function () { Logging.log("Start sending email."); };
    ;
    FicEventHandler.prototype.onEmailSent = function (err) { Logging.log("Email sent."); };
    ;
    FicEventHandler.prototype.onFicInfosReady = function () { Logging.log("Fic infos ready."); };
    ;
    FicEventHandler.prototype.onMobiStart = function () { Logging.log("Starting mobi conversion."); };
    ;
    FicEventHandler.prototype.onStatus = function (msg) { Logging.log("Change status to: " + msg); };
    ;
    FicEventHandler.prototype.onEpubStart = function () { Logging.log("Starting epub creation."); };
    ;
    FicEventHandler.prototype.onChapReady = function (chapCount) { Logging.log("Chapter ready."); };
    ;
    FicEventHandler.prototype.bindEvent = function (event) {
        if (!event)
            return Logging.trace("Invalid event object.");
        this._event = event;
        this._event.on("warning", this.onWarning);
        this._event.on("critical", this.onError);
        this._event.on("convertStart", this.onStart);
        this._event.on("fileReady", this.onFileReady);
        this._event.on("emailStart", this.onEmailStart);
        this._event.on("emailSent", this.onEmailSent);
        this._event.on("ficInfosReady", this.onFicInfosReady);
        this._event.on("mobiStart", this.onMobiStart);
        this._event.on("status", this.onStatus);
        this._event.on("epubStart", this.onEpubStart);
        this._event.on("chapReady", this.onChapReady);
    };
    ;
    FicEventHandler.prototype.getEvent = function () { return this._event; };
    ;
    return FicEventHandler;
}());
exports.FicEventHandler = FicEventHandler;
//# sourceMappingURL=FicEventHandler.js.map