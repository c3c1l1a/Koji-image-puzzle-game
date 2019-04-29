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
var fs = require("fs");
var crypto = require("crypto");
var AWS = require("aws-sdk");
var ignore_1 = require("ignore");
var Throttle = require("promise-parallel-throttle");
function computeHash(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                        var hash = crypto.createHash('md5');
                        hash.setEncoding('hex');
                        var stream = fs.createReadStream(path);
                        stream.on('end', function () {
                            hash.end();
                            resolve(hash.read());
                        });
                        stream.pipe(hash);
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
var RemoteSync = /** @class */ (function () {
    function RemoteSync(projectPath, bucketName, prefix) {
        this.uploadQueueMap = {};
        this.deleteQueueMap = {};
        this.debounceTimer = null;
        this.isSyncing = false;
        this.projectPath = projectPath;
        this.bucketName = bucketName;
        this.prefix = prefix;
        this.s3 = new AWS.S3();
    }
    RemoteSync.prototype.getRelativePath = function (path) {
        return path.replace(this.projectPath + "/", '');
    };
    RemoteSync.prototype.filterIgnoredFiles = function (paths) {
        var _this = this;
        // Get the list of files/paths to ignore
        var matchesObject = {
            // '.git/**': true,
            '.remy/**': true,
            '**/node_modules/**': true,
            Dockerfile: true,
        };
        try {
            fs.readFileSync(this.projectPath + "/.kojiignore", { encoding: 'utf8' })
                .split('\n')
                .filter(function (line) { return line; })
                .forEach(function (line) {
                matchesObject[line] = true;
            });
        }
        catch (err) {
            //
        }
        var ignore = ignore_1.default().add(Object.keys(matchesObject));
        return paths.filter(function (path) { return !ignore.ignores(_this.getRelativePath(path)); });
    };
    RemoteSync.prototype.upload = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.markForUpload(path)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteSync.prototype.markForUpload = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = null;
                }
                this.uploadQueueMap[path] = true;
                // Remove from delete queue if it's in there
                if (this.deleteQueueMap[path]) {
                    delete this.deleteQueueMap[path];
                }
                this.debounceTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processQueues()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); }, 3000);
                return [2 /*return*/];
            });
        });
    };
    RemoteSync.prototype.processQueues = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isSyncing = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.processDelete()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.processUpload()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _a.sent();
                        return [3 /*break*/, 7];
                    case 7:
                        this.isSyncing = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteSync.prototype.processUpload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filteredFiles, uploadFile, queue;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filteredFiles = this.filterIgnoredFiles(Object.keys(this.uploadQueueMap));
                        this.uploadQueueMap = {};
                        uploadFile = function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var stat, hash, ETag, err_3, err_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        try {
                                            stat = fs.statSync(file);
                                            if (stat.size > 1e8) {
                                                // File is larger than 100 mb, skip!
                                                console.log('Skipping giant file', stat.size);
                                                return [2 /*return*/];
                                            }
                                        }
                                        catch (err) {
                                            console.log('Err stating file', file);
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 4, , 5]);
                                        return [4 /*yield*/, computeHash(file)];
                                    case 2:
                                        hash = _a.sent();
                                        return [4 /*yield*/, this.s3.headObject({
                                                Bucket: this.bucketName,
                                                Key: this.prefix + "/" + this.getRelativePath(file),
                                            }).promise()];
                                    case 3:
                                        ETag = (_a.sent()).ETag;
                                        if (ETag === "\"" + hash + "\"") { // Etag returns a quoted string (why?)
                                            // console.log(`${file} has not changed, skipping`);
                                            return [2 /*return*/];
                                        }
                                        return [3 /*break*/, 5];
                                    case 4:
                                        err_3 = _a.sent();
                                        return [3 /*break*/, 5];
                                    case 5:
                                        console.log("Uploading " + file);
                                        _a.label = 6;
                                    case 6:
                                        _a.trys.push([6, 8, , 9]);
                                        return [4 /*yield*/, this.s3.upload({
                                                Bucket: this.bucketName,
                                                Key: this.prefix + "/" + this.getRelativePath(file),
                                                Body: fs.createReadStream(file),
                                            }).promise()];
                                    case 7:
                                        _a.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        err_4 = _a.sent();
                                        console.log('Err uploading file', file);
                                        return [3 /*break*/, 9];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        }); };
                        queue = filteredFiles.map(function (file) { return function () { return uploadFile(file); }; });
                        return [4 /*yield*/, Throttle.all(queue, { maxInProgress: 5 })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RemoteSync.prototype.delete = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.debounceTimer) {
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = null;
                }
                this.deleteQueueMap[path] = true;
                // Remove from upload queue if it's in there
                if (this.uploadQueueMap[path]) {
                    delete this.uploadQueueMap[path];
                }
                this.debounceTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.processQueues()];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                }); }); }, 3000);
                return [2 /*return*/];
            });
        });
    };
    RemoteSync.prototype.processDelete = function () {
        return __awaiter(this, void 0, void 0, function () {
            var filesToDelete;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filesToDelete = Object.keys(this.deleteQueueMap)
                            .map(function (path) { return ({ Key: _this.prefix + "/" + _this.getRelativePath(path) }); });
                        if (filesToDelete.length === 0) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.s3.deleteObjects({
                                Bucket: this.bucketName,
                                Delete: {
                                    Objects: filesToDelete,
                                },
                            }).promise()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return RemoteSync;
}());
exports.RemoteSync = RemoteSync;
//# sourceMappingURL=RemoteSync.js.map