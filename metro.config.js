// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for gesture handler
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-gesture-handler': require.resolve('react-native-gesture-handler'),
};

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config; 