const path = require("path");
const webpack = require('webpack');

module.exports = {
  entry: ["./src/simu.ts"],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
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
  resolve: {
      extensions: ['.tsx', '.ts', '.js']
  },
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