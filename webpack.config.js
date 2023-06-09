const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const path = require("path");

const isProduction =
  process.argv[process.argv.indexOf("--mode") + 1] === "production";

let plugins = [new HtmlWebpackPlugin({ template: "./src/index.html" })];

if (isProduction) {
  plugins = [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inject: "body",
    }),
    new HtmlInlineScriptPlugin(),
  ];
}

module.exports = {
  entry: "./src/js/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 8080,
    hot: true,
    watchFiles: ["src/**/*"],
  },
  plugins: plugins,
  module: {
    rules: [
      {
        test: /\.(scss)$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: () => [require("autoprefixer")],
              },
            },
          },
          {
            loader: "sass-loader",
          },
        ],
      },
    ],
  },
};
