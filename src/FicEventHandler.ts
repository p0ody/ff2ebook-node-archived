import * as Logging from "./Logging";
import { Fic } from "./Fic";
import * as Enums from "./Enums";
import * as Utils from "./Utils";
import { ErrorHandler } from "./ErrorHandler";
let Events = require("events");

export class FicEventHandler
{
    _event: any;

    onWarning(msg: string) { Logging.log("Warning: " + msg); };
    onError(msg: string) { Logging.log("Error: " + msg); };
    onStart(data: any) { Logging.log("Starting conversion"); };
    onFileReady(infos: any) { Logging.log("File Ready."); };
    onEmailStart() { Logging.log("Start sending email."); };
    onEmailSent(err: any) { Logging.log("Email sent."); };
    onFicInfosReady() { Logging.log("Fic infos ready."); };
    onMobiStart() { Logging.log("Starting mobi conversion."); };
    onStatus(msg: string) { Logging.log("Change status to: " + msg); };
    onEpubStart() { Logging.log("Starting epub creation."); };
    onChapReady(chapCount: number) { Logging.log("Chapter ready."); };


    bindEvent(event: any)
    {
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

    getEvent() { return this._event; };

    
}
