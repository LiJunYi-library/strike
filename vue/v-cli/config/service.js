const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const mPath = require("../utils/mPath");
const path = require("path");
const formatterConfig = require("./webpack.config");

module.exports = class Service {
  constructor(props = {}) {
    this.config = {
      ...props,
    };
  }

  async server() {
    const htmlPath = await mPath.lookUp('index.html');
    const main = await mPath.lookUp(['main.js', 'main.ts']);
    const config = formatterConfig({
      entry: main,
      htmlTemplate: htmlPath,
    })
    const compiler = webpack(config);
    const server = new WebpackDevServer(config.devServer, compiler);
    server.start();
  }

  async servers() {
    const fp = './src';
    const files = await mPath.getFiles(fp);
    const enFils = files.map(async (name) => {
      const htmlPath = await mPath.lookUp('index.html', fp + `/${name}`);
      return ({
        name,
        htmlPath,
      })
    })
    const enObj = await Promise.all(enFils);
    console.log(files);
    console.log(enObj);
  }

  async build() {
    const htmlPath = await mPath.lookUp('index.html');
    const main = await mPath.lookUp(['main.js', 'main.ts']);
    const config = formatterConfig({
      entry: main,
      htmlTemplate: htmlPath,
      mode: "production",
    })
    const compiler = webpack(config);
    compiler.run();
  }
};
