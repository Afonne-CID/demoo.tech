// utils/clearModuleCache.js

function clearModuleCache() {
    Object.keys(require.cache).forEach((key) => {
      delete require.cache[key];
    });
  }
  
module.exports = clearModuleCache;
