import * as Enums from "./Enums";
import * as Logging from "./Logging";
let _ = require('lodash');


export function genFicUrl(source: Enums.Sources, id: number, linkText: string) {
    switch (source) {
        case Enums.Sources.FFNET:
            return "<a href=\"https://www.fanfiction.net/s/" + id + "\">" + linkText + "</a>";

        default:
            return linkText;
    }
}

export function genAuthorURL(source: Enums.Sources, id: number, linkText: string) 
{
    switch (source) {
        case Enums.Sources.FFNET:
            return "<a href=\"https://www.fanfiction.net/u/" + id + "\">" + linkText + "</a>";

        default:
            return linkText;
    }
}

export function findSource(url: string): Enums.Sources 
{
    if (url.search("fanfiction.net") > -1)
        return Enums.Sources.FFNET;

    if (url.search("fictionpress.com") > -1)
        return Enums.Sources.FPCOM;

    if (url.search("harrypotterfanfiction.com") > -1)
        return Enums.Sources.HPFF;

    return Enums.Sources.INVALID;
}

export function isValidSource(source: number | string): boolean 
{
    if (typeof source === "number")
        return (source > Enums.Sources.INVALID && source < Enums.Sources.SOURCES_MAX)

    return sourceFromString(<string>source) != Enums.Sources.INVALID;
}


export function sourceToShortString(source: Enums.Sources): string 
{
    switch (source) 
    {
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

export function sourceToString(source: Enums.Sources): string 
{
    switch (source) 
    {
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

export function sourceFromString(source: string): Enums.Sources
{
    source = source.toLowerCase();
    switch (source) 
    {
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

export function getDateYYYYMMDD(date: Date)
{
    return date.toISOString().substring(0, 10);
}

export function formatValue(header: string, value: any): string
{
    if (!value)
        return "";

    return "<span class=\"bold\">"+ header +":</span> "+ value +"<br /><br />";
}

export function fileTypeFromString(type: string): Enums.FileType
{
    type = type.toLocaleLowerCase();
    switch(type)
    {
        case "epub":
            return Enums.FileType.EPUB;
        
        case "mobi":
            return Enums.FileType.MOBI;

        default:
            return Enums.FileType.INVALID;
    }
};

export function fileTypeToString(type: Enums.FileType): string
{
    switch(type)
    {
        case Enums.FileType.EPUB:
            return "epub";
        
        case Enums.FileType.MOBI:
            return "mobi";

        default:
            return "invalid";
    }

};

export function isValidFileTypeString(type: string)
{
    return fileTypeFromString(type) !== Enums.FileType.INVALID;
}

export function stringReplaceWithArray(str: string, find: any[], replace: any[]) : string
{
    var replaceString = str;
    var regex;
    for (var i = 0; i < find.length; i++) 
    {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    return replaceString;
};