"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Chapter = (function () {
    function Chapter(id, text, title) {
        if (id === void 0) { id = -1; }
        this._chapId = 0;
        this._text = "";
        this._title = "";
        this.chapId = id;
        if (text)
            this.text = text;
        if (title)
            this.title = title;
    }
    Object.defineProperty(Chapter.prototype, "chapId", {
        get: function () { return this._chapId; },
        set: function (num) { this._chapId = num; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chapter.prototype, "text", {
        get: function () { return this._text; },
        set: function (text) { this._text = text; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chapter.prototype, "title", {
        get: function () { return this._title; },
        set: function (title) { this._title = title; },
        enumerable: true,
        configurable: true
    });
    Chapter.prototype.isValid = function () {
        if (this.chapId === -1)
            return false;
        if (this.text.length === 0)
            return false;
        if (this.title.length === 0)
            return false;
        return true;
    };
    return Chapter;
}());
exports.Chapter = Chapter;
//# sourceMappingURL=Chapter.js.map