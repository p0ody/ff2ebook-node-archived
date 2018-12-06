import * as express from "express";
import * as Logging from "../Logging";
import * as fm from "../FileMgr";
import * as Utils from "../Utils";
import { DBHandler }  from "../DBHandler";

let router = express.Router();
let _ = require('lodash');


router.param(["source", "id", "type"], function ()
{
});

router.get('/:source/:id', function (req, res, next)
{
    res.redirect("/download/" + req.params.source + "/" + req.params.id + "/epub");
});

router.get('/:source/:id/:type', function (req, res, next)
{
    if (req.params.type === undefined)
        req.params.type = "epub";


    if (typeof req.params.source !== "string" || typeof _.toNumber(req.params.id) !== "number" || typeof req.params.type !== "string")
        return res.send("Invalid URL");

    if (!Utils.isValidSource(req.params.source))
        return res.send("Invalid source");

    if (!Utils.isValidFileTypeString(req.params.type))
        return res.send("Invalid filetype");

    req.params.type = req.params.type.toLocaleLowerCase();

    DBHandler.getDB().query("SELECT * FROM `fic_archive` WHERE `id`=? AND `site`=?;", [req.params.id, req.params.source], function (err: any, result: any)
    {
        if (err)
            return res.send("Error while accessing the database, please try again later.");
        else
        {
            if (result.length > 0)
            {
                let filename = result[0].site + "_" + result[0].id + "_" + result[0].updated + "." + req.params.type;
                let filepath = process.env.ARCHIVE_DIR + "/"+ filename;
                

                fm.fileExist(filepath, function (exist)
                {
                    if (exist)
                        return res.download(filepath, filename);
                    else
                    {
                        if (req.params.type == "mobi")
                        {
                            // Check if epub exist, if so, convert to mobi
                            var epub = filepath.substr(0, filepath.length - 4) + "epub";
                            fm.fileExist(epub, function (exist)
                            {
                                if (exist)
                                {
                                    fm.createMobi(epub, function (err, mobi)
                                    {
                                        if (err)
                                            return res.send("Epub exist but couldn't convert epub to mobi.");
                                        else
                                            return res.download(mobi, filename);
                                    });
                                }
                                else
                                    return res.send("File was found in database, but not on server.");
                            });

                        }

                    }
                });
            }
            else
                return res.send("File not found in database.");
        }
    });
});

module.exports = router;