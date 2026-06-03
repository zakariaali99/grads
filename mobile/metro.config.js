const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const frontendSrc = path.resolve(__dirname, '../frontend/src');

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enableSymlinks = true;
config.watchFolders = [frontendSrc];

config.resolver.extraNodeModules = {
  '@': frontendSrc,
};

// Map @/lib/xxx to frontend src/lib/xxx etc.
config.transformer = config.transformer || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@/')) {
    const realPath = path.join(frontendSrc, moduleName.slice(2));
    return context.resolveRequest(context, realPath, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
