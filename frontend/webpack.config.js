const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add a fallback for missing assets
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
  };

  // Modify the resolve configuration
  config.resolve.modules = [
    path.resolve(__dirname, 'node_modules'),
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'assets'),
  ];

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

  return config;
};
