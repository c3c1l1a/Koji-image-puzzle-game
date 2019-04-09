import * as AWS from 'aws-sdk';

import { Server } from './ws/Server';

const PORT = Number(process.env.REMY_PORT) || 4387;
const PROJECT_PATH = process.env.PROJECT_PATH || '/Users/sean/Desktop/test';
const CREATOR_USER_NAME = process.env.CREATOR_USER_NAME || 'user';

let DEFAULT_PTYS: {[index: string]: any}[] = [];
try {
  DEFAULT_PTYS = JSON.parse(process.env.DEFAULT_PTYS || '[]');
} catch (err) {
  //
}

let REMOTE_BUCKET_NAME: string = '';
let REMOTE_BUCKET_PREFIX: string = '';
try {
  const awsKeys = JSON.parse(process.env.REMY_AWS_KEYS || '{}');
  REMOTE_BUCKET_NAME = awsKeys.bucketName;
  REMOTE_BUCKET_PREFIX = process.env.KOJI_PROJECT_ID || '';

  console.log(REMOTE_BUCKET_NAME, REMOTE_BUCKET_PREFIX);

  AWS.config.update({
    accessKeyId: awsKeys.accessKeyId,
    secretAccessKey: awsKeys.secretAccessKey,
    sessionToken: awsKeys.sessionToken,
    region: awsKeys.region,
  });
} catch (err) {
  console.error('Failed to intialize AWS credentials!');
}

function startServer() {
  const websocket = new Server(
    PORT,
    PROJECT_PATH,
    CREATOR_USER_NAME,
    DEFAULT_PTYS,
    REMOTE_BUCKET_NAME,
    REMOTE_BUCKET_PREFIX,
  );

  process.on('SIGTERM', () => {
    websocket.shutdown()
      .then(() => process.exit(0))
      .catch((err: any) => {
        console.error(`Error shutting down sockets: ${err}`);
        process.exit(-1);
      });
  });

  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    if (reason && reason.stack) {
      console.log(reason.stack);
    }
  });
}

startServer();
