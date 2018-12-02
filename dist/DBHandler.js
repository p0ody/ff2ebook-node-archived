"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var Mysql = require("mysql");
var DBHandler;
(function (DBHandler) {
    var db;
    var _isValid;
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
        // Testing if a connection is possible
        db.getConnection(function (err, conn) {
            if (err !== undefined) {
                Logging.alwaysLog("Error connecting to database: " + err.code);
                Logging.alwaysLog("App will now ignore DB calls");
                _isValid = false;
            }
            else {
                Logging.alwaysLog("Connection established to database.");
                _isValid = true;
                conn.destroy();
            }
        });
    }
    DBHandler.init = init;
    function getDB() { return db; }
    DBHandler.getDB = getDB;
    function isValid() {
        return _isValid;
    }
    DBHandler.isValid = isValid;
})(DBHandler = exports.DBHandler || (exports.DBHandler = {}));
//# sourceMappingURL=DBHandler.js.map