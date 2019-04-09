import * as fs from 'fs';
import * as objectPath from 'object-path';
import { Server } from '../Server';
import { OutboundMessage, OpenFile, EditorType } from '../model/OutboundMessage';

import { TextOperation } from './helpers/TextOperation';

export class File {
  private readonly server: Server;
  private readonly projectPath: string;
  public readonly path: string;

  private body?: string;
  private sticky: boolean = false;
  public editorType: EditorType = EditorType.CODE;
  private hasUnsavedChanges: boolean = false;

  constructor(server: Server, projectPath: string, path: string) {
    this.server = server;
    this.projectPath = projectPath;
    this.path = path;
  }

  get socketExpression(): OpenFile {
    return {
      path: this.path,
      sticky: this.sticky,
      editorType: this.editorType,
      hasUnsavedChanges: this.hasUnsavedChanges,
    };
  }

  get fileLoadedMessage(): object | null {
    if (this.body === undefined) {
      return null;
    }

    return OutboundMessage.getFileLoadedCommand({
      path: this.path,
      body: this.body,
    });
  }

  open(editorType?: EditorType) {
    this.editorType = editorType || this.editorType;

    if (this.body !== undefined) {
      this.broadcastContents();
      return;
    }

    const stat = fs.statSync(`${this.projectPath}/${this.path}`);
    if (stat.size > 5e6) {
      // File is larger than 5 mb, skip!
      console.log('Skipping giant file', stat.size);
      return;
    }

    fs.readFile(`${this.projectPath}/${this.path}`, { encoding: 'utf8' }, (err, data) => {
      if (!err) {
        this.body = data;
        this.broadcastContents();
      }
    });
  }

  setSticky() {
    this.sticky = true;
  }

  get isSticky(): boolean {
    return this.sticky;
  }

  broadcastContents() {
    if (this.body === undefined) {
      return;
    }

    const message = this.fileLoadedMessage;
    if (message) {
      this.server.broadcast(message);
    }
  }

  applyOperation(fromSessionId: string, operationString: string) {
    if (this.body === undefined) {
      return;
    }
    this.hasUnsavedChanges = true;

    // Apply the operation to the server's copy of the file
    const operation = TextOperation.fromString(operationString);
    this.body = operation.apply(this.body);

    // Broadcast the operation to all clients
    const message = OutboundMessage.getOperationReceivedCommand({
      sessionId: fromSessionId,
      path: this.path,
      operation: operationString,
      ts: Date.now(),
    });
    this.server.broadcast(message);
  }

  jsonSetValue(fromSessionId: string, key: string, newValue: string) {
    if (this.body === undefined) {
      return;
    }

    try {
      const jsonBody = JSON.parse(this.body);
      objectPath.set(jsonBody, key, newValue);
      this.body = JSON.stringify(jsonBody, null, 2);

      const message = OutboundMessage.getJsonValueChangedCommand({
        sessionId: fromSessionId,
        path: this.path,
        key,
        newValue,
      });
      this.server.broadcast(message);
    } catch (err) {
      //
    }
  }

  save() {
    if (this.body === undefined) {
      return;
    }
    this.hasUnsavedChanges = false;
    fs.writeFile(`${this.projectPath}/${this.path}`, this.body, (err) => {
      // console.log('write err', err);
    });
  }
}
