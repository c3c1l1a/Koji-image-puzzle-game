import { ClientState } from '../ClientState';
import { DiskUsage } from '../../helpers/getDiskUsage';
import { MemoryUsage } from '../../helpers/getMemoryUsage';

export namespace OutboundMessage {
////////////////////////////////////////////////////////////////////////////////
// Getters
  export function getSystemStatusChangedCommand(
    systemStatusChanged: SystemStatusChanged,
  ): OutboundMessage {
    return {
      type: Type.SYSTEM_STATUS_CHANGED,
      systemStatusChanged,
    };
  }

  export function getFilesystemChangedCommand(
    filesystemChanged: FilesystemChanged,
  ): OutboundMessage {
    return {
      type: Type.FILESYSTEM_CHANGED,
      filesystemChanged,
    };
  }

  export function getKojifilesChangedCommand(
    kojifilesChanged: KojifilesChanged,
  ): OutboundMessage {
    return {
      type: Type.KOJIFILES_CHANGED,
      kojifilesChanged,
    };
  }

  export function getOpenFilesChangedCommand(
    openFilesChanged: OpenFilesChanged,
  ): OutboundMessage {
    return {
      type: Type.OPEN_FILES_CHANGED,
      openFilesChanged,
    };
  }

  export function getFileLoadedCommand(
    fileLoaded: FileLoaded,
  ): OutboundMessage {
    return {
      type: Type.FILE_LOADED,
      fileLoaded,
    };
  }

  export function getConnectedClientsChangedCommand(
    connectedClientsChanged: ConnectedClientsChanged,
  ): OutboundMessage {
    return {
      type: Type.CONNECTED_CLIENTS_CHANGED,
      connectedClientsChanged,
    };
  }

  export function getOperationReceivedCommand(
    operationReceived: OperationReceived,
  ): OutboundMessage {
    return {
      type: Type.OPERATION_RECEIVED,
      operationReceived,
    };
  }

  export function getJsonValueChangedCommand(
    jsonValueChanged: JsonValueChanged,
  ): OutboundMessage {
    return {
      type: Type.JSON_VALUE_CHANGED,
      jsonValueChanged,
    };
  }

  export function getPtysChangedCommand(
    ptysChanged: PtysChanged,
  ): OutboundMessage {
    return {
      type: Type.PTYS_CHANGED,
      ptysChanged,
    };
  }

  export function getPtyDataReceivedCommand(
    ptyDataReceived: PtyDataReceived,
  ): OutboundMessage {
    return {
      type: Type.PTY_DATA_RECEIVED,
      ptyDataReceived,
    };
  }

////////////////////////////////////////////////////////////////////////////////
// PRIVATE: Types

  enum Type {
    SYSTEM_STATUS_CHANGED = 'system/status_changed',

    FILESYSTEM_CHANGED = 'fs/changed',
    KOJIFILES_CHANGED = 'fs/kojifiles_changed',

    OPEN_FILES_CHANGED = 'file/open_files_changed',
    FILE_LOADED = 'file/loaded',
    CONNECTED_CLIENTS_CHANGED = 'file/connected_clients_changed',
    OPERATION_RECEIVED = 'file/operation_received',
    JSON_VALUE_CHANGED = 'file/json_value_changed',

    PTYS_CHANGED = 'pty/changed',
    PTY_DATA_RECEIVED = 'pty/data_received',
  }

////////////////////////////////////////////////////////////////////////////////
// PRIVATE: Base message object

  interface OutboundMessage {
    type: Type;

    connectedClientsChanged?: ConnectedClientsChanged | null;

    systemStatusChanged?: SystemStatusChanged | null;

    filesystemChanged?: FilesystemChanged | null;
    kojifilesChanged?: KojifilesChanged | null;
    openFilesChanged?: OpenFilesChanged | null;
    fileLoaded?: FileLoaded | null;
    operationReceived?: OperationReceived | null;
    jsonValueChanged?: JsonValueChanged | null;

    ptysChanged?: PtysChanged | null;
    ptyDataReceived?: PtyDataReceived | null;
  }
}

export interface SystemStatusChanged {
  filesystemStatus: 'syncing'|'synced';
  memoryUsage: MemoryUsage;
  diskUsage: DiskUsage;
}

export interface ConnectedClientsChanged {
  clients: ClientState[];
}

export interface FilesystemChanged {
  paths: string[];
}

export interface KojifilesChanged {
  pages: {[index: string]: any[]}[];
  routes: {[index: string]: any[]}[];
  eventHooks: {
    frontend: {[index: string]: any};
    backend: {[index: string]: any};
  };
  [key: string]: any;
}

export enum EditorType {
  VISUAL = 'visual',
  CODE = 'code',
}
export interface OpenFile {
  path: string;
  sticky: boolean;
  editorType: EditorType;
  hasUnsavedChanges: boolean;
}
export interface OpenFilesChanged {
  openFiles: OpenFile[];
  currentFile: string | null;
}

export interface FileLoaded {
  path: string;
  body: string;
}

export interface OperationReceived {
  sessionId: string;
  path: string;
  operation: string;
  ts: number;
}
export interface JsonValueChanged {
  sessionId: string;
  path: string;
  key: string;
  newValue: string;
}

export interface PtyExpression {
  ptyId: string;
  ptyName?: string;
  frames: PtyFrame[];
}
export interface PtysChanged {
  ptys: PtyExpression[];
}

export interface PtyFrame {
  frameId?: string;
  value: string;
}
export interface PtyDataReceived {
  ptyId: string;
  frame: PtyFrame;
}
