"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child = require("child_process");
function exec(command) {
    return new Promise(function (resolve, reject) {
        child.exec(command, { maxBuffer: Math.pow(1024, 4) }, function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
}
exports.exec = exec;
//# sourceMappingURL=exec.js.map