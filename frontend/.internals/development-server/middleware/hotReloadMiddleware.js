const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

function createWebpackMiddleware(compiler, publicPath) {
  return webpackDevMiddleware(compiler, {
    logLevel: 'warn',
    publicPath,
    silent: true,
    stats: 'errors-only',
    logger: {
      info: (log) => {
        if (log === 'Compiling...') {
          console.log('##frontend-building##');
        } else if (log === 'Compiled successfully.' || log === 'Compiled with warnings.') {
          console.log('##frontend-built##');
        } else if (log === 'Failed to compile.') {
          console.log('##frontend-build-error##');
        } else {
          console.log(log);
        }
      },
      trace: (log) => console.trace(log),
      debug: (log) => console.debug(log),
      warn: (log) => console.warn(log),
      error: (log) => console.error(log),
    },
  });
}

module.exports = (app, options) => {
  const webpackConfig = require('../../webpack/webpack.dev.babel');

  const compiler = webpack(webpackConfig);
  const middleware = createWebpackMiddleware(
    compiler,
    webpackConfig.output.publicPath,
  );

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));

  // Since webpackDevMiddleware uses memory-fs internally to store build
  // artifacts, we use it instead
  const fs = middleware.fileSystem;

  app.get('/*', (req, res) => {
    fs.readFile(path.join(compiler.outputPath, 'index.html'), (err, file) => {
      if (err) {
        res.sendStatus(404);
      } else {
        res.send(file.toString());
      }
    });
  });

  return app;
};
