import * as uuid from 'uuid';

import { Server } from '../Server';
import { OutboundMessage, PtyFrame } from '../model/OutboundMessage';

import { Pty } from './Pty';

export class PtyManager {
  private readonly server: Server;
  private readonly projectPath: string;
  private readonly creatorUsername: string;

  private ptys: {[index: string]: Pty} = {};

  constructor(server: Server, projectPath: string, creatorUsername: string) {
    this.server = server;
    this.projectPath = projectPath;
    this.creatorUsername = creatorUsername;
  }

  spawn(cwdOrNull?: string, nameOrNull?: string): string {
    const ptyId = uuid.v4();

    const cwd = (cwdOrNull) ? `${this.projectPath}/${cwdOrNull}` : this.projectPath;
    const name = nameOrNull || `Terminal ${Object.keys(this.ptys).length + 1}`;

    const pty = new Pty(ptyId, `${cwd}`, name, this.creatorUsername);

    pty.onData = (frame: PtyFrame) => {
      const message = OutboundMessage.getPtyDataReceivedCommand({
        ptyId,
        frame,
      });
      this.server.broadcast(message);
    };

    pty.onExit = (code: number) => {
      this.kill(ptyId);
    };

    this.ptys[ptyId] = pty;

    // Broadcast update
    this.updateStatus();

    return ptyId;
  }

  kill(ptyId: string) {
    if (!this.ptys[ptyId]) {
      return;
    }

    this.ptys[ptyId].kill();
    delete this.ptys[ptyId];

    // Broadcast update
    this.updateStatus();
  }

  write(ptyId: string, frame: PtyFrame) {
    if (!this.ptys[ptyId]) {
      return;
    }

    this.ptys[ptyId].write(frame);
  }

  resize(ptyId: string, cols: number, rows: number) {
    if (!this.ptys[ptyId]) {
      return;
    }

    this.ptys[ptyId].resize(cols, rows);
  }

  get ptyStatusChangedMessage(): object {
    return OutboundMessage.getPtysChangedCommand({
      ptys: Object.values(this.ptys).map(pty => pty.socketExpression),
    });
  }

  private updateStatus() {
    this.server.broadcast(this.ptyStatusChangedMessage);
  }
}
