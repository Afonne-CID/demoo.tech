// mockRedis.js
const mockRedis = {
    getAsync: jest.fn(),
    setAsync: jest.fn(),
    connectRedis: jest.fn(),
    closeRedis: jest.fn()
  };
  
module.exports = mockRedis;
