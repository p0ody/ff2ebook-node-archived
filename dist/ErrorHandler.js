"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var ErrorHandler = (function () {
    function ErrorHandler(socket) {
        this.self = this;
        this.socket = socket;
    }
    ErrorHandler.prototype.newError = function (msg) {
        this.socket.emit("critical", msg);
        Logging.log("Error: " + msg);
    };
    ErrorHandler.prototype.newWarning = function (msg) {
        this.socket.emit("warning", msg);
        Logging.log("Warning: " + msg);
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map