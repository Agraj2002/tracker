const redis = require('redis');
require('dotenv').config();

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    await client.connect();
    return client;
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    // Continue without Redis if connection fails
    return null;
  }
};

// Cache helper functions
const setCache = async (key, data, expiration = 3600) => {
  try {
    if (!client || !client.isOpen) return false;
    await client.setEx(key, expiration, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
};

const getCache = async (key) => {
  try {
    if (!client || !client.isOpen) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    if (!client || !client.isOpen) return false;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
};

const deleteCachePattern = async (pattern) => {
  try {
    if (!client || !client.isOpen) return false;
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('Cache pattern delete error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getClient: () => client,
  setCache,
  getCache,
  deleteCache,
  deleteCachePattern
};
