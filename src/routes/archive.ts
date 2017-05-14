import * as express from "express";
import * as Logging from "../Logging";
import * as Search from "../Search";


let router = express.Router();

router.param(["search", "page"], function ()
{
});


router.get('/', function (req, res)
{
    res.render('archive');
});

router.get('/:search', function (req, res)
{
    Search.searchFor(req.params.search, 1, function(err, data)
    {
        var results = 0;
        if (err)
            results = err;
        else
            results = data.search;


        res.render("archive", { count: data.count, results: results });
    });
});

router.get('/:search/:page', function (req, res)
{
    Search.searchFor(req.params.search, req.params.page, function(err, data)
    {
        var results = 0;
        if (err)
            results = err;
        else
            results = data.search;


        res.render("archive", { count: data.count, results: results });
    });
});


module.exports = router;