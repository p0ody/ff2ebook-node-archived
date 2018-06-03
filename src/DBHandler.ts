import * as Logging from "./Logging";
import * as Mysql from "mysql";

export namespace DBHandler
{
    let db: any;


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
        db.on("error", function(err: any)
        {
            Logging.trace(err);
        });
    }

    export function getDB(): any { return db; };
}




