"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var http = require("http");
//let lessMiddleware = require("less-middleware");
var sassMiddleware = require("node-sass-middleware");
var DBHandler_1 = require("./DBHandler");
var SocketHandler = require("./SocketHandler");
var constValue = require("./constValue");
var Logging = require("./Logging");
var APPROOT = require("app-root-path");
var SocketIO = require("socket.io");
var Server = (function () {
    function Server() {
        this._app = express();
        if (!this.setPort(process.env.PORT)) {
            Logging.log("Invalid port, defaulting to 8000.");
            this.setPort(8000);
        }
        this.execConfig();
        this.addRoutes();
        this.addApi();
        this.httpServerInit();
        this.dbInit();
        this.socketIOInit();
        Logging.log("Server now listening on port " + this.getPort());
    }
    Server.prototype.getApp = function () { return this._app; };
    ;
    Server.prototype.getPort = function () { return this._port; };
    ;
    Server.prototype.setPort = function (port) {
        if (port > constValue.MAX_PORT || port < 0)
            return false;
        this._port = port;
        return true;
    };
    ;
    Server.prototype.execConfig = function () {
        // uncomment after placing your favicon in /public
        //this.getApp().use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        this.getApp().set("port", this.getPort());
        this.getApp().set('views', path.join(APPROOT.path, 'views'));
        this.getApp().set('view engine', 'ejs');
        this.getApp().use(logger('dev'));
        this.getApp().use(bodyParser.json());
        this.getApp().use(bodyParser.urlencoded({ extended: false }));
        this.getApp().use(cookieParser());
        //this.getApp().use(lessMiddleware(path.join(APPROOT.path, 'less'), { dest: path.join(APPROOT.path, "public") }));
        this.getApp().use(sassMiddleware({ src: path.join(APPROOT.path, "sass"), dest: path.join(APPROOT.path, "public"), debug: false }));
        this.getApp().use(express.static(path.join(APPROOT.path, 'public')));
    };
    Server.prototype.addRoutes = function () {
        var index = require('./routes/index');
        var download = require('./routes/download');
        var archive = require('./routes/archive');
        var direct = require('./routes/direct');
        var batch = require('./routes/batch');
        this.getApp().use('/', index);
        this.getApp().use('/download', download);
        this.getApp().use('/archive', archive);
        this.getApp().use('/direct', direct);
        this.getApp().use('/batch', batch);
    };
    Server.prototype.addApi = function () {
    };
    Server.prototype.httpServerInit = function () {
        this._server = http.createServer(this.getApp());
        this._server.listen(this.getPort());
        /*this._server.on('error', this.onError);
        this._server.on('listening', this.onListening);*/
    };
    Server.prototype.onError = function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        var bind = 'Port ' + this.getPort();
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
    /**
     * Event listener for HTTP server "listening" event.
     */
    Server.prototype.onListening = function () {
        var addr = this._server.address();
        var bind = 'port ' + addr.port;
        Logging.log('Listening on ' + bind);
    };
    Server.prototype.dbInit = function () {
        DBHandler_1.DBHandler.init();
    };
    Server.prototype.socketIOInit = function () {
        this._io = SocketIO(this._server);
        this._io.attach(this._server);
        SocketHandler.socketHandler(this._io);
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=Server.js.map