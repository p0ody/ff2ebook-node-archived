import * as Logging from "./Logging";
import { Fic } from "./Fic";
import { ErrorHandler } from "./ErrorHandler";
import { FicEventHandler } from "./FicEventHandler";
import { FicInfos } from "./FicInfos";
import * as Events from "events";
import * as SocketIO from "socket.io";

export let socketHandler = function(io: SocketIO.Server)
{
    io.on('connection', function (socket: SocketIO.Socket)
    {
        Logging.log(socket.id + " Connected.");

        socket.on("convert-start", function(data: any)
        {
            var handler = initEventHandler(socket);
            
            handler.getEvent().emit("convertStart", data);
        });
    });
};


let initEventHandler = function (socket: SocketIO.Socket)
{
    var event = new Events.EventEmitter();
    var errorHandler = new ErrorHandler(socket);

    var handler = new FicEventHandler();

    // Override abstract functions
    handler.onStart = function(data)
    {
        var fic = new Fic(handler.getEvent());
        var values =
        {
            url: data.url,
            forceUpdate: data.forceUpdate,
            fileType: data.fileType,
            sendEmail: data.sendEmail,
            emailAddress: data.email
        };

        fic.start(new FicInfos(values));
    };

    handler.onError = function(msg) { errorHandler.newError(msg); };
    handler.onWarning = function(msg) { errorHandler.newWarning(msg); };
    handler.onFileReady = function(infos) { socket.emit("fileReady", infos); };
    handler.onFicInfosReady = function() { socket.emit("ficInfosReady"); };
    handler.onStatus = function(msg) { socket.emit("status", msg); };
    handler.onEpubStart = function() { socket.emit("epubStart"); };
    handler.onEmailStart = function() { socket.emit("emailStart"); };
    handler.onEmailSent = function(err) { socket.emit("emailSent", err); };
    handler.onMobiStart = function() { socket.emit("mobiStart"); };
    handler.onChapReady = function(chapCount) { socket.emit("chapReady", chapCount); };
    
    handler.bindEvent(event);

    return handler;

};