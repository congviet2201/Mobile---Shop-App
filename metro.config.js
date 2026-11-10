const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [fs.realpathSync(path.join(__dirname, 'node_modules'))],
  resolver: {
    unstable_enableSymlinks: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
