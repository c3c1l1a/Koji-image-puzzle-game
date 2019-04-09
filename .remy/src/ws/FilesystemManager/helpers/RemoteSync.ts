import * as fs from 'fs';
import * as crypto from 'crypto';
import * as AWS from 'aws-sdk';
import Ignore from 'ignore';
import * as Throttle from 'promise-parallel-throttle';

import Timer = NodeJS.Timer;

async function computeHash(path: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('md5');
    hash.setEncoding('hex');

    const stream = fs.createReadStream(path);

    stream.on('end', () => {
      hash.end();
      resolve(hash.read() as string);
    });

    stream.pipe(hash);
  });
}

export class RemoteSync {
  private readonly projectPath: string;
  private readonly bucketName: string;
  private readonly prefix: string;
  private readonly s3: AWS.S3;

  private uploadQueueMap: {[index: string]: boolean} = {};
  private deleteQueueMap: {[index: string]: boolean} = {};

  private debounceTimer: Timer | null = null;

  public isSyncing: boolean = false;

  constructor(projectPath: string, bucketName: string, prefix: string) {
    this.projectPath = projectPath;
    this.bucketName = bucketName;
    this.prefix = prefix;
    this.s3 = new AWS.S3();
  }

  private getRelativePath(path: string): string {
    return path.replace(`${this.projectPath}/`, '');
  }

  filterIgnoredFiles(paths: string[]): string[] {
    // Get the list of files/paths to ignore
    const matchesObject: {[index: string]: boolean} = {
      // '.git/**': true,
      '.remy/**': true,
      '**/node_modules/**': true,
      Dockerfile: true,
    };

    try {
      fs.readFileSync(`${this.projectPath}/.kojiignore`, { encoding: 'utf8' })
        .split('\n')
        .filter(line => line)
        .forEach((line) => {
          matchesObject[line] = true;
        });
    } catch (err) {
      //
    }
    const ignore = Ignore().add(Object.keys(matchesObject));
    return paths.filter(path => !ignore.ignores(this.getRelativePath(path)));
  }

  public async upload(path: string) {
    await this.markForUpload(path);
  }

  private async markForUpload(path: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.uploadQueueMap[path] = true;
    // Remove from delete queue if it's in there
    if (this.deleteQueueMap[path]) {
      delete this.deleteQueueMap[path];
    }

    this.debounceTimer = setTimeout(async () => await this.processQueues(), 3000);
  }

  async processQueues() {
    this.isSyncing = true;
    try {
      await this.processDelete();
    } catch (err) {
      //
    }

    try {
      await this.processUpload();
    } catch (err) {
      //
    }
    this.isSyncing = false;
  }

  private async processUpload() {
    const filteredFiles = this.filterIgnoredFiles(Object.keys(this.uploadQueueMap));
    this.uploadQueueMap = {};

    const uploadFile = async (file: string) => {
      try {
        const stat = fs.statSync(file);
        if (stat.size > 1e8) {
          // File is larger than 100 mb, skip!
          console.log('Skipping giant file', stat.size);
          return;
        }
      } catch (err) {
        console.log('Err stating file', file);
      }

      // If the file hasn't changed, don't upload
      try {
        const hash = await computeHash(file);
        const { ETag } = await this.s3.headObject({
          Bucket: this.bucketName,
          Key: `${this.prefix}/${this.getRelativePath(file)}`,
        }).promise();
        if (ETag === `"${hash}"`) { // Etag returns a quoted string (why?)
          // console.log(`${file} has not changed, skipping`);
          return;
        }
      } catch (err) {
        // File does not exist on remote host
        // console.log(`${file} does not exist in S3, uploading`);
      }

      console.log(`Uploading ${file}`);

      try {
        await this.s3.upload({
          Bucket: this.bucketName,
          Key: `${this.prefix}/${this.getRelativePath(file)}`,
          Body: fs.createReadStream(file),
        }).promise();
      } catch (err) {
        console.log('Err uploading file', file);
      }
    };

    const queue = filteredFiles.map(file => () => uploadFile(file));

    await Throttle.all(queue, { maxInProgress: 5 });
  }

  async delete(path: string) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.deleteQueueMap[path] = true;
    // Remove from upload queue if it's in there
    if (this.uploadQueueMap[path]) {
      delete this.uploadQueueMap[path];
    }

    this.debounceTimer = setTimeout(async () => await this.processQueues(), 3000);
  }

  private async processDelete() {
    const filesToDelete = Object.keys(this.deleteQueueMap)
      .map(path => ({ Key: `${this.prefix}/${this.getRelativePath(path)}` }));

    if (filesToDelete.length === 0) {
      return;
    }

    await this.s3.deleteObjects({
      Bucket: this.bucketName,
      Delete: {
        Objects: filesToDelete,
      },
    }).promise();
  }
}
