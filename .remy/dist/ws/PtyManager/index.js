"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid");
var OutboundMessage_1 = require("../model/OutboundMessage");
var Pty_1 = require("./Pty");
var PtyManager = /** @class */ (function () {
    function PtyManager(server, projectPath, creatorUsername) {
        this.ptys = {};
        this.server = server;
        this.projectPath = projectPath;
        this.creatorUsername = creatorUsername;
    }
    PtyManager.prototype.spawn = function (cwdOrNull, nameOrNull) {
        var _this = this;
        var ptyId = uuid.v4();
        var cwd = (cwdOrNull) ? this.projectPath + "/" + cwdOrNull : this.projectPath;
        var name = nameOrNull || "Terminal " + (Object.keys(this.ptys).length + 1);
        var pty = new Pty_1.Pty(ptyId, "" + cwd, name, this.creatorUsername);
        pty.onData = function (frame) {
            var message = OutboundMessage_1.OutboundMessage.getPtyDataReceivedCommand({
                ptyId: ptyId,
                frame: frame,
            });
            _this.server.broadcast(message);
        };
        pty.onExit = function (code) {
            _this.kill(ptyId);
        };
        this.ptys[ptyId] = pty;
        // Broadcast update
        this.updateStatus();
        return ptyId;
    };
    PtyManager.prototype.kill = function (ptyId) {
        if (!this.ptys[ptyId]) {
            return;
        }
        this.ptys[ptyId].kill();
        delete this.ptys[ptyId];
        // Broadcast update
        this.updateStatus();
    };
    PtyManager.prototype.write = function (ptyId, frame) {
        if (!this.ptys[ptyId]) {
            return;
        }
        this.ptys[ptyId].write(frame);
    };
    PtyManager.prototype.resize = function (ptyId, cols, rows) {
        if (!this.ptys[ptyId]) {
            return;
        }
        this.ptys[ptyId].resize(cols, rows);
    };
    Object.defineProperty(PtyManager.prototype, "ptyStatusChangedMessage", {
        get: function () {
            return OutboundMessage_1.OutboundMessage.getPtysChangedCommand({
                ptys: Object.values(this.ptys).map(function (pty) { return pty.socketExpression; }),
            });
        },
        enumerable: true,
        configurable: true
    });
    PtyManager.prototype.updateStatus = function () {
        this.server.broadcast(this.ptyStatusChangedMessage);
    };
    return PtyManager;
}());
exports.PtyManager = PtyManager;
//# sourceMappingURL=index.js.map