const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const getStyleLoader = (pre) => {
  return [
    // "vue-style-loader",
    MiniCssExtractPlugin.loader,
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

const comPath = path.resolve("");
console.log("comPath", comPath);
const comPath2 = path.resolve(__dirname, "../../../node_modules/@rainbow_ljy");
console.log("comPath2", comPath2);

function formatterConfig(props) {
  const config = {
    mode: "development",
    context: path.resolve(""),
    entry: '',
    htmlTemplate: '',
    outputPath: path.resolve("", `./build`),
    ...props
  }

  const isDevelopment = process.env.NODE_ENV !== "production";

  return {
    entry: config.entry,
    output: {
      clean: true,
      path: config.outputPath,
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
          test: /\.scss$/,
          use: getStyleLoader("sass-loader"),
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
        {
          test: /\.js?$/,
          include: config.context,
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            cacheCompression: true,
          },
        },
        {
          test: /\.(jsx|js|mjs)$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@vue/cli-plugin-babel/preset"],
            },
          },
        },

        {
          test: /\.(vue)$/,
          loader: "vue-loader",
          options: {

          },
          // include: [comPath, comPath2],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: config.htmlTemplate,
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
        "process.env": { NODE_ENV: `"${config.mode}"` },
      }),
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].css',
        chunkFilename: 'static/css/[name].chunk.css',
      })
    ].filter(Boolean),
    mode: config.mode,
    devtool: "source-map", //"cheap-module-source-map",
    resolve: {
      extensions: [".vue", ".js", ".mjs", ".jsx", ".json"],
    },
    optimization: {
      splitChunks: {
        chunks: "all",
      },
      runtimeChunk: {
        name: (entrypoint) => `runtime~${entrypoint.name}.js`,
      },
      usedExports: true,
      minimize: true,
      minimizer: [
        new CssMinimizerPlugin(),
        new TerserPlugin(),
      ],
    },
    devServer: {
      host: "localhost",
      open: true,
      hot: true,
      historyApiFallback: true,
    },
    performance: false,

  }
}

module.exports = formatterConfig;



