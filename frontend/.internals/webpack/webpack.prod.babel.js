// Important modules this config uses
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const { HashedModuleIdsPlugin } = require('webpack');

const kojiProjectConfig = JSON.parse(require('../../../.koji/resources/scripts/buildConfig')());

module.exports = require('./webpack.base.babel')({
  mode: 'production',
  entry: [path.join(process.cwd(), 'index.js')],
  output: {
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].chunk.js',
  },
  optimization: {
    minimize: true,
    nodeEnv: 'production',
    sideEffects: true,
    concatenateModules: true,
    splitChunks: { chunks: 'all' },
    runtimeChunk: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: '.internals/webpack/resources/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: true,
    }),

    new OfflinePlugin({
      relativePaths: false,
      publicPath: '/',
      appShell: '/',
      excludes: ['.htaccess'],
      caches: {
        main: [':rest:'],
        additional: ['*.chunk.js'],
      },
      safeToUseOptionalCaches: true,
    }),

    new HashedModuleIdsPlugin({
      hashFunction: 'sha256',
      hashDigest: 'hex',
      hashDigestLength: 20,
    }),
  ],
});
