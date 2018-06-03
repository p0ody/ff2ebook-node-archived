"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var Fic_1 = require("./Fic");
var ErrorHandler_1 = require("./ErrorHandler");
var FicEventHandler_1 = require("./FicEventHandler");
var FicInfos_1 = require("./FicInfos");
var Events = require("events");
exports.socketHandler = function (io) {
    io.on('connection', function (socket) {
        Logging.log(socket.id + " Connected.");
        socket.on("convert-start", function (data) {
            var handler = initEventHandler(socket);
            handler.getEvent().emit("convertStart", data);
        });
    });
};
var initEventHandler = function (socket) {
    var event = new Events.EventEmitter();
    var errorHandler = new ErrorHandler_1.ErrorHandler(socket);
    var handler = new FicEventHandler_1.FicEventHandler();
    // Override abstract functions
    handler.onStart = function (data) {
        var fic = new Fic_1.Fic(handler.getEvent());
        var values = {
            url: data.url,
            forceUpdate: data.forceUpdate,
            fileType: data.fileType,
            sendEmail: data.sendEmail,
            emailAddress: data.email
        };
        fic.start(new FicInfos_1.FicInfos(values));
    };
    handler.onError = function (msg) { errorHandler.newError(msg); };
    handler.onWarning = function (msg) { errorHandler.newWarning(msg); };
    handler.onFileReady = function (infos) { socket.emit("fileReady", infos); };
    handler.onFicInfosReady = function () { socket.emit("ficInfosReady"); };
    handler.onStatus = function (msg) { socket.emit("status", msg); };
    handler.onEpubStart = function () { socket.emit("epubStart"); };
    handler.onEmailStart = function () { socket.emit("emailStart"); };
    handler.onEmailSent = function (err) { socket.emit("emailSent", err); };
    handler.onMobiStart = function () { socket.emit("mobiStart"); };
    handler.onChapReady = function (chapCount) { socket.emit("chapReady", chapCount); };
    handler.bindEvent(event);
    return handler;
};
//# sourceMappingURL=SocketHandler.js.map