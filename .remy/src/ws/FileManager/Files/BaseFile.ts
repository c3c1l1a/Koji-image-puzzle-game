import { Server } from '../../Server';
import { OutboundMessage, OpenFile, EditorType } from '../../model/OutboundMessage';

export interface BaseFile {
  open(editorType?: EditorType): void;
  applyOperation?(fromSessionId: string, operationString: string): void;
  jsonSetValue?(fromSessionId: string, key: string, newValue: string): void;
  save?(): void;
  close?(): void;
}

export class BaseFile {
  protected readonly server: Server;
  protected readonly projectPath: string;
  public readonly path: string;

  protected body?: string;
  protected sticky: boolean = false;
  public editorType: EditorType = EditorType.CODE;
  protected hasUnsavedChanges: boolean = false;

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
}
