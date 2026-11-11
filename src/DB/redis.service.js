import { redisClient } from "./redis.connection.js";

export const setValue = async (key, value, ttlSeconds) => {
    if (ttlSeconds) {
        return redisClient.set(key, String(value), { EX: ttlSeconds });
    }
    return redisClient.set(key, String(value));
};

export const getValue = (key) => redisClient.get(key);

export const deleteKey = (key) => redisClient.del(key);

export const exists = async (key) => (await redisClient.exists(key)) === 1;

export const getTtl = (key) => redisClient.ttl(key);

export const setExpire = (key, ttlSeconds) => redisClient.expire(key, ttlSeconds);

export const increment = (key) => redisClient.incr(key);
