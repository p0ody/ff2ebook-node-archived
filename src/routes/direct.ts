import * as express from "express";
import * as Logging from "../Logging";
import { Fic } from "../Fic";
import * as Events from "events";
import { FicEventHandler } from "../FicEventHandler";
import { FicInfos } from "../FicInfos";

let router = express.Router();


router.param("source", function () {});
router.param("id", function () {});
router.param("type", function () {});

router.get('/', function (req, res)
{
    res.redirect("/direct/doc");
});

router.get('/doc', function (req, res)
{
  res.render("doc");
});

router.get("/:source/:id", function(req, res)
{
    res.redirect("/direct/"+ req.params.source +"/"+ req.params.id +"/epub");
});

router.get('/:source/:id/:type', function (req, res, next)
{
    var infos =
    {
        source: req.params.source,
        ficId: req.params.id,
        fileType: req.params.type
    };

    var handler = initEventHandler(res);

    handler.getEvent().emit("convertStart", infos);
});

function initEventHandler(res: any)
{
    var event = new Events.EventEmitter();
    var handler = new FicEventHandler();

    // Override abstract functions
    handler.onStart = function(data)
    {
        var fic = new Fic(handler.getEvent());
        var values =
        {
            source: data.source,
            ficId: data.ficId,
            fileType: data.fileType
        };


        fic.start(new FicInfos(values));
    };

    handler.onError = function(msg)
    {
        Logging.log("Error: "+ msg);
        res.send("Error: "+ msg);
    };

    handler.onFileReady = function(infos)
    {
        res.redirect("/download/" + infos.source + "/" + infos.id + "/" + infos.fileType);
    };

    handler.bindEvent(event);

    return handler;
}

module.exports = router;