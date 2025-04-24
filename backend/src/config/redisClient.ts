import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error('Redis max retries reached');
        return new Error('Max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on('error', (err: Error | null) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

redisClient.on('reconnecting', () => {
  console.log('Reconnecting to Redis...');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

export const initRedis = async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis connection error:', err);
    throw err;
  }
};

export default redisClient;