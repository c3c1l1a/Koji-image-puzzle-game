var path = require('path');
const webpack = require('webpack');

const kojiProjectConfig = require('../.koji/resources/scripts/buildConfig.js')();

module.exports = {
  entry: "./main.js",
  output: {
      path: __dirname,
      filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, '/'),
    compress: true,
    port: 8080,
    host: '0.0.0.0',
    disableHostCheck: true
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        koji: kojiProjectConfig,
      },
    }),
  ]
};