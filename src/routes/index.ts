import * as express from "express";
import * as Logging from "../Logging";

let router = express.Router();

router.get('/', function (req, res, next)
{
    let epub, mobi, autoDownload, sendEmail = "";

    if (req.cookies.autoDL !== undefined)
        autoDownload = (req.cookies.autoDL.toUpperCase() == "TRUE") ? "checked" : "";

    if (req.cookies.sendEmail !== undefined)
        sendEmail = (req.cookies.sendEmail.toUpperCase() == "TRUE") ? "checked" : "";

    let fileType = req.cookies.fileType;
    if (fileType !== undefined)
    {
        switch (fileType.toUpperCase())
        {
            case "EPUB":
                epub = "selected";
                break;
            
            case "MOBI":
                mobi = "selected";
                break;
        }
    }
    
    
    res.render('index', 
        {
            autoDL: autoDownload,
            typeEpub: epub,
            typeMobi: mobi,
            sendEmail: sendEmail,
            emailAddress: req.cookies.email
        });
});

router.post('/setCookie', function (req, res, next)
{
    res.cookie("autoDL", req.body.autoDL);
    res.cookie("fileType", req.body.fileType);
    res.cookie("sendEmail", req.body.sendEmail);
    res.cookie("email", req.body.email);
    res.send("Cookie set.");
})

module.exports = router;