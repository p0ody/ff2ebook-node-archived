import { Chapter } from "./Chapter";
import * as Logging from "./Logging";
import * as Enums from "./Enums";
import * as typedef from "./typedef";
import { BaseFic } from "./BaseFic";
import * as Async from "async";
import * as request from "request";

export class FicFFNET extends BaseFic
{
    gatherFicInfos(completedCallback: Async.AsyncResultCallback<any, any>) : void
    {
        var self = this;
        Async.waterfall([
            function (callback: typedef.Callback) 
            {
                var id = self.findId();
                if (!id)
                    return callback("Couldn't find fic ID.");

                callback(null);
            },
            function (callback: typedef.Callback) 
            {
                self.getPageSourceCode(0, callback);
            },
            function (body: string, callback: typedef.Callback) 
            {
                if (self.isValidFic(body)) 
                {
                    var infos = self.findFicInfos(body);
                    
                    callback(null)
                }
                else
                    callback("Invalid fic URL.");
            }
        ], completedCallback);
    }

    gatherChaptersInfos(completedCallback: Async.AsyncResultCallback<any, any>) : void
    {
        var self = this;
        Async.times(this.getChapterCount() + 1, function(i:number, next: any)
        {
            if (i > 0)
            {
                Async.retry({ times: 3, interval: 0 }, function (callback: Async.AsyncResultCallback<any, any>)
                {
                    Logging.log("Getting chapter #"+ i);
                    self.getPageSourceCode(i, function ()
                    {
                        var chapter = self.findChapterInfos(i);

                        if (!chapter)
                        {
                            self._event.emit("warning", "Error while fetching chapter #" + i + "... Retrying.");
                            callback("Error while fetching chapter #" + i)
                        }
                        else
                            callback(null, chapter);
                    });
                }, function (err: any, chapter: Chapter)
                {
                    if (!err)
                        self.getChapters().push(chapter);

                    self._event.emit("chapReady", self.getChapterCount());
                    next(err);
                });
            }
            else
                next();
        }, completedCallback);
    };

    getPageSourceCode(chapNum: number, callback: typedef.Callback) : void
    {
        var self = this;

        request(this.getURL(chapNum), function (err: any, res: any, body: string)
        {
            if (!err && res.statusCode == 200)
            {
                self.setPageSource(chapNum, body);
                callback(null, body);
            }
            else
            {
                self.setPageSource(chapNum, "");
                callback("Couldn't find page source for Infos page.");
            }
        });
    };

    findId() : number
    {
        if (this.getFicId())
            return this.getFicId();

        if (!this.getUrl())
            return 0;

        var matches = this.getUrl().match(/fanfiction\.net\/s\/([0-9]+)/i);

        if (matches === null)
            return 0;

        let id = parseInt(matches[1]);
        if (!id)
            return 0;

        this.setFicId(id);
        return id;
    };

    getURL(chapNum: number) : string
    {
        if (chapNum === 0)
            return "http://www.fanfiction.net/s/"+ this.getFicId();
        else
        {
            if (chapNum < 0)
                return "";

            return "http://m.fanfiction.net/s/"+ this.getFicId() +"/"+ chapNum;
        }
    };

    findFicInfos(body: string) : void
    {
        this.setTitle(this.findTitle(body));
        var author = this.findAuthor(body);
        this.setAuthor(author.name);
        this.setAuthorId(author.id);
        this.setFicType(this.findFicType(body));
        this.setFandom(this.findFandom(body));
        this.setSummary(this.findSummary(body));
        this.setPublishedDate(this.findPublishedDate(body));
        this.setUpdatedDate(this.findUpdatedDate(body));
        this.setWordsCount(this.findWordsCount(body));
        this.setChapterCount(this.findChapterCount(body));
        this.setPairing(this.findPairing(body));
        this.setStatus(this.findStatus(body));
    };

    findChapterInfos(chapNum: number) : Chapter
    {

        var source = this.getPageSource(chapNum);
        if (source.length <= 0)
        {
            Logging.log("Chap #"+ chapNum +": Invalid source.");
            return new Chapter(-1);
        }

        var chapter = new Chapter(0);

        chapter.chapId = chapNum;
        chapter.title = this.findChapterTitle(source, chapNum);
        chapter.text = this.findChapterText(source);

        if (chapter.text.length === 0)
        {
            Logging.log("Chap #"+ chapNum +": No text found.");
            return new Chapter(-1);
        }

        return chapter;
    };

    findTitle(source: string) : string
    {
        var matches = source.match(/Follow\/Fav<\/button><b class='xcontrast_txt'>(.+?)<\/b>/i);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic title.");
            return "Untitled";
        }

        return matches[1];
    };

    findAuthor(source: string) : { name: string, id: number }
    {
        var matches = source.match(/By:<\/span> <a class='xcontrast_txt' href='\/u\/([0-9]+?)\/.*?'>(.+?)<\/a>/i)

        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic author.");
            return { name: "Unknown", id: 0 };
        }

        let id = parseInt(matches[1]);
        if (!id)
            return { name: "Unknown", id: 0 };

        return { name: matches[2], id: id };
    };

    findFicType(source: string) : string
    {
        var matches = source.match(/<a class=xcontrast_txt href='.*?'>(.+?)<\/a><span class='xcontrast_txt icon-chevron-right xicon-section-arrow'><\/span><a class=xcontrast_txt href=.*?>(.+?)<\/a>/i)
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic type.");
            return "";
        }

        return matches[1] +"/"+ matches[2];
    };

    findFandom(source: string) : string
    {
        var matches = source.match(/<title>.+?, a (.+?) fanfic | FanFiction<\/title>/i);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic fandom.");
            return "";
        }

        return matches[1];

    };

    findSummary(source: string) : string
    {
        var matches = source.match(/<div style='margin-top:2px' class='xcontrast_txt'>(.+?)<\/div>/i);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic summary.");
            return "";
        }

        return matches[1];

    };

    findPublishedDate(source: string) : number
    {
        var matches = source.match(/Published: <span data-xutime='([0-9]+?)'>.*?<\/span>/i);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic published date.");
            return -1;
        }

        let date = parseInt(matches[1]); 
        if (!date)
            return -1;

        return date;
    };

    findUpdatedDate(source: string) : number
    {
        var matches = source.match(/Updated: <span data-xutime='([0-9]+?)'>.*?<\/span>/i);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic last updated date.");
            return this.getPublishedDate();
        }

        let date = parseInt(matches[1]); 
        if (!date)
            return -1;

        return date;
    };

    findWordsCount(source: string) : number
    {
        var matches = source.match(/- Words: (.+?) -/i);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic last updated date.");
            return 0;
        }

        let count = parseInt(matches[1]); 
        if (!count)
            return -1;

        return count;
    };

    findChapterCount(source: string)
    {
        var matches = source.match(/<option  value=.+?>/gi);
        if (matches === null)
            return 1;

        return matches.length / 2; // Dividing by 2 because there is a chapter selection on top and bottom of page
    };

    findPairing(source: string) : string
    {
        var matches = source.match(/target='rating'>.+?<\/a> - .*?-  (.+?) -/gi);
        if (matches === null)
        {
            this.warningEvent("Coulnd't find fic pairing.");
            return "";
        }

        return matches[1];
    }

    findStatus(source: string) : string
    {
        var matches = source.match(/- Status: Complete -/i);
        if (matches === null)
            return "In progress";

        return "Completed";
    };

    findChapterTitle(source: string, chapNum: number) : string
    {
        var matches = source.match(/Chapter [0-9]+?: (.+?)<br><\/div><div role='main' aria-label='story content' style='font-size:1.1em;'>/i);
        if (matches === null)
            return "Chapter "+ chapNum;

        return matches[1];
    };

    findChapterText(source: string) : string
    {
        var matches = source.match(/<div style='padding:5px 10px 5px 10px;' class='storycontent nocopy' id='storycontent' >([\s\S]+?)<\/div>/i);
        if (matches === null)
            return "";

        return matches[1];
    };

    isValidFic(source: string) : boolean
    {
        var matches = source.match(/<span class='gui_warning'>Story Not Found/i);
        if (matches === null)
            return true;

        return false;
    };

}
