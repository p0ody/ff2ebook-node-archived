"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var Search = require("../Search");
var router = express.Router();
router.param(["search", "page"], function () {
});
router.get('/', function (req, res) {
    res.render('archive');
});
router.get('/:search', function (req, res) {
    Search.searchFor(req.params.search, 1, function (err, data) {
        var results = 0;
        if (err)
            results = err;
        else
            results = data.search;
        res.render("archive", { count: data.count, results: results });
    });
});
router.get('/:search/:page', function (req, res) {
    Search.searchFor(req.params.search, req.params.page, function (err, data) {
        var results = 0;
        if (err)
            results = err;
        else
            results = data.search;
        res.render("archive", { count: data.count, results: results });
    });
});
module.exports = router;
//# sourceMappingURL=archive.js.map