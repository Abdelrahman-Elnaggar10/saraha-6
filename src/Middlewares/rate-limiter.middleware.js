import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../DB/redis.connection.js";
import { getIpCountryCode } from "../Utils/ip.util.js";

const LIMITS_BY_COUNTRY = {
    EG: 100,
    US: 60,
    DEFAULT: 40,
};
const LOCAL_LIMIT = 300; 

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: (req) => {
        const country = getIpCountryCode(req.ip);
        if (country === "UNKNOWN") return LOCAL_LIMIT;
        return LIMITS_BY_COUNTRY[country] || LIMITS_BY_COUNTRY.DEFAULT;
    },
    keyGenerator: (req) => `${ipKeyGenerator(req.ip)}:${getIpCountryCode(req.ip)}`,
    standardHeaders: "draft-7", 
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: "rate-limit:",
    }),
    handler: (req, res) => {
        res.status(429).json({
            message: "Too many requests, please try again later",
            code: "TOO_MANY_REQUESTS",
        });
    },
});
