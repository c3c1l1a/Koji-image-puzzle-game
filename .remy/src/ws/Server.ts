import * as WebSocket from 'ws';
import * as os from 'os';
import * as url from 'url';
import Timer = NodeJS.Timer;

import { Server as HttpServer } from 'http';

import { getDiskUsage } from './helpers/getDiskUsage';
import { getMemoryUsage } from './helpers/getMemoryUsage';

import { Client } from './Client';
import { FileManager } from './FileManager';
import { FilesystemManager } from './FilesystemManager';
import { PtyManager } from './PtyManager';

import { OutboundMessage } from './model/OutboundMessage';
import { Color } from './model/Color';
import { GitManager } from './GitManager';

const COLORS: Color[] = [
  { fg: '#ff0080', bg: '#fdbad8' },
  { fg: '#0D47A1', bg: '#BBDEFB' },
  { fg: '#004D40', bg: '#B2DFDB' },
  { fg: '#E65100', bg: '#FFE0B2' },
];

export class Server {
  private readonly filesystemManager: FilesystemManager;
  private readonly fileManager: FileManager;
  private readonly ptyManager: PtyManager;
  private readonly gitManager: GitManager;

  private readonly server: HttpServer;
  private readonly wss: WebSocket.Server;

  public readonly creatorUsername: string;

  private clients: Client[] = [];

  private systemStatusInterval: Timer | null = null;
  private cachedSystemStatusMessage: object | null = null;

  constructor(
    port: number,
    projectPath: string,
    creatorUsername: string,
    defaultPtys: {[index: string]: any}[],
    remoteBucketName: string,
    remoteBucketPrefix: string,
  ) {
    this.creatorUsername = creatorUsername;

    this.gitManager = new GitManager(this);
    this.filesystemManager = new FilesystemManager(this, this.gitManager, projectPath, remoteBucketName, remoteBucketPrefix);
    this.fileManager = new FileManager(this, projectPath, this.gitManager);
    this.ptyManager = new PtyManager(this, projectPath, creatorUsername);

    this.server = require('http').createServer();
    this.wss = new WebSocket.Server({
      server: this.server,
    });

    // Start
    this.initWss();
    this.server.listen(port);
    console.log('REMY_STARTED');
    console.log(`WS server started at: ${JSON.stringify(this.wss.address())}`);

    this.onStart(defaultPtys);

    this.systemStatusInterval = setInterval(() => this.updateSystemStatus(), 1000 * 5); // every five seconds
  }

  async updateSystemStatus() {
    this.cachedSystemStatusMessage = OutboundMessage.getSystemStatusChangedCommand({
      filesystemStatus: this.filesystemManager.status,
      memoryUsage: getMemoryUsage(),
      diskUsage: await getDiskUsage(),
    });
    this.broadcast(this.cachedSystemStatusMessage);
  }

  onStart(commands: {[index: string]: any}[]) {
    commands.forEach(({ name, cwd, command }) => {
      const pty = this.ptyManager.spawn(cwd, name);
      this.ptyManager.write(pty, { value: Buffer.from(`${command}\r`, 'binary').toString('base64') });
    });
  }

  public broadcast(message: object) {
    this.clients.forEach((client) => {
      client.sendMessage(message);
    });
  }

  public broadcastConnectedClients() {
    const message = OutboundMessage.getConnectedClientsChangedCommand({
      clients: this.clients.map(client => client.clientState),
    });
    this.clients.forEach((client) => {
      client.sendMessage(message);
    });
  }

  public async shutdown() {
    console.log('Shutting down...');
    return Promise.all(this.clients.map(async (client) => {
      return client.close(1012);
    }));
  }

  private initWss() {
    this.wss.on('connection', (ws, req) => {
      const request = url.parse(`${req.url}`, true);
      const clientId = <string> request.query.client_id;
      const sessionId = <string> request.query.session_id;
      const userProfile = JSON.parse(req.headers['x-koji-user'] as string);
      const isController = (<string> req.headers['x-koji-is-controller'] === 'true'); // header comes in as a string value
      const color = COLORS[(this.clients.length + 1) % 4];

      const state = new Client(
        this,
        ws,
        this.filesystemManager,
        this.fileManager,
        this.ptyManager,
        clientId,
        sessionId,
        userProfile,
        isController,
        color,
      );
      console.log(`New connection: ${clientId}`);

      // Store client's state in map
      this.clients.push(state);

      // Broadcast
      this.broadcastConnectedClients();

      // If we have a system status, update the client
      if (this.cachedSystemStatusMessage) {
        state.sendMessage(this.cachedSystemStatusMessage);
      }

      // Handle socket events
      ws
        .on('message', (data) => {
          if (typeof data === 'string') {
            state.onMessage(data)
              .catch((err: any) => console.log(`Error handing message: ${err}`));
          }
        })
        .on('close', async (code, reason) => {
          console.log(`Closing connection (${code}) for ${clientId}`);

          await state.onClose(code, reason);

          this.clients = this.clients
            .filter(client => client.clientId !== state.clientId);

          this.broadcastConnectedClients();
        })
        .on('pong', (data) => { state.onPong(data); })
        .on('data', () => {})
        .on('error', () => {});
    });
  }
}
