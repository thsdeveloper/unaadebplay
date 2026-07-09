// metro.config.js — monorepo-aware (pnpm workspace, hoisted node_modules)
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole workspace so @repo/* source changes hot-reload.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app first, then the hoisted workspace-root store.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Hoisted layout has a single copy of each dep — disable upward hierarchical
//    lookup so Metro can't accidentally pick a nested duplicate of react/react-native.
config.resolver.disableHierarchicalLookup = true;

// 4. Preserve existing customization (supabase-js ships .cjs).
config.resolver.sourceExts.push('cjs');

module.exports = withNativeWind(config, { input: './global.css' });
