import * as Chokidar from 'chokidar';
import * as fs from 'fs';
import Timer = NodeJS.Timer;

import { Server } from '../Server';
import { OutboundMessage, KojifilesChanged } from '../model/OutboundMessage';

import { exec } from './helpers/exec';
import { mkdirp } from './helpers/mkdirp';
import { rimraf } from './helpers/rimraf';
import { RemoteSync } from './helpers/RemoteSync';
import { getKojifilesChangedMessage } from './helpers/getKojifilesChangedMessage';
import { GitManager } from '../GitManager';
import { buildTree } from './helpers/buildTree';
import { FileManager } from '../FileManager';

export class FilesystemManager {
  private readonly server: Server;
  private readonly gitManager: GitManager;
  private readonly fileManager: FileManager;
  private readonly projectPath: string;

  private readonly remoteSync: RemoteSync;

  private watcher: Chokidar.FSWatcher | null = null;

  private files: string[] = [];

  private broadcastDebounceTimer: Timer | null = null;

  public kojifilesBroadcastMessage: object | null = null;
  private kojifilesBroadcastDebounceTimer: Timer | null = null;
  private gitfilesChangedDebounceTimer: Timer | null = null;

  public get filesystemChangedMessage(): object {
    const paths = [
      '.git-info',
      ...this.files.filter(file => file),
    ];
    return OutboundMessage.getFilesystemChangedCommand({
      paths,
      tree: buildTree(paths),
    });
  }

  public get status(): 'syncing'|'synced' {
    return this.remoteSync.isSyncing ? 'syncing' : 'synced';
  }

  constructor(server: Server, gitManager: GitManager, fileManager: FileManager, projectPath: string, remoteBucket: string, remotePrefix: string) {
    this.server = server;
    this.gitManager = gitManager;
    this.fileManager = fileManager;
    this.projectPath = projectPath;
    this.remoteSync = new RemoteSync(projectPath, remoteBucket, remotePrefix);

    this.startWatcher();

    this.ls();
  }

  private getRelativePath(path: string): string {
    return path.replace(`${this.projectPath}/`, '');
  }

  private onFilesystemChanged() {
    if (this.broadcastDebounceTimer) {
      clearTimeout(this.broadcastDebounceTimer);
    }
    this.broadcastDebounceTimer = setTimeout(() => {
      this.server.broadcast(this.filesystemChangedMessage);
    }, 500);
  }

  private onKojifilesChanged() {
    if (this.kojifilesBroadcastDebounceTimer) {
      clearTimeout(this.kojifilesBroadcastDebounceTimer);
    }
    this.kojifilesBroadcastDebounceTimer = setTimeout(async () => {
      this.kojifilesBroadcastMessage = await getKojifilesChangedMessage();
      this.server.broadcast(this.kojifilesBroadcastMessage);
    }, 500);
  }

  private startWatcher() {
    this.watcher = Chokidar.watch(this.projectPath, {
      ignored: [
        `${this.projectPath}/**/node_modules`,
        `${this.projectPath}/.remy`,
        `${this.projectPath}/Dockerfile`,
      ],
      usePolling: true,
    });

    this.watcher.on('add', (rawPath: string) => {
      const path = this.getRelativePath(rawPath);
      // console.log('added', path);

      // Don't push files from the git folder to the user
      if (!this.files.includes(path) && !path.startsWith('.git/')) {
        this.files.push(path);
        this.onFilesystemChanged();
      }

      this.remoteSync.upload(rawPath);

      if (path.includes('koji') && path.endsWith('.json')) {
        this.onKojifilesChanged();
      }

      if (path.includes('.git/')) {
        this.onGitfilesChanged();
      }
    });

    this.watcher.on('change', (rawPath: string) => {
      // console.log('changed', rawPath);
      this.remoteSync.upload(rawPath);

      if (rawPath.includes('koji') && rawPath.endsWith('.json')) {
        this.onKojifilesChanged();
      }

      if (rawPath.includes('.git/')) {
        this.onGitfilesChanged();
      }

      // Notify the file manager
      this.fileManager.onFileChangedOnDisk(this.getRelativePath(rawPath));
    });

    this.watcher.on('unlink', (rawPath: string) => {
      const path = this.getRelativePath(rawPath);
      // console.log('removed', path);

      this.files = this.files.filter(file => file !== path);
      this.onFilesystemChanged();

      this.remoteSync.delete(rawPath);

      if (path.includes('koji') && path.endsWith('.json')) {
        this.onKojifilesChanged();
      }

      if (path.includes('.git/')) {
        this.onGitfilesChanged();
      }
    });
  }

  // List all files
  async ls() {
    const exclude: string[] = [
      '*/.remy/*',
      '*/.git/*',
      '*/node_modules/*',
      '*/Dockerfile',
    ];

    const excludeString = exclude.map(item => `-not -path "${item}"`).join(' ');

    try {
      this.files = (await exec(`find ${this.projectPath} -type f ${excludeString}`))
        .toString()
        .split('\n')
        .map(path => this.getRelativePath(path));
    } catch (err) {
      //
    }

    this.onFilesystemChanged();
  }

  // Remove
  async rm(path: string) {
    await rimraf(`${this.projectPath}/${path}`);
    this.fileManager.onFileRemoved(path);
  }

  // Move
  async mv(source: string, dest: string) {
    const destPath = dest.split('/');

    const destCopy = [...destPath];
    destCopy.pop();

    if (destCopy.length > 0) {
      await mkdirp(`${this.projectPath}/${destCopy.join('/')}`);
    }

    try {
      await exec(`mv ${this.projectPath}/${source} ${this.projectPath}/${destPath.join('/')}`);
      this.fileManager.onFilesMoved(source, dest);
    } catch (err) {
      //
    }
  }

  // Initialize an empty file
  async touch(fullPath: string) {
    const path = fullPath.split('/');
    path.pop(); // mutates

    if (path.length > 0) {
      await mkdirp(`${this.projectPath}/${path.join('/')}`);
    }
    fs.writeFileSync(`${this.projectPath}/${fullPath}`, '');
  }

  private onGitfilesChanged() {
    this.gitManager.markGitOperationInProgress(true);

    if (this.gitfilesChangedDebounceTimer) {
      clearTimeout(this.gitfilesChangedDebounceTimer);
    }

    this.gitfilesChangedDebounceTimer = setTimeout(() => {
      this.gitManager.markGitOperationInProgress(false);
      this.gitfilesChangedDebounceTimer = null;
    }, 2000);
  }
}
