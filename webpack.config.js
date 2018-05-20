/* eslint-env node */

// To clean the 'dist' folder before every rebuild.
const CleanWebpackPlugin = require('clean-webpack-plugin');

// To inject generated scritps and styles into HTML.
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

const CompressionPlugin = require('compression-webpack-plugin');

// To extract generated CSS into its own files.
//
// I choose this plugin instead of ExtractTextWebpackPlugin
// because ExtractTextWebpackPlugin doesn't support Webpack 4 yet.
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const OfflinePlugin = require('offline-plugin');

// Instead of exporting a config object, I choose to export
// a function to be able to access command line args, especially
// to be able the access the 'mode' argument, which would be either
// 'development' or 'production'.
//
// https://github.com/webpack/webpack/issues/6460
module.exports = (env, argv) => {
  // Are we building for production?
  const isProd = argv.mode == 'production';

  // If this app was SPA, it would be very easy to setup webpack,
  // but since this app has multiple pages, each with its
  // HTML document, JS scripts and SASS styles, we will need
  // to have multiple entry points, and generate a bundle for each page.

  const pages = ['index', 'restaurant'];

  const entry = {};
  const htmlPlugins = [];

  pages.forEach(page => {
    const directory = `./src/pages/${page}`;

    entry[page] = `${directory}/${page}`;

    htmlPlugins.push(
      new HtmlWebpackPlugin({
        filename: page + '.html',
        template: `${directory}/${page}.html`,
        chunks: [page],

        inlineSource: '.(js|css)$',

        // Minify in production only.
        minify: isProd && {
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          removeComments: true,
          removeEmptyAttributes: true,
        },
      })
    );
  });

  return {
    entry,

    output: {
      filename: 'js/[name].[chunkhash].js',
      path: __dirname + '/dist',
    },

    devServer: {
      contentBase: __dirname + '/dist',
      compress: true,
    },

    resolve: {
      alias: {
        // To be able to do things like:
        // `import DBHelper from '~/dbhelper'`
        // instead of:
        // `import DBHelper from '../../dbhelper'
        '~': __dirname + '/src/',
      },
    },

    module: {
      rules: [
        // ES6 to ES5 + Linting
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader'],
        },

        // SASS to CSS
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                // Minify in production only.
                minimize: isProd,
              },
            },
            'sass-loader',
          ],
        },
      ],
    },

    plugins: [
      // To clean the 'dist' folder before every rebuild.
      new CleanWebpackPlugin('./dist', {
        watch: true,
        exclude: ['img', 'manifest.json'],
      }),

      // To extract generated CSS into its own files.
      new MiniCssExtractPlugin({
        filename: 'css/[name].[contenthash].css',
        path: __dirname + '/dist/css',
      }),

      ...htmlPlugins,

      new HtmlWebpackInlineSourcePlugin(),

      new OfflinePlugin({
        ServiceWorker: {
          entry: './src/sw.js',
          events: true,
        },
      }),

      new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,  
      }),
    ],
  };
};
