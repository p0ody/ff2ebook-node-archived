import * as Logging from "./Logging";


export class ErrorHandler
{
    self = this;
    socket: any;
    constructor(socket: any)
    {
        this.socket = socket;
    }

    newError(msg: string)
    {
        this.socket.emit("critical", msg);
        Logging.log("Error: "+ msg);
    }

    newWarning(msg: string)
    {
        this.socket.emit("warning", msg);
        Logging.log("Warning: "+ msg);
    }

}