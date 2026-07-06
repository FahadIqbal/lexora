const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const supabaseCjsPath = path.resolve(__dirname, 'node_modules/@supabase/supabase-js/dist/index.cjs');
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if ((platform === 'ios' || platform === 'android') && moduleName === '@supabase/supabase-js') {
    return {
      filePath: supabaseCjsPath,
      type: 'sourceFile',
    };
  }

  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
