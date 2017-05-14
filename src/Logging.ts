export function log(msg: any) : void
{
    if (process.env.NODE_ENV === 'development')
        console.log(msg);
}

export function trace(trace: any) : void
{
    if (process.env.NODE_ENV === 'development')
        console.trace(trace);
}

export function alwaysLog(msg: any) : void
{
    console.log(msg);
}