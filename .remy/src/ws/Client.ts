import * as WebSocket from 'ws';
import Timer = NodeJS.Timer;

import { Server } from './Server';
import { FileManager } from './FileManager';
import { FilesystemManager } from './FilesystemManager';
import { PtyManager } from './PtyManager';

import {
  InboundMessage,

  InboundLsMessage,
  InboundRmMessage,
  InboundMvMessage,
  InboundTouchMessage,

  InboundOpenFileMessage,
  InboundCloseFileMessage,
  InboundSaveFileMessage,
  InboundSetSelectionMessage,
  InboundApplyOperationMessage,

  InboundPtySpawnMessage,
  InboundPtyKillMessage,
  InboundPtyWriteMessage,
  InboundPtyResizeMessage,

  InboundJsonSetValueMessage,
} from './model/InboundMessage';

import { UserProfile } from './model/UserProfile';
import { ClientState } from './model/ClientState';
import { EditorSelection } from './model/EditorSelection';
import { Color } from './model/Color';

export class Client {
  private readonly server: Server;
  private readonly ws: WebSocket;
  private readonly filesystemManager: FilesystemManager;
  private readonly fileManager: FileManager;
  private readonly ptyManager: PtyManager;

  readonly clientId: string;
  readonly sessionId: string;
  readonly userProfile: UserProfile;
  readonly isController: boolean;
  readonly color: Color;

  private numPingsSent: number = 0;
  private pingInterval: Timer;

  private editorSelection?: EditorSelection = undefined;

  constructor(
    server: Server,
    ws: WebSocket,
    filesystemManager: FilesystemManager,
    fileManager: FileManager,
    ptyManager: PtyManager,
    clientId: string,
    sessionId: string,
    userProfile: UserProfile,
    isController: boolean,
    color: Color,
  ) {
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

    this.pingInterval = setInterval(() => {
      this.ping();
    }, 25000);

    this.onConnect();
  }

  get clientState(): ClientState {
    return {
      clientId: this.clientId,
      sessionId: this.sessionId,
      userProfile: this.userProfile,
      editorSelection: this.editorSelection,
      isController: this.isController,
      color: this.color,
    };
  }

  async onConnect() {
    // Let other clients know about our new client
    this.server.broadcastConnectedClients();

    // Send initial state
    this.sendMessage(this.filesystemManager.filesystemChangedMessage);
    if (this.filesystemManager.kojifilesBroadcastMessage) {
      this.sendMessage(this.filesystemManager.kojifilesBroadcastMessage);
    }

    this.sendMessage(this.fileManager.openFilesMessage);

    const currentFileMessage = this.fileManager.currentFileMessage;
    if (currentFileMessage) {
      this.sendMessage(currentFileMessage);
    }

    this.sendMessage(this.ptyManager.ptyStatusChangedMessage);
  }

  async onMessage(message: string) {
    // console.log(`Inbound (${this.clientId}): ${message}`);
    const inboundMessage = <InboundMessage> JSON.parse(message);

    try {
      switch (inboundMessage.type) {
        // Filesystem
        case InboundMessage.Type.LS: {
          const lsMessage = <InboundLsMessage> inboundMessage;
          if (lsMessage.ls) {
            this.filesystemManager.ls();
          }
          break;
        }
        case InboundMessage.Type.RM: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const rmMessage = <InboundRmMessage> inboundMessage;
          if (rmMessage.rm) {
            await this.filesystemManager.rm(rmMessage.rm.path);
            await this.fileManager.close(rmMessage.rm.path);
          }
          break;
        }
        case InboundMessage.Type.MV: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const mvMessage = <InboundMvMessage> inboundMessage;
          if (mvMessage.mv) {
            const { source, dest } = mvMessage.mv;
            this.filesystemManager.mv(source, dest);
          }
          break;
        }
        case InboundMessage.Type.TOUCH: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const touchMessage = <InboundTouchMessage> inboundMessage;
          if (touchMessage.touch) {
            await this.filesystemManager.touch(touchMessage.touch.path);
            this.fileManager.open(touchMessage.touch.path);
          }
          break;
        }

        // Editor
        case InboundMessage.Type.OPEN_FILE: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const openFileMessage = <InboundOpenFileMessage> inboundMessage;
          if (openFileMessage.openFile) {
            const { path, editorType } = openFileMessage.openFile;
            this.fileManager.open(path, editorType);
          }
          break;
        }
        case InboundMessage.Type.CLOSE_FILE: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const closeFileMessage = <InboundCloseFileMessage> inboundMessage;
          if (closeFileMessage.closeFile) {
            this.fileManager.close(closeFileMessage.closeFile.path);
          }
          break;
        }
        case InboundMessage.Type.SAVE_FILE: {
          const saveFileMessage = <InboundSaveFileMessage> inboundMessage;
          if (saveFileMessage.saveFile) {
            this.fileManager.save(saveFileMessage.saveFile.path);
          }
          break;
        }
        case InboundMessage.Type.APPLY_OPERATION: {
          const applyOperationMessage = <InboundApplyOperationMessage> inboundMessage;
          if (applyOperationMessage.applyOperation) {
            const { path, operation } = applyOperationMessage.applyOperation;
            this.fileManager.applyOperation(this.sessionId, path, operation);
          }
          break;
        }
        case InboundMessage.Type.JSON_SET_VALUE: {
          const jsonSetValueMessage = <InboundJsonSetValueMessage> inboundMessage;
          if (jsonSetValueMessage.jsonSetValue) {
            const { path, key, newValue } = jsonSetValueMessage.jsonSetValue;
            this.fileManager.jsonSetValueAtPath(this.sessionId, path, key, newValue);
          }
          break;
        }
        case InboundMessage.Type.SET_SELECTION: {
          const setSelectionMessage = <InboundSetSelectionMessage> inboundMessage;
          if (setSelectionMessage.setSelection) {
            const { path, caretIndex, range } = setSelectionMessage.setSelection;
            this.setSelection(path, caretIndex, range);
          }
          break;
        }

        // Terminal
        case InboundMessage.Type.PTY_SPAWN: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const ptySpawnMessage = <InboundPtySpawnMessage> inboundMessage;
          if (ptySpawnMessage.ptySpawn) {
            this.ptyManager.spawn(undefined, ptySpawnMessage.ptySpawn.name);
          }
          break;
        }
        case InboundMessage.Type.PTY_KILL: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const ptyKillMessage = <InboundPtyKillMessage> inboundMessage;
          if (ptyKillMessage.ptyKill) {
            this.ptyManager.kill(ptyKillMessage.ptyKill.ptyId);
          }
          break;
        }
        case InboundMessage.Type.PTY_WRITE: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const ptyWriteMessage = <InboundPtyWriteMessage> inboundMessage;
          if (ptyWriteMessage.ptyWrite) {
            const { ptyId, frame } = ptyWriteMessage.ptyWrite;
            this.ptyManager.write(ptyId, frame);
          }
          break;
        }
        case InboundMessage.Type.PTY_RESIZE: {
          // Protected message type
          if (!this.isController) {
            return;
          }

          const ptyResizeMessage = <InboundPtyResizeMessage> inboundMessage;
          if (ptyResizeMessage.ptyResize) {
            const { ptyId, cols, rows } = ptyResizeMessage.ptyResize;
            this.ptyManager.resize(ptyId, cols, rows);
          }
          break;
        }
      }
    } catch (e) {
      console.error(`Error processing message: ${message}: ${e}`);
    }
  }

  async sendMessage(message: object): Promise<any> {
    return new Promise((resolve, reject) => {
      const stringMessage = JSON.stringify({
        ...message,
        timestamp: Date.now(),
      });

      this.ws.send(stringMessage, (err: any) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  setSelection(path: string, caretIndex: number, range: number) {
    this.editorSelection = {
      path,
      caretIndex,
      range,
    };

    // Bubble up to server
    this.server.broadcastConnectedClients();
  }
////////////////////////////////////////////////////////////////////////////////
// Handle close

  async close(code: number | undefined) {
    clearInterval(this.pingInterval);
    this.ws.close(code);
  }

  async onClose(code: number, message: string) {
    // 4001 = side effect free connection close
    if (code === 4001) {
      return;
    }

    // Cleanup
  }

////////////////////////////////////////////////////////////////////////////////
// Handle pings

  private ping() {
    if (this.numPingsSent >= 2) {
      clearInterval(this.pingInterval);
      this.ws.close();
    } else {
      this.numPingsSent += 1;
      try {
        this.ws.ping();
      } catch (e) {
        clearInterval(this.pingInterval);
        this.ws.close();
      }
    }
  }

  onPong(data: Buffer) {
    this.numPingsSent = 0;
  }
}
