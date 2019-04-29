import * as NodePty from 'node-pty';
import * as uuid from 'uuid';
import { PtyExpression, PtyFrame } from '../model/OutboundMessage';

export class Pty {
  private id: string;
  private name: string;
  private proc: NodePty.IPty;

  private frames: PtyFrame[] = [];

  public onData: ((frame: PtyFrame) => void) | null = null;
  public onExit: ((code: number) => void) | null = null;

  get socketExpression(): PtyExpression {
    return {
      ptyId: this.id,
      ptyName: this.name,
      frames: this.frames,
    };
  }

  constructor(id: string, cwd: string, name: string, username: string) {
    this.id = id;
    this.name = name;

    // console.log('initializing pty', this.id, this.name);

    this.proc = NodePty.spawn('bash', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd,
      env: {
        ...process.env,
        PS1: String.raw`\[[\]${username}@koji]$\[ \]`,
      },
    });

    this.proc.on('data', (value) => {
      const frame = {
        frameId: uuid.v4(),
        value: Buffer.from(value, 'binary').toString('base64'),
      };

      this.frames.push(frame);

      if (this.onData) {
        this.onData(frame);
      }
    });

    this.proc.on('exit', (code) => {
      if (this.onExit) {
        this.onExit(code);
      }
    });
  }

  resize(cols: number, rows: number) {
    this.proc.resize(cols, rows);
  }

  kill() {
    // console.log('killing pty', this.id);
    this.proc.kill();
  }

  write(frame: PtyFrame) {
    const value = Buffer.from(frame.value, 'base64').toString('binary');
    this.proc.write(value);
  }
}
