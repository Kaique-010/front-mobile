const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extensões suportadas
config.resolver.sourceExts.push('cjs');

// Configurações básicas para reduzir warnings
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;