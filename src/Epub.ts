import * as Logging from "./Logging";
import { ErrorHandler } from "./ErrorHandler";
import * as Utils from "./Utils";
import { Fic } from "./Fic";
import { BaseFic } from "./BaseFic";
import * as typedef from "./typedef";
let async = require("async");
let tidy = require("htmltidy2").tidy;
let EpubGen = require("epub-generator");
let fs = require("fs");


// HTML Tidy options
let tidyOpts = {
    doctype: 'xhtml',
    indent: true,
    "indent-spaces": 4,
    clean: true
};

class EpubFile
{
    private _content: string;
    private _filePath: string;
    private _title: string | undefined;
    private _order: number;
    private _fileType: string;

    constructor(content: string, path: string, type: string, title?: string, order?: number)
    {
        this._content = content;
        this._filePath = path;
        this._title = title;
        this._order = (order === undefined) ? 0 : order;
        this._fileType = type;
    }

    setContent(content: string) { this._content = content; };
    setFilePath(path: string) { this._filePath = path; };
    setTitle(title: string) { this._title = title; };
    setOrder(order: number) { this._order = order; };
    setFileType(filetype: string) { this._fileType = filetype; };

    getContent() { return this._content; };
    getFilePath() { return this._filePath; };
    getTitle() { return this._title; };
    getOrder() { return this._order; };
    getFileType() { return this._fileType; };
}


export class Epub
{
    private _epubPath: string;
    private _content: EpubFile[] = [];
    private _fic: BaseFic;
    private _epub: any = false; // Set to EpubGen
    private _callback: any;

    constructor(fic: BaseFic, callback: typedef.Callback)
    {
        this.setEpubPath(process.env.ARCHIVE_DIR +"/"+ Utils.sourceToShortString(fic.getSource()) +"_"+ fic.getFicId() +"_"+ fic.getUpdatedDate() +".epub");
        this.setFic(fic);
        this._callback = callback;

        this.createEpub();
    }

    setEpubPath(path: string) { this._epubPath = path; };
    setContents(content: EpubFile[]) { this._content = content; };
    setFic(fic: BaseFic) { this._fic = fic; };
    setCallback(cb: typedef.Callback) { this._callback = cb; };
    setEpub(epub: any) { this._epub = epub; };

    getEpubPath(): string { return this._epubPath; };
    getContents(): EpubFile[] { return this._content; };
    getFic(): BaseFic { return this._fic; };
    sendCallback(err: any, succ?: any): void { this._callback(err, succ); };
    getEpub(): any { return this._epub; };

    createEpub()
    {
        let self = this;

        async.series([
            function(callback: any) // Check to see if dir exist
            {
                fs.stat(process.env.ARCHIVE_DIR, function(err: any, stats: any)
                {
                    if (!stats)
                    {
                        fs.mkdir(process.env.ARCHIVE_DIR, function (err: any)
                        {
                            if (err)
                                self.sendCallback("Couldn't create archive dir.");

                            Logging.log("Dir created");
                        });
                    }
                });
                callback(null);
            },
            function(callback: any) // Check if epub already exist, if so delete
            {
                fs.stat(self.getEpubPath(), function(err: any, stats: any)
                {
                    if (stats !== undefined)
                    {
                        fs.unlink(self.getEpubPath(), function(err: any)
                        {
                            if (err)
                                self.sendCallback("Couldn't delete existing epub.");
                            else
                                Logging.log(self.getEpubPath() +" Deleted.");
                        })
                    }
                });
                callback(null);
            }], self.genTitlePage());
    };

    
    genTitlePage()
    {
        let self = this;
        fs.readFile("./blanks/title.xhtml", 'utf8', function(err: any, data: any)
        {
            if (err)
                self.sendCallback("Couldn't read title.xhtml.");
            else
            {
                var find = [ "%title%", "%titleLink%", "%author%", "%fandom%", "%summary%", "%status%", "%ficType%", "%pairing%", "%published%", "%updated%", "%wordsCount%", "%chapCount%", "%convertDate%" ];
                var replace = [
                    self.getFic().getTitle(),
                    Utils.genFicUrl(self.getFic().getSource(), self.getFic().getFicId(), self.getFic().getTitle()),
                    Utils.genAuthorURL(self.getFic().getSource(), self.getFic().getAuthorId(), self.getFic().getAuthor()),
                    Utils.formatValue("Fandom", self.getFic().getFandom()),
                    Utils.formatValue("Summary", self.getFic().getSummary()),
                    Utils.formatValue("Status", self.getFic().getStatus()),
                    Utils.formatValue("FicType", self.getFic().getFicType()),
                    Utils.formatValue("Pairing/Main char.", self.getFic().getPairing()),
                    Utils.formatValue("Published date", Utils.getDateYYYYMMDD(new Date(self.getFic().getPublishedDate()*1000))),
                    Utils.formatValue("Updated date", Utils.getDateYYYYMMDD(new Date(self.getFic().getUpdatedDate()*1000))),
                    Utils.formatValue("Words count", self.getFic().getWordsCount()),
                    Utils.formatValue("Chapter count", self.getFic().getChapterCount()),
                    Utils.getDateYYYYMMDD(new Date())
                ];

                tidy(Utils.stringReplaceWithArray(data, find, replace), tidyOpts, function(err: any, html: any)
                {
                    if (err)
                        self.sendCallback("Couldn't use htmltidy on title page.");
                    else
                    {
                        self.getContents().push(new EpubFile(html, "Content/title.xhtml", "xhtml", "Title Page", 1));
                        self.genChaptersPages();
                    }
                });
            }
        });
    };

    
    genChaptersPages()
    {
        let self = this;
        fs.readFile("./blanks/chapter.xhtml", 'utf8', function(err: any, data: any)
        {
            if (err)
                self.sendCallback("Couldn't read chapter.xhtml.");
            else
            {
                async.each(self.getFic().getChapters(), function(chap: any, callback: any)
                {
                    if (chap)
                    {
                        var find = ["%title%", "%chapNum%", "%body%"];
                        var replace = [chap.title, chap.chapId, chap.text];

                        tidy(Utils.stringReplaceWithArray(data, find, replace), tidyOpts, function (err: any, html: any)
                        {
                            if (err)
                            {
                                self.sendCallback("Couldn't tidy chapter #" + chap.chapId);
                                callback(err);
                            }
                            else
                            {
                                self.getContents().push(new EpubFile(html, "Content/chapter" + chap.chapId + ".xhtml", "xhtml", chap.title, parseInt(chap.chapId) + 1));
                                callback(null);
                            }
                        });
                    }
                    else
                        callback(null);

                }, function() {
                    Logging.log("Tidy finished");
                    self.genStyle();
                });
            }
        });
    };

    genStyle()
    {
        var self = this;

        fs.readFile("./blanks/style.css", 'utf8', function(err:any , data: any)
        {
            if (err)
            {
                self.sendCallback("Couldn't read content.opf.");
            }
            else
            {
                self._content.push(new EpubFile(data, "Styles/style.css", "css"));
                self.createFile();
            }
        });

    };

    createFile(err?: any)
    {
        if (err)
        {
            this.sendCallback("Error while generating files.");
        }

        let self = this;
        
        Logging.log("Starting file creation...");

        this.setEpub(new EpubGen({
            title: self.getFic().getTitle(),
            author: self.getFic().getAuthor()
        }));


        let content = this.getContents().sort(function(a: EpubFile, b: EpubFile)
        {
            return a.getOrder() - b.getOrder();
        });


        content.forEach(function(value)
        {
            self.getEpub().add(value.getFilePath(), value.getContent(), { title: value.getTitle(), toc: value.getFileType() == "xhtml" });
        });

        self.getEpub().end().pipe(fs.createWriteStream(self.getEpubPath()));

        self.getEpub().on('error', function(err: any)
        {
            Logging.trace(err);
        });

        self.getEpub().on("finish", function()
        {
            Logging.log("Epub ready.");
            self.sendCallback(null, self.getEpubPath());
        });
    };

}
