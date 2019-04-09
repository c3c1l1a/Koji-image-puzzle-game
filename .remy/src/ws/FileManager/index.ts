import { Server } from '../Server';

import { File } from './File';
import { OutboundMessage, OpenFile, EditorType } from '../model/OutboundMessage';

export class FileManager {
  private readonly server: Server;
  private readonly projectPath: string;

  private currentFile: string | null = null;
  private files: File[] = [];
  private lastOpenFilesMessage: object | null = null;

  constructor(server: Server, projectPath: string) {
    this.server = server;
    this.projectPath = projectPath;
  }

  public get openFilesMessage(): object {
    return OutboundMessage.getOpenFilesChangedCommand({
      openFiles: this.files.map(file => file.socketExpression),
      currentFile: this.currentFile,
    });
  }

  public get currentFileMessage(): object | null {
    if (this.currentFile) {
      const file = this.fileForPath(this.currentFile);
      if (file) {
        return file.fileLoadedMessage;
      }
    }
    return null;
  }

  indexForPath(path: string): number | undefined {
    const index = this.files.findIndex(file => file.path === path);
    if (index === -1) {
      return undefined;
    }
    return index;
  }

  fileForPath(path: string): File | null {
    const index = this.indexForPath(path);
    if (index !== undefined) {
      return this.files[index];
    }
    return null;
  }

  private onOpenFilesChanged() {
    // Don't broadcast if nothing has changed
    const newMessage = this.openFilesMessage;
    if (this.lastOpenFilesMessage) {
      if (JSON.stringify(newMessage) === JSON.stringify(this.lastOpenFilesMessage)) {
        return;
      }
    }

    this.lastOpenFilesMessage = newMessage;
    this.server.broadcast(newMessage);
  }

  open(path: string, editorType?: EditorType) {
    const existingFile = this.fileForPath(path);
    if (existingFile) {
      // File already open, broadcast contents
      existingFile.setSticky();
      existingFile.open(editorType);
    } else {
      // If the last item isn't sticky, remove it before pushing
      if (this.files.length > 0) {
        if (!this.files[this.files.length - 1].isSticky) {
          this.files.pop();
        }
      }

      const file = new File(this.server, this.projectPath, path);
      this.files.push(file);
      file.open(editorType);
    }

    // Set the file as the current file
    this.currentFile = path;

    this.onOpenFilesChanged();
  }

  close(path: string) {
    const index = this.indexForPath(path);
    if (index === undefined) {
      return;
    }

    // Set a new current file if we need to
    if (this.currentFile === path) {
      if (index === 0) {
        if (this.files.length > 1) {
          this.currentFile = this.files[index + 1].path;
        } else {
          this.currentFile = null;
        }
      } else {
        this.currentFile = this.files[index - 1].path;
      }
    }

    // Remove the file (closed)
    this.files.splice(index, 1);

    this.onOpenFilesChanged();

    if (this.currentFile) {
      const file = this.fileForPath(this.currentFile);
      if (file) {
        file.broadcastContents();
      }
    }
  }

  applyOperation(sessionId: string, path: string, operation: string) {
    const file = this.fileForPath(path);
    if (!file) {
      return;
    }
    file.setSticky();
    file.applyOperation(sessionId, operation);
    this.onOpenFilesChanged();
  }

  jsonSetValueAtPath(sessionId: string, path: string, key: string, newValue: string) {
    const file = this.fileForPath(path);
    if (!file) {
      return;
    }
    file.setSticky();
    file.jsonSetValue(sessionId, key, newValue);
    this.onOpenFilesChanged();
  }

  save(path: string) {
    const file = this.fileForPath(path);
    if (!file) {
      return;
    }
    file.save();

    this.onOpenFilesChanged();
  }
}
