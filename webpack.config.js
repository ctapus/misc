const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    simu: './src/simu.ts',
    etymology: './src/etymology.ts'
  },
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, './scripts'),
    filename: './[name].js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
      new webpack.ProvidePlugin({            
          $: 'jquery',
          jQuery: 'jquery',
          jquery: 'jquery'
      })
  ],
  devServer: {
      stats: 'errors-only',
      host: process.env.HOST,
      port: process.env.PORT,
      open: true,
      overlay: true,
      contentBase: './',
      openPage: ''
    }
};