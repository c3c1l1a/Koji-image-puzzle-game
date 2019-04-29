"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
var InboundMessage_1 = require("./model/InboundMessage");
var Client = /** @class */ (function () {
    function Client(server, ws, filesystemManager, fileManager, ptyManager, clientId, sessionId, userProfile, isController, color) {
        var _this = this;
        this.numPingsSent = 0;
        this.editorSelection = undefined;
        this.server = server;
        this.ws = ws;
        this.filesystemManager = filesystemManager;
        this.fileManager = fileManager;
        this.ptyManager = ptyManager;
        this.clientId = clientId;
        this.sessionId = sessionId;
        this.userProfile = userProfile;
        this.isController = isController;
        this.color = color;
        this.pingInterval = setInterval(function () {
            _this.ping();
        }, 25000);
        this.onConnect();
    }
    Object.defineProperty(Client.prototype, "clientState", {
        get: function () {
            return {
                clientId: this.clientId,
                sessionId: this.sessionId,
                userProfile: this.userProfile,
                editorSelection: this.editorSelection,
                isController: this.isController,
                color: this.color,
            };
        },
        enumerable: true,
        configurable: true
    });
    Client.prototype.onConnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentFileMessage;
            return __generator(this, function (_a) {
                // Let other clients know about our new client
                this.server.broadcastConnectedClients();
                // Send initial state
                this.sendMessage(this.filesystemManager.filesystemChangedMessage);
                if (this.filesystemManager.kojifilesBroadcastMessage) {
                    this.sendMessage(this.filesystemManager.kojifilesBroadcastMessage);
                }
                this.sendMessage(this.fileManager.openFilesMessage);
                currentFileMessage = this.fileManager.currentFileMessage;
                if (currentFileMessage) {
                    this.sendMessage(currentFileMessage);
                }
                this.sendMessage(this.ptyManager.ptyStatusChangedMessage);
                return [2 /*return*/];
            });
        });
    };
    Client.prototype.onMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var inboundMessage, _a, lsMessage, rmMessage, mvMessage, _b, source, dest, touchMessage, openFileMessage, _c, path, editorType, closeFileMessage, saveFileMessage, applyOperationMessage, _d, path, operation, jsonSetValueMessage, _e, path, key, newValue, setSelectionMessage, _f, path, caretIndex, range, ptySpawnMessage, ptyKillMessage, ptyWriteMessage, _g, ptyId, frame, ptyResizeMessage, _h, ptyId, cols, rows, e_1;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        inboundMessage = JSON.parse(message);
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 21, , 22]);
                        _a = inboundMessage.type;
                        switch (_a) {
                            case InboundMessage_1.InboundMessage.Type.LS: return [3 /*break*/, 2];
                            case InboundMessage_1.InboundMessage.Type.RM: return [3 /*break*/, 3];
                            case InboundMessage_1.InboundMessage.Type.MV: return [3 /*break*/, 6];
                            case InboundMessage_1.InboundMessage.Type.TOUCH: return [3 /*break*/, 7];
                            case InboundMessage_1.InboundMessage.Type.OPEN_FILE: return [3 /*break*/, 10];
                            case InboundMessage_1.InboundMessage.Type.CLOSE_FILE: return [3 /*break*/, 11];
                            case InboundMessage_1.InboundMessage.Type.SAVE_FILE: return [3 /*break*/, 12];
                            case InboundMessage_1.InboundMessage.Type.APPLY_OPERATION: return [3 /*break*/, 13];
                            case InboundMessage_1.InboundMessage.Type.JSON_SET_VALUE: return [3 /*break*/, 14];
                            case InboundMessage_1.InboundMessage.Type.SET_SELECTION: return [3 /*break*/, 15];
                            case InboundMessage_1.InboundMessage.Type.PTY_SPAWN: return [3 /*break*/, 16];
                            case InboundMessage_1.InboundMessage.Type.PTY_KILL: return [3 /*break*/, 17];
                            case InboundMessage_1.InboundMessage.Type.PTY_WRITE: return [3 /*break*/, 18];
                            case InboundMessage_1.InboundMessage.Type.PTY_RESIZE: return [3 /*break*/, 19];
                        }
                        return [3 /*break*/, 20];
                    case 2:
                        {
                            lsMessage = inboundMessage;
                            if (lsMessage.ls) {
                                this.filesystemManager.ls();
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 3;
                    case 3:
                        // Protected message type
                        if (!this.isController) {
                            return [2 /*return*/];
                        }
                        rmMessage = inboundMessage;
                        if (!rmMessage.rm) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.filesystemManager.rm(rmMessage.rm.path)];
                    case 4:
                        _j.sent();
                        _j.label = 5;
                    case 5: return [3 /*break*/, 20];
                    case 6:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            mvMessage = inboundMessage;
                            if (mvMessage.mv) {
                                _b = mvMessage.mv, source = _b.source, dest = _b.dest;
                                this.filesystemManager.mv(source, dest);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 7;
                    case 7:
                        // Protected message type
                        if (!this.isController) {
                            return [2 /*return*/];
                        }
                        touchMessage = inboundMessage;
                        if (!touchMessage.touch) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.filesystemManager.touch(touchMessage.touch.path)];
                    case 8:
                        _j.sent();
                        this.fileManager.open(touchMessage.touch.path);
                        _j.label = 9;
                    case 9: return [3 /*break*/, 20];
                    case 10:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            openFileMessage = inboundMessage;
                            if (openFileMessage.openFile) {
                                _c = openFileMessage.openFile, path = _c.path, editorType = _c.editorType;
                                this.fileManager.open(path, editorType);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 11;
                    case 11:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            closeFileMessage = inboundMessage;
                            if (closeFileMessage.closeFile) {
                                this.fileManager.close(closeFileMessage.closeFile.path);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 12;
                    case 12:
                        {
                            saveFileMessage = inboundMessage;
                            if (saveFileMessage.saveFile) {
                                this.fileManager.save(saveFileMessage.saveFile.path);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 13;
                    case 13:
                        {
                            applyOperationMessage = inboundMessage;
                            if (applyOperationMessage.applyOperation) {
                                _d = applyOperationMessage.applyOperation, path = _d.path, operation = _d.operation;
                                this.fileManager.applyOperation(this.sessionId, path, operation);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 14;
                    case 14:
                        {
                            jsonSetValueMessage = inboundMessage;
                            if (jsonSetValueMessage.jsonSetValue) {
                                _e = jsonSetValueMessage.jsonSetValue, path = _e.path, key = _e.key, newValue = _e.newValue;
                                this.fileManager.jsonSetValueAtPath(this.sessionId, path, key, newValue);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 15;
                    case 15:
                        {
                            setSelectionMessage = inboundMessage;
                            if (setSelectionMessage.setSelection) {
                                _f = setSelectionMessage.setSelection, path = _f.path, caretIndex = _f.caretIndex, range = _f.range;
                                this.setSelection(path, caretIndex, range);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 16;
                    case 16:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            ptySpawnMessage = inboundMessage;
                            if (ptySpawnMessage.ptySpawn) {
                                this.ptyManager.spawn(undefined, ptySpawnMessage.ptySpawn.name);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 17;
                    case 17:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            ptyKillMessage = inboundMessage;
                            if (ptyKillMessage.ptyKill) {
                                this.ptyManager.kill(ptyKillMessage.ptyKill.ptyId);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 18;
                    case 18:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            ptyWriteMessage = inboundMessage;
                            if (ptyWriteMessage.ptyWrite) {
                                _g = ptyWriteMessage.ptyWrite, ptyId = _g.ptyId, frame = _g.frame;
                                this.ptyManager.write(ptyId, frame);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 19;
                    case 19:
                        {
                            // Protected message type
                            if (!this.isController) {
                                return [2 /*return*/];
                            }
                            ptyResizeMessage = inboundMessage;
                            if (ptyResizeMessage.ptyResize) {
                                _h = ptyResizeMessage.ptyResize, ptyId = _h.ptyId, cols = _h.cols, rows = _h.rows;
                                this.ptyManager.resize(ptyId, cols, rows);
                            }
                            return [3 /*break*/, 20];
                        }
                        _j.label = 20;
                    case 20: return [3 /*break*/, 22];
                    case 21:
                        e_1 = _j.sent();
                        console.error("Error processing message: " + message + ": " + e_1);
                        return [3 /*break*/, 22];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.sendMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var stringMessage = JSON.stringify(__assign({}, message, { timestamp: Date.now() }));
                        _this.ws.send(stringMessage, function (err) {
                            if (err) {
                                reject();
                            }
                            else {
                                resolve();
                            }
                        });
                    })];
            });
        });
    };
    Client.prototype.setSelection = function (path, caretIndex, range) {
        this.editorSelection = {
            path: path,
            caretIndex: caretIndex,
            range: range,
        };
        // Bubble up to server
        this.server.broadcastConnectedClients();
    };
    ////////////////////////////////////////////////////////////////////////////////
    // Handle close
    Client.prototype.close = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                clearInterval(this.pingInterval);
                this.ws.close(code);
                return [2 /*return*/];
            });
        });
    };
    Client.prototype.onClose = function (code, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 4001 = side effect free connection close
                if (code === 4001) {
                    return [2 /*return*/];
                }
                return [2 /*return*/];
            });
        });
    };
    ////////////////////////////////////////////////////////////////////////////////
    // Handle pings
    Client.prototype.ping = function () {
        if (this.numPingsSent >= 2) {
            clearInterval(this.pingInterval);
            this.ws.close();
        }
        else {
            this.numPingsSent += 1;
            try {
                this.ws.ping();
            }
            catch (e) {
                clearInterval(this.pingInterval);
                this.ws.close();
            }
        }
    };
    Client.prototype.onPong = function (data) {
        this.numPingsSent = 0;
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=Client.js.map