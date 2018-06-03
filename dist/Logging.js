"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function log(msg) {
    if (process.env.NODE_ENV === 'development')
        console.log(msg);
}
exports.log = log;
function trace(trace) {
    if (process.env.NODE_ENV === 'development')
        console.trace(trace);
}
exports.trace = trace;
function alwaysLog(msg) {
    console.log(msg);
}
exports.alwaysLog = alwaysLog;
//# sourceMappingURL=Logging.js.map