
export class Chapter
{
    private _chapId: number = 0;
    private _text: string = "";
    private _title: string = "";

    constructor(id: number = -1, text?: string, title?: string) // Chapter -1 mean an error has occured while fetching data
    {
        this.chapId = id;

        if (text)
            this.text = text;
        
        if (title)
            this.title = title;
    }

    set chapId(num: number) { this._chapId = num; }
    set text(text: string) { this._text = text; }
    set title(title: string) { this._title = title; }

    get chapId() { return this._chapId; }
    get text() { return this._text; }
    get title() { return this._title; }


    isValid() : boolean
    {
        if (this.chapId === -1)
            return false;

        if (this.text.length === 0)
            return false;

        if (this.title.length === 0)
            return false;

        return true;
    }

}