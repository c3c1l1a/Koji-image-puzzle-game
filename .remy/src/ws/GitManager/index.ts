import * as Git from 'simple-git/promise';
import { exec } from 'child_process';
import { Server } from '../Server';
import { OutboundMessage } from '../model/OutboundMessage';
import Timer = NodeJS.Timer;

export class GitManager {
  private readonly server: Server;
  private readonly git: Git.SimpleGit;

  private isOperationInProgress: boolean = false;
  private isLoading: boolean = true;
  private cachedStatus: {[index: string]: any} = {};

  private statusChangedListeners: ((status: {[index: string]: any}) => void)[] = [];

  constructor(server: Server) {
    this.server = server;
    this.git = Git('/usr/src/app');
  }

  get status(): {[index: string]: any} {
    return {
      isOperationInProgress: this.isOperationInProgress,
      isLoading: this.isLoading,
      ...this.cachedStatus,
    };
  }

  markGitOperationInProgress(isInProgress: boolean) {
    // Only update if we're sending new info
    if (this.isOperationInProgress && !isInProgress ||
        !this.isOperationInProgress && isInProgress) {
      this.isOperationInProgress = isInProgress;
      this.statusChanged();
    }
  }

  onStatusChanged(callback: (status: {[index: string]: any}) => void) {
    this.statusChangedListeners.push(callback);
  }
  removeStatusChanged(callback: (status: {[index: string]: any}) => void) {
    this.statusChangedListeners = this.statusChangedListeners.filter(item => item !== callback);
  }
  statusChanged() {
    this.statusChangedListeners.forEach((callback) => {
      callback(this.status);
    });
  }

  async getStatus() {
    this.isLoading = true;
    this.statusChanged();

    await this.updateRemotes();
    const currentLocalHash = (await this.git.revparse(['HEAD'])).trim();
    const currentRemoteHash = (await this.git.revparse(['origin/master'])).trim();

    const status = await this.git.status();
    const remote = (await this.git.listRemote(['--get-url'])).trim();

    let mostRecentUpstream = null;
    try {
      const upstream = await this.git.log(['-n', 1, 'upstream/master']);
      mostRecentUpstream = upstream.latest;
    } catch (err) {
      //
    }

    let mostRecentOrigin = null;
    try {
      const origin = await this.git.log(['-n', 1, 'origin/master']);
      mostRecentOrigin = origin.latest;
    } catch (err) {
      //
    }

    this.cachedStatus = {
      status,
      remote,
      currentLocalHash,
      currentRemoteHash,
      mostRecentOrigin,
      mostRecentUpstream,
    };
    this.isLoading = false;
    this.statusChanged();
  }

  async updateRemotes() {
    return new Promise((resolve) => {
      exec('git remote update', (err, res) => {
        resolve(res);
      });
    });
  }
}
