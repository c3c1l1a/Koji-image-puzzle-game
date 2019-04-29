"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var WebSocket = require("ws");
var url = require("url");
var getDiskUsage_1 = require("./helpers/getDiskUsage");
var getMemoryUsage_1 = require("./helpers/getMemoryUsage");
var Client_1 = require("./Client");
var FileManager_1 = require("./FileManager");
var FilesystemManager_1 = require("./FilesystemManager");
var PtyManager_1 = require("./PtyManager");
var OutboundMessage_1 = require("./model/OutboundMessage");
var GitManager_1 = require("./GitManager");
var COLORS = [
    { fg: '#ff0080', bg: '#fdbad8' },
    { fg: '#0D47A1', bg: '#BBDEFB' },
    { fg: '#004D40', bg: '#B2DFDB' },
    { fg: '#E65100', bg: '#FFE0B2' },
];
var Server = /** @class */ (function () {
    function Server(port, projectPath, creatorUsername, defaultPtys, remoteBucketName, remoteBucketPrefix) {
        var _this = this;
        this.clients = [];
        this.systemStatusInterval = null;
        this.cachedSystemStatusMessage = null;
        this.creatorUsername = creatorUsername;
        this.gitManager = new GitManager_1.GitManager(this);
        this.fileManager = new FileManager_1.FileManager(this, projectPath, this.gitManager);
        this.filesystemManager = new FilesystemManager_1.FilesystemManager(this, this.gitManager, this.fileManager, projectPath, remoteBucketName, remoteBucketPrefix);
        this.ptyManager = new PtyManager_1.PtyManager(this, projectPath, creatorUsername);
        this.server = require('http').createServer();
        this.wss = new WebSocket.Server({
            server: this.server,
        });
        // Start
        this.initWss();
        this.server.listen(port);
        console.log('REMY_STARTED');
        console.log("WS server started at: " + JSON.stringify(this.wss.address()));
        this.onStart(defaultPtys);
        this.systemStatusInterval = setInterval(function () { return _this.updateSystemStatus(); }, 1000 * 5); // every five seconds
    }
    Server.prototype.updateSystemStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = this;
                        _c = (_b = OutboundMessage_1.OutboundMessage).getSystemStatusChangedCommand;
                        _d = {
                            filesystemStatus: this.filesystemManager.status,
                            memoryUsage: getMemoryUsage_1.getMemoryUsage()
                        };
                        return [4 /*yield*/, getDiskUsage_1.getDiskUsage()];
                    case 1:
                        _a.cachedSystemStatusMessage = _c.apply(_b, [(_d.diskUsage = _e.sent(),
                                _d)]);
                        this.broadcast(this.cachedSystemStatusMessage);
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.onStart = function (commands) {
        var _this = this;
        commands.forEach(function (_a) {
            var name = _a.name, cwd = _a.cwd, command = _a.command;
            var pty = _this.ptyManager.spawn(cwd, name);
            _this.ptyManager.write(pty, { value: Buffer.from(command + "\r", 'binary').toString('base64') });
        });
    };
    Server.prototype.broadcast = function (message) {
        this.clients.forEach(function (client) {
            client.sendMessage(message);
        });
    };
    Server.prototype.broadcastConnectedClients = function () {
        var message = OutboundMessage_1.OutboundMessage.getConnectedClientsChangedCommand({
            clients: this.clients.map(function (client) { return client.clientState; }),
        });
        this.clients.forEach(function (client) {
            client.sendMessage(message);
        });
    };
    Server.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('Shutting down...');
                return [2 /*return*/, Promise.all(this.clients.map(function (client) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, client.close(1012)];
                        });
                    }); }))];
            });
        });
    };
    Server.prototype.initWss = function () {
        var _this = this;
        this.wss.on('connection', function (ws, req) {
            var request = url.parse("" + req.url, true);
            var clientId = request.query.client_id;
            var sessionId = request.query.session_id;
            var userProfile = JSON.parse(req.headers['x-koji-user']);
            var isController = (req.headers['x-koji-is-controller'] === 'true'); // header comes in as a string value
            var color = COLORS[(_this.clients.length + 1) % 4];
            var state = new Client_1.Client(_this, ws, _this.filesystemManager, _this.fileManager, _this.ptyManager, clientId, sessionId, userProfile, isController, color);
            console.log("New connection: " + clientId);
            // Store client's state in map
            _this.clients.push(state);
            // Broadcast
            _this.broadcastConnectedClients();
            // If we have a system status, update the client
            if (_this.cachedSystemStatusMessage) {
                state.sendMessage(_this.cachedSystemStatusMessage);
            }
            // Handle socket events
            ws
                .on('message', function (data) {
                if (typeof data === 'string') {
                    state.onMessage(data)
                        .catch(function (err) { return console.log("Error handing message: " + err); });
                }
            })
                .on('close', function (code, reason) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("Closing connection (" + code + ") for " + clientId);
                            return [4 /*yield*/, state.onClose(code, reason)];
                        case 1:
                            _a.sent();
                            this.clients = this.clients
                                .filter(function (client) { return client.clientId !== state.clientId; });
                            this.broadcastConnectedClients();
                            return [2 /*return*/];
                    }
                });
            }); })
                .on('pong', function (data) { state.onPong(data); })
                .on('data', function () { })
                .on('error', function () { });
        });
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=Server.js.map