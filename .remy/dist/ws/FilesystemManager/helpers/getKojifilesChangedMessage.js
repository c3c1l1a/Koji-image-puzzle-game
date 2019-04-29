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
var fs = require("fs");
var OutboundMessage_1 = require("../../model/OutboundMessage");
function readDir(directory) {
    return new Promise(function (resolve, reject) {
        fs.readdir(directory, function (err, paths) {
            if (err) {
                reject(err);
            }
            else {
                var filteredPaths = paths
                    .filter(function (path) { return !path.includes('node_modules') && !path.includes('.git') && !path.includes('.remy'); })
                    .map(function (path) { return directory + "/" + path; });
                resolve(filteredPaths);
            }
        });
    });
}
function pathIsDirectory(path) {
    return new Promise(function (resolve, reject) {
        fs.stat(path, function (err, res) {
            if (res && res.isDirectory()) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    });
}
function getJson(path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, { encoding: 'utf8' }, function (err, res) {
            if (err) {
                reject(err);
                return;
            }
            try {
                var json = JSON.parse(res);
                resolve(json);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
// Recurse through all directories to find jiro dotfiles
function readDirectory(directory) {
    return __awaiter(this, void 0, void 0, function () {
        var results, paths;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = [];
                    return [4 /*yield*/, readDir(directory)];
                case 1:
                    paths = _a.sent();
                    return [4 /*yield*/, Promise.all(paths.map(function (path) { return __awaiter(_this, void 0, void 0, function () {
                            var isDirectory, contents;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, pathIsDirectory(path)];
                                    case 1:
                                        isDirectory = _a.sent();
                                        if (!isDirectory) return [3 /*break*/, 3];
                                        return [4 /*yield*/, readDirectory(path)];
                                    case 2:
                                        contents = _a.sent();
                                        results.push.apply(results, contents);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        results.push(path);
                                        _a.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
function getKojifilesChangedMessage() {
    return __awaiter(this, void 0, void 0, function () {
        var paths, filteredPaths, projectConfig;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readDirectory('/usr/src/app')];
                case 1:
                    paths = _a.sent();
                    filteredPaths = paths.filter(function (path) { return path.includes('koji') && path.endsWith('.json'); });
                    projectConfig = {
                        pages: [],
                        routes: [],
                        eventHooks: {
                            frontend: {},
                            backend: {},
                        },
                    };
                    return [4 /*yield*/, Promise.all(filteredPaths.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var configFile_1, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, getJson(filePath)];
                                    case 1:
                                        configFile_1 = _a.sent();
                                        // All config files are objects, so go through all the keys and
                                        // add them to the root config
                                        Object.keys(configFile_1).forEach(function (key) {
                                            // If the key already exists in the project config, use it
                                            if (projectConfig[key]) {
                                                if (Array.isArray(projectConfig[key]) && Array.isArray(configFile_1[key])) {
                                                    projectConfig[key] = projectConfig[key].concat(configFile_1[key]);
                                                }
                                                else {
                                                    projectConfig[key] = __assign({}, projectConfig[key], configFile_1[key]);
                                                }
                                            }
                                            else {
                                                configFile_1[key]['@@PATH'] = filePath.replace('/usr/src/app/', '');
                                                projectConfig[key] = configFile_1[key];
                                            }
                                            if (key === 'develop') {
                                                try {
                                                    var events = configFile_1.develop.frontend.events;
                                                    projectConfig.eventHooks.frontend = events;
                                                }
                                                catch (err) { }
                                                try {
                                                    var events = configFile_1.develop.backend.events;
                                                    projectConfig.eventHooks.backend = events;
                                                }
                                                catch (err) { }
                                            }
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    _a.sent();
                    return [2 /*return*/, OutboundMessage_1.OutboundMessage.getKojifilesChangedCommand(projectConfig)];
            }
        });
    });
}
exports.getKojifilesChangedMessage = getKojifilesChangedMessage;
//# sourceMappingURL=getKojifilesChangedMessage.js.map