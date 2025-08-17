// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver for Node.js modules
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  zlib: require.resolve('browserify-zlib'),
  util: require.resolve('util/'),
  crypto: require.resolve('crypto-browserify'),
  url: require.resolve('url/'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  net: require.resolve('react-native-tcp'),
  fs: require.resolve('react-native-level-fs'),
  path: require.resolve('path-browserify'),
  tls: require.resolve('tls-browserify'),
  assert: require.resolve('assert/'),
  os: require.resolve('os-browserify/browser.js'),
};

module.exports = config;
