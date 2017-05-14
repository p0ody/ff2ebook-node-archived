import * as express from "express";
import * as path from "path";
import * as favicon from "serve-favicon";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as http from "http";
let lessMiddleware = require("less-middleware");
import { DBHandler } from "./DBHandler";
import * as SocketHandler from "./SocketHandler";
import * as constValue from "./constValue";
import * as Logging from "./Logging";
import * as APPROOT from "app-root-path"
import * as SocketIO from "socket.io";

export class Server
{
    private _app: express.Application;
    private _server: http.Server;
    private _port: number;
    private _io: SocketIO.Server;
    private _livereload: any;

    constructor()
    {
        this._app = express();
        if (!this.setPort(process.env.PORT))
        {
            Logging.alwaysLog("Invalid port, defaulting to 8000.")
            this.setPort(8000);
        }

        this.execConfig();
        this.addRoutes();
        this.addApi();
        this.httpServerInit();
        this.dbInit();
        this.socketIOInit();
        
        Logging.alwaysLog("Server now listening on port "+ this.getPort());
    }

    getApp(): express.Application { return this._app; };
    getPort(): number { return this._port; };

    setPort(port: number): boolean 
    { 
        
        if (port > constValue.MAX_PORT || port < 0)
            return false;

        this._port = port;
        return true;
    };

    execConfig()
    {
        // uncomment after placing your favicon in /public
        //this.getApp().use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
        this.getApp().set("port", this.getPort());
        this.getApp().set('views', path.join(APPROOT.path, 'views'));
        this.getApp().set('view engine', 'ejs');
        this.getApp().use(logger('dev'));
        this.getApp().use(bodyParser.json());
        this.getApp().use(bodyParser.urlencoded({ extended: false }));
        this.getApp().use(cookieParser());
        this.getApp().use(lessMiddleware(path.join(APPROOT.path, 'public')));
        this.getApp().use(express.static(path.join(APPROOT.path, 'public')));
        

    }

    addRoutes()
    {
        let index = require('./routes/index');
        let download = require('./routes/download');
        let archive = require('./routes/archive');
        let direct = require('./routes/direct');
        let batch = require('./routes/batch');
        this.getApp().use('/', index);
        this.getApp().use('/download', download);
        this.getApp().use('/archive', archive);
        this.getApp().use('/direct', direct);
        this.getApp().use('/batch', batch);
    }

    addApi()
    {

    }

    httpServerInit()
    {
        this._server = http.createServer(this.getApp());
        this._server.listen(this.getPort());
        /*this._server.on('error', this.onError);
        this._server.on('listening', this.onListening);*/


    }

    private onError(error: any)
    {
        if (error.syscall !== 'listen') 
        {
            throw error;
        }

        var bind = 'Port ' + this.getPort();

        // handle specific listen errors with friendly messages
        switch (error.code) 
        {
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
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    private onListening() 
    {
        var addr = this._server.address();
        var bind = 'port ' + addr.port;
        Logging.alwaysLog('Listening on ' + bind);
    }

    private dbInit()
    {
        DBHandler.init();
    }

    private socketIOInit()
    {
        this._io = SocketIO(this._server);
        this._io.attach(this._server);
        SocketHandler.socketHandler(this._io);
    }
}