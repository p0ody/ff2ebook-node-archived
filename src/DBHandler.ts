import * as Logging from "./Logging";
import * as Mysql from "mysql";

export namespace DBHandler
{
    let db: Mysql.IPool;
    let _isValid: boolean;


    export function init() : void
    {
        
        db = Mysql.createPool(
        {
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB,
            connectionLimit : 20
        });
        db.on("error", function(err: Mysql.IError)
        {
            Logging.trace(err);
        });

        // Testing if a connection is possible
        db.getConnection(function(err: Mysql.IError, conn: Mysql.IConnection)
        {
            if (err)
            {
                Logging.alwaysLog("Error connecting to database: "+ err.code);
                Logging.alwaysLog("App will now ignore DB calls");
                _isValid = false;
            }
            else
            {
                Logging.alwaysLog("Connection established to database.");
                _isValid = true;
                conn.destroy();
            }
        });
    }

    export function getDB(): Mysql.IPool { return db; }

    export function isValid(): boolean
    {
       return _isValid;
    }
}




