import copyWebpackPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import * as path from 'node:path';
import * as webpack from 'webpack';

import { createDevelopmentManifest, manifestNs } from './build/scripts/manifest';

const config = (environment: unknown, options: { mode: string; env: unknown }): webpack.Configuration => {
  let pluginNs = manifestNs;

  if (options.mode === 'development') {
    pluginNs = 'dev.' + manifestNs;
  }

  return {
    entry: {
      plugin: './build/entries/PluginEntry.ts',
      propertyinspector: './build/entries/PropertyinspectorEntry.ts',
    },
    module: {
      rules: [
        {
          exclude: /node_modules/,
          test: /\.(ts|js)$/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          enforce: 'pre',
          test: /\.js$/,
          use: [
            {
              loader: 'source-map-loader',
              options: {
                filterSourceMappingUrl: () => false,
              },
            },
          ],
        },
      ],
    },
    optimization: {
      splitChunks: {},
    },
    output: {
      library: 'connectElgatoStreamDeckSocket',
      libraryExport: 'default',
      path: path.resolve(__dirname, 'dist/' + pluginNs + '.sdPlugin/js'),
    },
    plugins: [
      new copyWebpackPlugin({
        patterns: [
          {
            from: 'assets',
            to: path.resolve(__dirname, 'dist/' + pluginNs + '.sdPlugin'),
            toType: 'dir',
            transform: (content, path) => {
              if (options.mode === 'development' && /manifest\.json$/.test(path)) {
                return createDevelopmentManifest();
              }
              if (!/\.html/.test(path)) {
                return content;
              }
              return content.toString().replace('{{ PLUGIN_NS }}', pluginNs);
            },
          },
        ],
      }),
      new ForkTsCheckerWebpackPlugin(),
    ],
    resolve: {
      extensions: ['.ts', '.js'],
    },
    target: ['web', 'es6'],
  };
};

export default config;
