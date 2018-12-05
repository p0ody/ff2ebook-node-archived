import * as Logging from "./Logging";
import { ErrorHandler } from "./ErrorHandler";
import { Fic } from "./Fic";
import { BaseFic } from "./BaseFic";
import { Epub } from "./Epub";
let fs = require("fs");
let path = require("path");

export function createEpub(fic: BaseFic, callback: (a?: any, b?:any) => void) : void
{
    let epub = new Epub(fic, callback);
}

export function createMobi(mobipath: string, callback: (a?: any, b?:any) => void) : void
{
    //let self = this;
    let exec = require('child_process').execFile;
    let epub = path.basename(mobipath);
    let mobi = process.env.ARCHIVE_DIR +"/"+ path.basename(mobipath, ".epub") + ".mobi";

    let next = function()
    {
        exec(__dirname + "/../bin/kindlegen", [epub], {cwd: "./archive"}, function(err: any, stdout: any)
        {
            fs.stat(mobi, function(err: any, stats: any)
            {
                if (stats === undefined)
                {
                    //self.error.newError("Error while converting to mobi.");
                    callback("Error while converting to mobi.");
                }
                else
                {
                    Logging.log("Mobi Ready.");
                    callback(null, mobi);
                }
            });

        });
    };

    fs.stat(mobi, function(err: any, stats: any)
    {
        if (stats !== undefined)
        {
            fs.unlink(mobi, function(err: any)
            {
                if (err)
                {
                    //self.error.newError("Couldn't delete existing mobi.");
                }
                else
                {
                    Logging.log(mobi + " Deleted.");
                    next();
                }
            })
        }
        else
            next();
    });
};

export function fileExist(path: string, callback: (a?: any, b?: any) => void)
{
    fs.stat(path, function(err: any, stats: any)
    {
        if (err)
            callback(false);
        else
        {
            if (stats.isFile())
                callback(true);
        }

    });
};
