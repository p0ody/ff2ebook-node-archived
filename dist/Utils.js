"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums = require("./Enums");
function genFicUrl(source, id, linkText) {
    switch (source) {
        case Enums.Sources.FFNET:
            return "<a href=\"https://www.fanfiction.net/s/" + id + "\">" + linkText + "</a>";
        default:
            return linkText;
    }
}
exports.genFicUrl = genFicUrl;
function genAuthorURL(source, id, linkText) {
    switch (source) {
        case Enums.Sources.FFNET:
            return "<a href=\"https://www.fanfiction.net/u/" + id + "\">" + linkText + "</a>";
        default:
            return linkText;
    }
}
exports.genAuthorURL = genAuthorURL;
function findSource(url) {
    if (url.search("fanfiction.net") > -1)
        return Enums.Sources.FFNET;
    if (url.search("fictionpress.com") > -1)
        return Enums.Sources.FPCOM;
    if (url.search("harrypotterfanfiction.com") > -1)
        return Enums.Sources.HPFF;
    return Enums.Sources.INVALID;
}
exports.findSource = findSource;
function isValidSource(source) {
    return (source > Enums.Sources.INVALID && source < Enums.Sources.SOURCES_MAX);
}
exports.isValidSource = isValidSource;
function sourceToShortString(source) {
    switch (source) {
        case Enums.Sources.FFNET:
            return "ffnet";
        case Enums.Sources.FPCOM:
            return "fpnet";
        case Enums.Sources.HPFF:
            return "hpff";
        default:
            return "invalid";
    }
}
exports.sourceToShortString = sourceToShortString;
function sourceToString(source) {
    switch (source) {
        case Enums.Sources.FFNET:
            return "FanFiction.net";
        case Enums.Sources.FPCOM:
            return "FictionPress.com";
        case Enums.Sources.HPFF:
            return "HarryPotterFanFiction.com";
        default:
            return "invalid";
    }
}
exports.sourceToString = sourceToString;
function sourceFromString(source) {
    source = source.toLowerCase();
    switch (source) {
        case "fanfiction.net":
        case "ffnet":
            return Enums.Sources.FFNET;
        case "fictionpress.com":
        case "fpcom":
            return Enums.Sources.FPCOM;
        case "harrypotterfanfiction.com":
        case "hpff":
            return Enums.Sources.HPFF;
        default:
            return Enums.Sources.INVALID;
    }
}
exports.sourceFromString = sourceFromString;
function getDateYYYYMMDD(date) {
    return date.toISOString().substring(0, 10);
}
exports.getDateYYYYMMDD = getDateYYYYMMDD;
function formatValue(header, value) {
    if (!value)
        return "";
    return "<span class=\"bold\">" + header + ":</span> " + value + "<br /><br />";
}
exports.formatValue = formatValue;
function fileTypeFromString(type) {
    type = type.toLocaleLowerCase();
    switch (type) {
        case "epub":
            return Enums.FileType.EPUB;
        case "mobi":
            return Enums.FileType.MOBI;
        default:
            return Enums.FileType.INVALID;
    }
}
exports.fileTypeFromString = fileTypeFromString;
;
function fileTypeToString(type) {
    switch (type) {
        case Enums.FileType.EPUB:
            return "epub";
        case Enums.FileType.MOBI:
            return "mobi";
        default:
            return "invalid";
    }
}
exports.fileTypeToString = fileTypeToString;
;
function stringReplaceWithArray(str, find, replace) {
    var replaceString = str;
    var regex;
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
}
exports.stringReplaceWithArray = stringReplaceWithArray;
;
//# sourceMappingURL=Utils.js.map