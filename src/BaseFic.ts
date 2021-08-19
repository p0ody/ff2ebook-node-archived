import { Chapter } from "./Chapter";
import * as Logging from "./Logging";
import * as Enums from "./Enums";
import * as typedef from "./typedef";
import * as Async from "async";
import * as request from "request";

export abstract class BaseFic 
{
    private _url: string;
    private _source: Enums.Sources = Enums.Sources.INVALID;
    private _ficId: number;
    private _title: string;
    private _author: string;
    private _authorId: number;
    private _ficType: string;
    private _fandom: string;
    private _summary: string;
    private _publishedDate: number;
    private _updatedDate: number;
    private _wordsCount: number;
    private _chapterCount: number;
    private _pairing: string;
    private _status: string;
    private _pageSource: string[] = []; // pageSource[0] is fic info page
    private _chapters: Chapter[] = [];
    protected _event: any;

    constructor(event: any)
    {
        this._event = event;
    }

    // Setters
    setUrl(url: string) {
        if (!url)
            return this._event.emit("critical", "Invalid url.");

        this._url = url;
    };
    setSource(source: Enums.Sources) { this._source = source; };
    setFicId(id: number) {
        if (!id)
            return this._event.emit("critical", "Invalid ficId.");

        this._ficId = id;
    };
    setTitle(title: string) { this._title = title; };
    setAuthor(author: string) { this._author = author; };
    setAuthorId(id: number) { this._authorId = id; };
    setFicType(type: string) { this._ficType = type; };
    setFandom(fandom: string) { this._fandom = fandom; };
    setSummary(sum: string) { this._summary = sum; };
    setPublishedDate(date: number) { this._publishedDate = date; };
    setUpdatedDate(date: number) { this._updatedDate = date; };
    setWordsCount(count: number) { this._wordsCount = count; };
    setChapterCount(count: number) { this._chapterCount = count; };
    setPairing(pairing: string) { this._pairing = pairing; };
    setStatus(status: string) { this._status = status; };
    setPageSource(num: number, http: string) { this._pageSource[num] = http; };
    setChapters(num: number, chapter: Chapter) { this._chapters[num] = chapter; };

    // Getters
    getUrl(): string { return this._url; };
    getSource(): Enums.Sources { return this._source; };
    getFicId(): number { return this._ficId; };
    getTitle(): string { return this._title; };
    getAuthor(): string { return this._author; };
    getAuthorId(): number { return this._authorId; };
    getFicType(): string { return this._ficType; };
    getFandom(): string { return this._fandom; };
    getSummary(): string { return this._summary; };
    getPublishedDate(): number { return this._publishedDate; };
    getUpdatedDate(): number { return this._updatedDate; };
    getWordsCount(): number { return this._wordsCount; };
    getChapterCount(): number { return this._chapterCount; };
    getPairing(): string { return this._pairing; };
    getStatus(): string { return this._status; };
    getPageSource(num: number): string { return this._pageSource[num]; };
    getChapters(): Chapter[] { return this._chapters; };
    getChapter(num: number): Chapter { return this._chapters[num]; };

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

    abstract gatherFicInfos(completedCallback: async.AsyncResultCallback<any, Error>) : void;
    abstract gatherChaptersInfos(completedCallback: async.AsyncResultCallback<any, Error>) : void;
    abstract getPageSourceCode(chapNum: number, callback: typedef.Callback) : void;
    abstract findId() : number;
    abstract getURL(chapNum: number) : string;
    abstract findChapterInfos(chapNum: number) : Chapter;
    abstract findTitle(source: string) : string;
    abstract findAuthor(source: string) : { name: string, id: number };
    abstract findFicType(source: string) : string;
    abstract findFandom(source: string) : string;
    abstract findSummary(source: string) : string;
    abstract findPublishedDate(source: string) : number;
    abstract findUpdatedDate(source: string) : number;
    abstract findWordsCount(source: string) : number;
    abstract findChapterCount(source: string) : number;
    abstract findPairing(source: string) : string;
    abstract findStatus(source: string) : string;
    abstract findChapterTitle(source: string, chapNum: number) : string;
    abstract findChapterText(source: string) : string;
    abstract isValidFic(source: string) : boolean;

    protected warningEvent(msg: string)
    {
        if (this._event)
            this._event.emit("warning", msg);
    };


}
