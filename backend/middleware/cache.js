// middleware/cache.js
const { getAsync, setAsync } = require('../config/redis');

const cache = (duration) => {
  return async (req, res, next) => {
    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = await getAsync(key);
    if (cachedBody) {
      return res.send(JSON.parse(cachedBody));
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        setAsync(key, JSON.stringify(body), 'EX', duration);
        res.sendResponse(body);
      };
      next();
    }
  };
};

module.exports = cache;
