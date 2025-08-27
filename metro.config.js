const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Apenas adicionar extensão cjs
config.resolver.sourceExts.push('cjs');

module.exports = config;