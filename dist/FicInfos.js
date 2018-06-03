"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Enums = require("./Enums");
var Utils = require("./Utils");
var FicInfos = (function () {
    function FicInfos(map) {
        if (map === undefined)
            return;
        if (typeof map.source === "string")
            map.source = Utils.sourceFromString(map.source);
        if (typeof map.fileType === "string")
            map.fileType = Utils.fileTypeFromString(map.fileType);
        this.ficId = (map.ficId === undefined) ? -1 : map.ficId;
        this.source = (map.source === undefined) ? Enums.Sources.INVALID : map.source;
        this.url = (map.url === undefined) ? "" : map.url;
        this.forceUpdate = (map.forceUpdate === undefined) ? false : map.forceUpdate;
        this.fileType = (map.fileType === undefined) ? Enums.FileType.EPUB : map.fileType;
        this.sendEmail = (map.sendEmail === undefined) ? false : map.sendEmail;
        this.emailAddress = (map.emailAddress === undefined) ? "" : map.emailAddress;
    }
    Object.defineProperty(FicInfos.prototype, "ficId", {
        get: function () { return this._ficId; },
        set: function (id) { this._ficId = id; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(FicInfos.prototype, "source", {
        get: function () { return this._source; },
        set: function (source) { this._source = source; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(FicInfos.prototype, "url", {
        get: function () { return this._url; },
        set: function (url) { this._url = url; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(FicInfos.prototype, "forceUpdate", {
        get: function () { return this._forceUpdate; },
        set: function (force) { this._forceUpdate = force; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(FicInfos.prototype, "fileType", {
        get: function () { return this._fileType; },
        set: function (type) { this._fileType = type; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(FicInfos.prototype, "sendEmail", {
        get: function () { return this._sendEmail; },
        set: function (send) { this._sendEmail = send; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(FicInfos.prototype, "emailAddress", {
        get: function () { return this._emailAddress; },
        set: function (email) { this._emailAddress = email; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    ;
    return FicInfos;
}());
exports.FicInfos = FicInfos;
//# sourceMappingURL=FicInfos.js.map