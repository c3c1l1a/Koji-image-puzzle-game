/* eslint consistent-return:0 */

const express = require('express');

const hotReloadMiddleware = require('./middleware/hotReloadMiddleware');

const { resolve } = require('path');
const app = express();

hotReloadMiddleware(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// Start your app.
app.listen(8080, null, async err => {
  if (err) {
    console.log(err.message);
  }
  console.log('[webpack] Frontend server started (port 8080)');
});
