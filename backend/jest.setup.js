// jest.setup.js
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'live') {
    const clearModuleCache = require('./utils/clearModuleCache');
    clearModuleCache();
  }
