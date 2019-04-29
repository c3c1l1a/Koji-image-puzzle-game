"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var AWS = require("aws-sdk");
var Server_1 = require("./ws/Server");
var PORT = Number(process.env.REMY_PORT) || 4387;
var PROJECT_PATH = process.env.PROJECT_PATH || '/Users/sean/Desktop/test';
var CREATOR_USER_NAME = process.env.CREATOR_USER_NAME || 'user';
var DEFAULT_PTYS = [];
try {
    DEFAULT_PTYS = JSON.parse(process.env.DEFAULT_PTYS || '[]');
}
catch (err) {
    //
}
var REMOTE_BUCKET_NAME = '';
var REMOTE_BUCKET_PREFIX = '';
try {
    var awsKeys = JSON.parse(process.env.REMY_AWS_KEYS || '{}');
    REMOTE_BUCKET_NAME = awsKeys.bucketName;
    REMOTE_BUCKET_PREFIX = process.env.KOJI_PROJECT_ID || '';
    console.log(REMOTE_BUCKET_NAME, REMOTE_BUCKET_PREFIX);
    AWS.config.update({
        accessKeyId: awsKeys.accessKeyId,
        secretAccessKey: awsKeys.secretAccessKey,
        sessionToken: awsKeys.sessionToken,
        region: awsKeys.region,
    });
}
catch (err) {
    console.error('Failed to intialize AWS credentials!');
}
function startServer() {
    var websocket = new Server_1.Server(PORT, PROJECT_PATH, CREATOR_USER_NAME, DEFAULT_PTYS, REMOTE_BUCKET_NAME, REMOTE_BUCKET_PREFIX);
    process.on('SIGTERM', function () {
        websocket.shutdown()
            .then(function () { return process.exit(0); })
            .catch(function (err) {
            console.error("Error shutting down sockets: " + err);
            process.exit(-1);
        });
    });
    process.on('unhandledRejection', function (reason, p) {
        console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        if (reason && reason.stack) {
            console.log(reason.stack);
        }
    });
}
// Run the shell script
var _a = process.env, KOJI_ORIGIN_REMOTE = _a.KOJI_ORIGIN_REMOTE, KOJI_GIT_USERNAME = _a.KOJI_GIT_USERNAME, KOJI_GIT_TOKEN = _a.KOJI_GIT_TOKEN;
if (KOJI_ORIGIN_REMOTE && KOJI_GIT_USERNAME && KOJI_GIT_TOKEN) {
    var repoInit = child_process_1.spawn('bash', ['/usr/src/app/.remy/scripts/addRemotes.sh', KOJI_GIT_USERNAME, KOJI_GIT_TOKEN, KOJI_ORIGIN_REMOTE]);
    if (repoInit.stdout) {
        repoInit.stdout.on('data', function (data) { return console.log(data.toString()); });
    }
    if (repoInit.stderr) {
        repoInit.stderr.on('data', function (data) { return console.log(data.toString()); });
    }
}
startServer();
//# sourceMappingURL=app.js.map