const webpack = require("webpack");
// const AnalysisPath = require("./analysisPath");
// const getClientEnvironment = require("./env");
// const createConfig = require("./dev");
const webpackConfig = require("./webpack.dev");
const WebpackDevServer = require("webpack-dev-server");
const webpackCli = require("webpack-cli");

module.exports = class Service {
  constructor(props = {}) {
    this.config = {
      ...props,
    };

    // this.analysisPath = new AnalysisPath(this.command, this.executeFile, this.argument);
    // const env = getClientEnvironment(this.command, this.analysisPath);
    // console.log(this.analysisPath);
    // console.log(env);
    // const config = createConfig(this.analysisPath, env.definePluginParams, this.argument.frame);
  }

  server() {
    const compiler = webpack(webpackConfig);
    const server = new WebpackDevServer(webpackConfig.devServer, compiler);
    server.start();
  }

  build() {
    const compiler = webpack(webpackConfig);
    compiler.run();
  }
};
