/**
 * webpack.development.js
 * 
 * What it Does:
 *   Webpack is the system that this project uses to turn react code into
 *   plain javascript. This file tells webpack what to do when you want
 *   a development server to be created. This file sets up automatic reload
 *   as well as putting the configuration options into process.env to be
 *   picked up by the react app.
 * 
 * Things to Edit:
 *   Be careful when editing webpack configuration as it gets confusing
 *   quickly. If you want to make any changes to how your app is being
 *   rendered in development then this is the place to look. Things like
 *   transpiling a new file type or adding a webpack plugin can be done
 *   here.
 */

var path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var ManifestPlugin = require('webpack-manifest-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const kojiManifest = require('../../.koji/scripts/buildManifest.js')();

module.exports = {
  watch: true,
  entry: "./common/index.js",
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        // Preprocess our own .css files
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        // Preprocess 3rd party .css files located in node_modules
        test: /\.css$/,
        include: /node_modules/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(eot|otf|ttf|woff|woff2)$/,
        use: 'file-loader',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10 * 1024,
              noquotes: true,
            },
          },
        ],
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10 * 1024,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                enabled: false,
              },
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.(mp4|webm)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
          },
        },
      },
    ]
  },
  devServer: {
    compress: true,
    port: 8080,
    host: '0.0.0.0',
    disableHostCheck: true,
    overlay: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new ManifestPlugin({
      fileName: 'manifest.webmanifest',
      basePath: '/',
      seed: JSON.parse(kojiManifest),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: './common/index.html',
    }),
    new WorkboxPlugin.GenerateSW(),
  ],
  resolve: {
    modules: ['node_modules', 'frontend'],
    extensions: ['.js', '.jsx', '.react.js'],
    mainFields: ['browser', 'jsnext:main', 'main'],
  },

};