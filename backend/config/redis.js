// config/redis.js
const redis = require('redis');
const { promisify } = require('util');

let client;

function createClient() {
  if (!client) {
    client = redis.createClient(process.env.REDIS_URL);
    client.on('error', (error) => {
      console.error('Redis error:', error);
    });
  }
  return client;
}

async function connectRedis() {
  const redisClient = createClient();
  await redisClient.connect();
  console.log('Redis client connected');
}

async function closeRedis() {
  if (client) {
    await client.quit();
    client = null;
    console.log('Redis connection closed');
  }
}

function getRedisClient() {
  if (!client) {
    throw new Error('Redis client not initialized. Call connectRedis first.');
  }
  return client;
}

module.exports = {
  connectRedis,
  closeRedis,
  getRedisClient,
  getAsync: (key) => getRedisClient().get(key),
  setAsync: (key, value) => getRedisClient().set(key, value)
};

// const redis = require('redis');

// let client;

// function createClient() {
//   if (!client) {
//     const redisConfig = {
//       url: process.env.REDIS_URL || 'redis://localhost:6379',
//       socket: {
//         reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
//       }
//     };

//     client = redis.createClient(redisConfig);
    
//     client.on('error', (error) => {
//       console.error('Redis error:', error);
//     });

//     client.on('connect', () => {
//       console.log('Redis client connected');
//     });
//   }
//   return client;
// }

// async function connectRedis() {
//   const redisClient = createClient();
//   await redisClient.connect();
// }

// async function closeRedis() {
//   if (client) {
//     await client.quit();
//     client = null;
//     console.log('Redis connection closed');
//   }
// }

// function getRedisClient() {
//   if (!client) {
//     throw new Error('Redis client not initialized. Call connectRedis first.');
//   }
//   return client;
// }

// module.exports = {
//   connectRedis,
//   closeRedis,
//   getRedisClient,
//   getAsync: (key) => getRedisClient().get(key),
//   setAsync: (key, value) => getRedisClient().set(key, value)
// };
