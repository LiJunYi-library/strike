const path = require("path");
const EslintWebpackPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const { merge } = require("webpack-merge");
const webpack = require("webpack");
const isDevelopment = process.env.NODE_ENV !== "production";

const getStyleLoader = (pre) => {
  return [
    "vue-style-loader",
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"],
        },
      },
    },
    pre,
  ].filter(Boolean);
};

const processEnv = JSON.stringify({
  NODE_ENV: "development",
});

const configPath = {
  context:  path.resolve("", `./src`),
  entry: path.resolve("", `./src/main.js`),
  html: path.resolve("", './public/index.html'),
  output:  path.resolve("", `./build`),
};


// console.log("configPath", configPath);

module.exports = {
  entry: configPath.entry,
  output: {
    path: configPath.output,
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].chuck.js",
    assetModuleFilename: "static/media/[hash:10][ext][query]",
  },

  module: {
    rules: [
      //
      {
        test: /\.css$/,
        use: getStyleLoader(),
      },
      {
        test: /\.less$/,
        use: getStyleLoader("less-loader"),
      },
      {
        test: /\.sass$/,
        use: getStyleLoader("sass-loader"),
      },
      {
        test: /\.styl$/,
        use: getStyleLoader("stylus-loader"),
      },
      //
      {
        test: /\.(png|jpg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024,
          },
        },
      },

      //
      {
        test: /\.(woff2|ttf)$/,
        type: "asset/resource",
      },
      //
      {
        test: /\.js?$/,
        include: configPath.context,
        loader: "babel-loader",
        options: {
          cacheDirectory: true,
          cacheCompression: true,
          // plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean),
        },
      },
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          // cacheDirectory: path.resolve(__dirname, '../node_modules/.cache/vue-loader'),
        },
      },
    ],
  },

  plugins: [
    // new EslintWebpackPlugin({
    //   context: path.resolve(__dirname, `../${runDir}`),
    //   exclude: 'node_modules',
    //   cache: true,
    //   cacheLocation: path.resolve('', './node_modules/.cache/.eslintcache'),
    // }),
    // new HtmlWebpackPluginEjsResolver(HtmlWebpackPlugin, {}),
    new HtmlWebpackPlugin({
      template: configPath.html,
      inject: true,
      templateParameters: {
        NODE_ENV: "哈哈哈哈哈哈哈哈哈哈",
      },
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
    }),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      "process.env": { NODE_ENV: '"development"' },
    }),

    // isDevelopment && new ReactRefreshWebpackPlugin()
  ].filter(Boolean),
  mode: "development",
  devtool: "cheap-module-source-map",
  resolve: {
    extensions: [".vue", ".js", ".json"],
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
    usedExports: true,
    // 压缩模块
    // minimize: true
  },
  devServer: {
    host: "localhost",
    open: true,
    hot: true,
    historyApiFallback: true,
  },
  performance: false,
};
