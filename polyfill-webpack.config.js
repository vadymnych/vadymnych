const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ['console']
    })
  ],
  resolve: {
    fallback: {
      fs: false
    }
  }
};
