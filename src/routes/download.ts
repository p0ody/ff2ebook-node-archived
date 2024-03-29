import * as express from "express";
import * as Logging from "../Logging";
import * as fm from "../FileMgr";
import { DBHandler }  from "../DBHandler";

let router = express.Router();
let _ = require('lodash');


router.param("source", function () {});
router.param("id", function () {});
router.param("type", function () {});


router.get('/:source/:id', function (req, res, next)
{
    res.redirect("/download/" + req.params.source + "/" + req.params.id + "/epub");
});

router.get('/:source/:id/:type', function (req, res, next)
{
    if (req.params.type === undefined)
        req.params.type = "epub";


    if (!_.isString(req.params.source) || !_.isNumber(parseInt(req.params.id)) || !_.isString(req.params.type))
        return res.send("Invalid URL");

    req.params.type = req.params.type.toLocaleLowerCase();

    DBHandler.getDB().query("SELECT * FROM `fic_archive` WHERE `id`=?;", [req.params.id], function (err: any, result: any)
    {
        if (err)
            return res.send("Error while accessing the database, please try again later.");
        else
        {
            if (result.length > 0)
            {
                var filepath = process.env.ARCHIVE_DIR + "/" + req.params.source + "_" + req.params.id + "_" + result[0].updated + "." + req.params.type;
                var filename = result[0].title + "_" + result[0].author + "." + req.params.type;

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