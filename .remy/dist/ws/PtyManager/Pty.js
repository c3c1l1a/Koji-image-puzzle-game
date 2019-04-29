"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var NodePty = require("node-pty");
var uuid = require("uuid");
var Pty = /** @class */ (function () {
    function Pty(id, cwd, name, username) {
        var _this = this;
        this.frames = [];
        this.onData = null;
        this.onExit = null;
        this.id = id;
        this.name = name;
        // console.log('initializing pty', this.id, this.name);
        this.proc = NodePty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 30,
            cwd: cwd,
            env: __assign({}, process.env, { PS1: String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["[[]", "@koji]$[ ]"], ["\\[[\\]", "@koji]$\\[ \\]"])), username) }),
        });
        this.proc.on('data', function (value) {
            var frame = {
                frameId: uuid.v4(),
                value: Buffer.from(value, 'binary').toString('base64'),
            };
            _this.frames.push(frame);
            if (_this.onData) {
                _this.onData(frame);
            }
        });
        this.proc.on('exit', function (code) {
            if (_this.onExit) {
                _this.onExit(code);
            }
        });
    }
    Object.defineProperty(Pty.prototype, "socketExpression", {
        get: function () {
            return {
                ptyId: this.id,
                ptyName: this.name,
                frames: this.frames,
            };
        },
        enumerable: true,
        configurable: true
    });
    Pty.prototype.resize = function (cols, rows) {
        this.proc.resize(cols, rows);
    };
    Pty.prototype.kill = function () {
        // console.log('killing pty', this.id);
        this.proc.kill();
    };
    Pty.prototype.write = function (frame) {
        var value = Buffer.from(frame.value, 'base64').toString('binary');
        this.proc.write(value);
    };
    return Pty;
}());
exports.Pty = Pty;
var templateObject_1;
//# sourceMappingURL=Pty.js.map