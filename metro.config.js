// metro.config.js
const { withNativeWind } = require("nativewind/metro");
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Adicione suas personalizações extras aqui, se necessário
config.resolver.sourceExts.push('cjs');

module.exports = withNativeWind(config, {
  input: "./global.css"
});
