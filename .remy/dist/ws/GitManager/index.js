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
var Git = require("simple-git/promise");
var child_process_1 = require("child_process");
var GitManager = /** @class */ (function () {
    function GitManager(server) {
        this.isOperationInProgress = false;
        this.isLoading = true;
        this.cachedStatus = {};
        this.statusChangedListeners = [];
        this.server = server;
        this.git = Git('/usr/src/app');
    }
    Object.defineProperty(GitManager.prototype, "status", {
        get: function () {
            return __assign({ isOperationInProgress: this.isOperationInProgress, isLoading: this.isLoading }, this.cachedStatus);
        },
        enumerable: true,
        configurable: true
    });
    GitManager.prototype.markGitOperationInProgress = function (isInProgress) {
        // Only update if we're sending new info
        if (this.isOperationInProgress && !isInProgress ||
            !this.isOperationInProgress && isInProgress) {
            this.isOperationInProgress = isInProgress;
            this.statusChanged();
        }
    };
    GitManager.prototype.onStatusChanged = function (callback) {
        this.statusChangedListeners.push(callback);
    };
    GitManager.prototype.removeStatusChanged = function (callback) {
        this.statusChangedListeners = this.statusChangedListeners.filter(function (item) { return item !== callback; });
    };
    GitManager.prototype.statusChanged = function () {
        var _this = this;
        this.statusChangedListeners.forEach(function (callback) {
            callback(_this.status);
        });
    };
    GitManager.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentLocalHash, currentRemoteHash, status, remote, mostRecentUpstream, upstream, err_1, mostRecentOrigin, origin, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isLoading = true;
                        this.statusChanged();
                        return [4 /*yield*/, this.updateRemotes()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.git.revparse(['HEAD'])];
                    case 2:
                        currentLocalHash = (_a.sent()).trim();
                        return [4 /*yield*/, this.git.revparse(['origin/master'])];
                    case 3:
                        currentRemoteHash = (_a.sent()).trim();
                        return [4 /*yield*/, this.git.status()];
                    case 4:
                        status = _a.sent();
                        return [4 /*yield*/, this.git.listRemote(['--get-url'])];
                    case 5:
                        remote = (_a.sent()).trim();
                        mostRecentUpstream = null;
                        _a.label = 6;
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.git.log(['-n', 1, 'upstream/master'])];
                    case 7:
                        upstream = _a.sent();
                        mostRecentUpstream = upstream.latest;
                        return [3 /*break*/, 9];
                    case 8:
                        err_1 = _a.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        mostRecentOrigin = null;
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.git.log(['-n', 1, 'origin/master'])];
                    case 11:
                        origin = _a.sent();
                        mostRecentOrigin = origin.latest;
                        return [3 /*break*/, 13];
                    case 12:
                        err_2 = _a.sent();
                        return [3 /*break*/, 13];
                    case 13:
                        this.cachedStatus = {
                            status: status,
                            remote: remote,
                            currentLocalHash: currentLocalHash,
                            currentRemoteHash: currentRemoteHash,
                            mostRecentOrigin: mostRecentOrigin,
                            mostRecentUpstream: mostRecentUpstream,
                        };
                        this.isLoading = false;
                        this.statusChanged();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitManager.prototype.updateRemotes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        child_process_1.exec('git remote update', function (err, res) {
                            resolve(res);
                        });
                    })];
            });
        });
    };
    return GitManager;
}());
exports.GitManager = GitManager;
//# sourceMappingURL=index.js.map