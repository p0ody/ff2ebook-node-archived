import * as Enums from "./Enums";
import * as Utils from "./Utils";
import * as Logging from "./Logging";

export class FicInfos
{
    _ficId: number;
    _source: Enums.Sources;
    _url: string;
    _forceUpdate: boolean;
    _fileType: Enums.FileType;
    _sendEmail: boolean;
    _emailAddress: string;

    constructor(map?: { ficId?: number, source?: Enums.Sources, url?: string, forceUpdate?: boolean, fileType?: Enums.FileType | string, sendEmail?: boolean, emailAddress?: string })
    {
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



    set ficId(id: number) { this._ficId = id; };
    set source(source: Enums.Sources) { this._source = source; };
    set url(url: string) { this._url = url; };
    set forceUpdate(force: boolean) { this._forceUpdate = force; };
    set fileType(type: Enums.FileType) { this._fileType = type; };
    set sendEmail(send: boolean) { this._sendEmail = send; };
    set emailAddress(email: string) { this._emailAddress = email; };

    get ficId(): number { return this._ficId; };
    get source(): Enums.Sources { return this._source; };
    get url(): string { return this._url; };
    get forceUpdate(): boolean { return this._forceUpdate; };
    get fileType(): Enums.FileType { return this._fileType; };
    get sendEmail(): boolean { return this._sendEmail; };
    get emailAddress(): string { return this._emailAddress; };
}
