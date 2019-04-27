import { BaseFile } from './BaseFile';
import { EditorType } from '../../model/OutboundMessage';
import { Server } from '../../Server';
import { GitManager } from '../../GitManager';

export class GitInfo extends BaseFile {
  private readonly gitManager: GitManager;
  private readonly statusChangedCallback: (status: {[index: string]: any}) => void;

  constructor(server: Server, projectPath: string, path: string, gitManager: GitManager) {
    super(server, projectPath, path);
    this.gitManager = gitManager;

    this.statusChangedCallback = (status: {[index: string]: any}) => {
      this.body = JSON.stringify(status, null, 2);
      this.broadcastContents();
    };
    this.gitManager.onStatusChanged(this.statusChangedCallback);
  }

  open(editorType?: EditorType) {
    this.editorType = editorType || this.editorType;

    if (this.body !== undefined) {
      this.broadcastContents();
      return;
    }

    // Get the body
    this.gitManager.getStatus();
  }

  close() {
    this.gitManager.removeStatusChanged(this.statusChangedCallback);
  }
}
