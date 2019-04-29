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
var Chokidar = require("chokidar");
var fs = require("fs");
var OutboundMessage_1 = require("../model/OutboundMessage");
var exec_1 = require("./helpers/exec");
var mkdirp_1 = require("./helpers/mkdirp");
var rimraf_1 = require("./helpers/rimraf");
var RemoteSync_1 = require("./helpers/RemoteSync");
var getKojifilesChangedMessage_1 = require("./helpers/getKojifilesChangedMessage");
var buildTree_1 = require("./helpers/buildTree");
var FilesystemManager = /** @class */ (function () {
    function FilesystemManager(server, gitManager, fileManager, projectPath, remoteBucket, remotePrefix) {
        this.watcher = null;
        this.files = [];
        this.broadcastDebounceTimer = null;
        this.kojifilesBroadcastMessage = null;
        this.kojifilesBroadcastDebounceTimer = null;
        this.gitfilesChangedDebounceTimer = null;
        this.server = server;
        this.gitManager = gitManager;
        this.fileManager = fileManager;
        this.projectPath = projectPath;
        this.remoteSync = new RemoteSync_1.RemoteSync(projectPath, remoteBucket, remotePrefix);
        this.startWatcher();
        this.ls();
    }
    Object.defineProperty(FilesystemManager.prototype, "filesystemChangedMessage", {
        get: function () {
            var paths = [
                '.git-info'
            ].concat(this.files.filter(function (file) { return file; }));
            return OutboundMessage_1.OutboundMessage.getFilesystemChangedCommand({
                paths: paths,
                tree: buildTree_1.buildTree(paths),
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FilesystemManager.prototype, "status", {
        get: function () {
            return this.remoteSync.isSyncing ? 'syncing' : 'synced';
        },
        enumerable: true,
        configurable: true
    });
    FilesystemManager.prototype.getRelativePath = function (path) {
        return path.replace(this.projectPath + "/", '');
    };
    FilesystemManager.prototype.onFilesystemChanged = function () {
        var _this = this;
        if (this.broadcastDebounceTimer) {
            clearTimeout(this.broadcastDebounceTimer);
        }
        this.broadcastDebounceTimer = setTimeout(function () {
            _this.server.broadcast(_this.filesystemChangedMessage);
        }, 500);
    };
    FilesystemManager.prototype.onKojifilesChanged = function () {
        var _this = this;
        if (this.kojifilesBroadcastDebounceTimer) {
            clearTimeout(this.kojifilesBroadcastDebounceTimer);
        }
        this.kojifilesBroadcastDebounceTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, getKojifilesChangedMessage_1.getKojifilesChangedMessage()];
                    case 1:
                        _a.kojifilesBroadcastMessage = _b.sent();
                        this.server.broadcast(this.kojifilesBroadcastMessage);
                        return [2 /*return*/];
                }
            });
        }); }, 500);
    };
    FilesystemManager.prototype.startWatcher = function () {
        var _this = this;
        this.watcher = Chokidar.watch(this.projectPath, {
            ignored: [
                this.projectPath + "/**/node_modules",
                this.projectPath + "/.remy",
                this.projectPath + "/Dockerfile",
            ],
            usePolling: true,
        });
        this.watcher.on('add', function (rawPath) {
            var path = _this.getRelativePath(rawPath);
            // console.log('added', path);
            // Don't push files from the git folder to the user
            if (!_this.files.includes(path) && !path.startsWith('.git/')) {
                _this.files.push(path);
                _this.onFilesystemChanged();
            }
            _this.remoteSync.upload(rawPath);
            if (path.includes('koji') && path.endsWith('.json')) {
                _this.onKojifilesChanged();
            }
            if (path.includes('.git/')) {
                _this.onGitfilesChanged();
            }
        });
        this.watcher.on('change', function (rawPath) {
            // console.log('changed', rawPath);
            _this.remoteSync.upload(rawPath);
            if (rawPath.includes('koji') && rawPath.endsWith('.json')) {
                _this.onKojifilesChanged();
            }
            if (rawPath.includes('.git/')) {
                _this.onGitfilesChanged();
            }
            // Notify the file manager
            _this.fileManager.onFileChangedOnDisk(_this.getRelativePath(rawPath));
        });
        this.watcher.on('unlink', function (rawPath) {
            var path = _this.getRelativePath(rawPath);
            // console.log('removed', path);
            _this.files = _this.files.filter(function (file) { return file !== path; });
            _this.onFilesystemChanged();
            _this.remoteSync.delete(rawPath);
            if (path.includes('koji') && path.endsWith('.json')) {
                _this.onKojifilesChanged();
            }
            if (path.includes('.git/')) {
                _this.onGitfilesChanged();
            }
        });
    };
    // List all files
    FilesystemManager.prototype.ls = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exclude, excludeString, _a, err_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        exclude = [
                            '*/.remy/*',
                            '*/.git/*',
                            '*/node_modules/*',
                            '*/Dockerfile',
                        ];
                        excludeString = exclude.map(function (item) { return "-not -path \"" + item + "\""; }).join(' ');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, exec_1.exec("find " + this.projectPath + " -type f " + excludeString)];
                    case 2:
                        _a.files = (_b.sent())
                            .toString()
                            .split('\n')
                            .map(function (path) { return _this.getRelativePath(path); });
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _b.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        this.onFilesystemChanged();
                        return [2 /*return*/];
                }
            });
        });
    };
    // Remove
    FilesystemManager.prototype.rm = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, rimraf_1.rimraf(this.projectPath + "/" + path)];
                    case 1:
                        _a.sent();
                        this.fileManager.onFileRemoved(path);
                        return [2 /*return*/];
                }
            });
        });
    };
    // Move
    FilesystemManager.prototype.mv = function (source, dest) {
        return __awaiter(this, void 0, void 0, function () {
            var destPath, destCopy, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        destPath = dest.split('/');
                        destCopy = destPath.slice();
                        destCopy.pop();
                        if (!(destCopy.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, mkdirp_1.mkdirp(this.projectPath + "/" + destCopy.join('/'))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, exec_1.exec("mv " + this.projectPath + "/" + source + " " + this.projectPath + "/" + destPath.join('/'))];
                    case 3:
                        _a.sent();
                        this.fileManager.onFilesMoved(source, dest);
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Initialize an empty file
    FilesystemManager.prototype.touch = function (fullPath) {
        return __awaiter(this, void 0, void 0, function () {
            var path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = fullPath.split('/');
                        path.pop(); // mutates
                        if (!(path.length > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, mkdirp_1.mkdirp(this.projectPath + "/" + path.join('/'))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        fs.writeFileSync(this.projectPath + "/" + fullPath, '');
                        return [2 /*return*/];
                }
            });
        });
    };
    FilesystemManager.prototype.onGitfilesChanged = function () {
        var _this = this;
        this.gitManager.markGitOperationInProgress(true);
        if (this.gitfilesChangedDebounceTimer) {
            clearTimeout(this.gitfilesChangedDebounceTimer);
        }
        this.gitfilesChangedDebounceTimer = setTimeout(function () {
            _this.gitManager.markGitOperationInProgress(false);
            _this.gitfilesChangedDebounceTimer = null;
        }, 2000);
    };
    return FilesystemManager;
}());
exports.FilesystemManager = FilesystemManager;
//# sourceMappingURL=index.js.map