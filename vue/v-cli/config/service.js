const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const mPath = require("../utils/mPath");
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

  async build() {
    const htmlPath = await mPath.lookUp('index.html');
    const main = await mPath.lookUp(['main.js', 'main.ts']);
    const config = formatterConfig({
      entry: main,
      htmlTemplate: htmlPath,
    })
    const compiler = webpack(config);
    compiler.run();
  }
};
