const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Extensões suportadas
config.resolver.sourceExts.push('cjs');

// Configurações básicas para reduzir warnings
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configurações de watch para hot reload
config.watchFolders = [__dirname];

// Configurações para melhorar o hot reload
config.server = {
  ...config.server,
  port: 8081,
};

// Configurações de reset cache para desenvolvimento
config.resetCache = true;

module.exports = config;