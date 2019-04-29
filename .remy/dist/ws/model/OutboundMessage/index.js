"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OutboundMessage;
(function (OutboundMessage) {
    ////////////////////////////////////////////////////////////////////////////////
    // Getters
    function getSystemStatusChangedCommand(systemStatusChanged) {
        return {
            type: Type.SYSTEM_STATUS_CHANGED,
            systemStatusChanged: systemStatusChanged,
        };
    }
    OutboundMessage.getSystemStatusChangedCommand = getSystemStatusChangedCommand;
    function getFilesystemChangedCommand(filesystemChanged) {
        return {
            type: Type.FILESYSTEM_CHANGED,
            filesystemChanged: filesystemChanged,
        };
    }
    OutboundMessage.getFilesystemChangedCommand = getFilesystemChangedCommand;
    function getKojifilesChangedCommand(kojifilesChanged) {
        return {
            type: Type.KOJIFILES_CHANGED,
            kojifilesChanged: kojifilesChanged,
        };
    }
    OutboundMessage.getKojifilesChangedCommand = getKojifilesChangedCommand;
    function getOpenFilesChangedCommand(openFilesChanged) {
        return {
            type: Type.OPEN_FILES_CHANGED,
            openFilesChanged: openFilesChanged,
        };
    }
    OutboundMessage.getOpenFilesChangedCommand = getOpenFilesChangedCommand;
    function getFileLoadedCommand(fileLoaded) {
        return {
            type: Type.FILE_LOADED,
            fileLoaded: fileLoaded,
        };
    }
    OutboundMessage.getFileLoadedCommand = getFileLoadedCommand;
    function getConnectedClientsChangedCommand(connectedClientsChanged) {
        return {
            type: Type.CONNECTED_CLIENTS_CHANGED,
            connectedClientsChanged: connectedClientsChanged,
        };
    }
    OutboundMessage.getConnectedClientsChangedCommand = getConnectedClientsChangedCommand;
    function getOperationReceivedCommand(operationReceived) {
        return {
            type: Type.OPERATION_RECEIVED,
            operationReceived: operationReceived,
        };
    }
    OutboundMessage.getOperationReceivedCommand = getOperationReceivedCommand;
    function getJsonValueChangedCommand(jsonValueChanged) {
        return {
            type: Type.JSON_VALUE_CHANGED,
            jsonValueChanged: jsonValueChanged,
        };
    }
    OutboundMessage.getJsonValueChangedCommand = getJsonValueChangedCommand;
    function getPtysChangedCommand(ptysChanged) {
        return {
            type: Type.PTYS_CHANGED,
            ptysChanged: ptysChanged,
        };
    }
    OutboundMessage.getPtysChangedCommand = getPtysChangedCommand;
    function getPtyDataReceivedCommand(ptyDataReceived) {
        return {
            type: Type.PTY_DATA_RECEIVED,
            ptyDataReceived: ptyDataReceived,
        };
    }
    OutboundMessage.getPtyDataReceivedCommand = getPtyDataReceivedCommand;
    ////////////////////////////////////////////////////////////////////////////////
    // PRIVATE: Types
    var Type;
    (function (Type) {
        Type["SYSTEM_STATUS_CHANGED"] = "system/status_changed";
        Type["FILESYSTEM_CHANGED"] = "fs/changed";
        Type["KOJIFILES_CHANGED"] = "fs/kojifiles_changed";
        Type["OPEN_FILES_CHANGED"] = "file/open_files_changed";
        Type["FILE_LOADED"] = "file/loaded";
        Type["CONNECTED_CLIENTS_CHANGED"] = "file/connected_clients_changed";
        Type["OPERATION_RECEIVED"] = "file/operation_received";
        Type["JSON_VALUE_CHANGED"] = "file/json_value_changed";
        Type["PTYS_CHANGED"] = "pty/changed";
        Type["PTY_DATA_RECEIVED"] = "pty/data_received";
    })(Type || (Type = {}));
})(OutboundMessage = exports.OutboundMessage || (exports.OutboundMessage = {}));
var EditorType;
(function (EditorType) {
    EditorType["VISUAL"] = "visual";
    EditorType["CODE"] = "code";
})(EditorType = exports.EditorType || (exports.EditorType = {}));
//# sourceMappingURL=index.js.map