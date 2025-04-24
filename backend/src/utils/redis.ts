import { redisClient } from '../config/redis';




   export const setRedisData = async (key: string, data: any, expiry: number): Promise<void> => {
     await redisClient.setEx(key, expiry, JSON.stringify(data));
   };

   export const getRedisData = async (key: string): Promise<string | null> => {
     return await redisClient.get(key);
   };