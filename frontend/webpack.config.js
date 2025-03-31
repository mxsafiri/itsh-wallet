const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  // Set the entry point to our web-specific entry file
  env.web = env.web || {};
  env.web.entry = './src/index.web.js';

  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    zlib: require.resolve('browserify-zlib'),
    stream: require.resolve('stream-browserify'),
    util: require.resolve('util/'),
    buffer: require.resolve('buffer/'),
    assert: require.resolve('assert/'),
    url: require.resolve('url/'),
    crypto: require.resolve('crypto-browserify'),
    querystring: require.resolve('querystring-es3'),
  };

  // Modify the resolve configuration
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'assets'),
  ];

  // Add aliases for better module resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'expo-secure-store': path.resolve(__dirname, 'src/polyfills/secureStorePolyfill.js'),
  };

  // Add a rule to handle missing images
  config.module.rules.push({
    test: /\.(png|jpe?g|gif|svg)$/i,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets/',
          esModule: false,
        },
      },
    ],
    include: [
      path.resolve(__dirname, 'assets'),
      path.resolve(__dirname, 'src'),
    ],
  });

  // Add webpack plugins to provide Node polyfills
  const webpack = require('webpack');
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.EXPO_PLATFORM': JSON.stringify('web'),
      '__DEV__': process.env.NODE_ENV !== 'production',
    })
  );

  return config;
};
