"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var Mysql = require("mysql");
var DBHandler;
(function (DBHandler) {
    var db;
    function init() {
        db = Mysql.createPool({
            host: process.env.SQL_HOST,
            user: process.env.SQL_USER,
            password: process.env.SQL_PASSWORD,
            database: process.env.SQL_DB,
            connectionLimit: 20
        });
        db.on("error", function (err) {
            Logging.trace(err);
        });
    }
    DBHandler.init = init;
    function getDB() { return db; }
    DBHandler.getDB = getDB;
    ;
})(DBHandler = exports.DBHandler || (exports.DBHandler = {}));
//# sourceMappingURL=DBHandler.js.map