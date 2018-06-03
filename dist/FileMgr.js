"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Logging = require("./Logging");
var Epub_1 = require("./Epub");
var fs = require("fs");
var path = require("path");
function createEpub(fic, callback) {
    var epub = new Epub_1.Epub(fic, callback);
}
exports.createEpub = createEpub;
function createMobi(mobipath, callback) {
    //let self = this;
    var exec = require('child_process').execFile;
    var epub = path.basename(path);
    var mobi = process.env.ARCHIVE_DIR + "/" + path.basename(path, ".epub") + ".mobi";
    var next = function () {
        exec(__dirname + "/../bin/kindlegen", [epub], { cwd: "./archive" }, function (err, stdout) {
            fs.stat(mobi, function (err, stats) {
                if (stats === undefined) {
                    //self.error.newError("Error while converting to mobi.");
                    callback("Error while converting to mobi.");
                }
                else {
                    Logging.log("Mobi Ready.");
                    callback(null, mobi);
                }
            });
        });
    };
    fs.stat(mobi, function (err, stats) {
        if (stats !== undefined) {
            fs.unlink(mobi, function (err) {
                if (err) {
                    //self.error.newError("Couldn't delete existing mobi.");
                }
                else {
                    Logging.log(mobi + " Deleted.");
                    next();
                }
            });
        }
        else
            next();
    });
}
exports.createMobi = createMobi;
;
function fileExist(path, callback) {
    fs.stat(path, function (err, stats) {
        if (err)
            callback(false);
        else {
            if (stats.isFile())
                callback(true);
        }
    });
}
exports.fileExist = fileExist;
;
//# sourceMappingURL=FileMgr.js.map