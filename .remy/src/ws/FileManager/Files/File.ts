import * as fs from 'fs';
import * as objectPath from 'object-path';
import { OutboundMessage, EditorType } from '../../model/OutboundMessage';

import { TextOperation } from '../helpers/TextOperation';
import { BaseFile } from './BaseFile';

export class File extends BaseFile {
  async open(editorType?: EditorType) {
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
