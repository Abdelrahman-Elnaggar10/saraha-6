import cors from "cors";
import HttpAppError from "../Utils/Errors/app.error.js";

const whitelist = (process.env.CORS_ORIGINS || "http://localhost:4200,http://localhost")
    .split(",")
    .map((origin) => origin.trim());

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            return callback(null, true);
        }
        callback(new HttpAppError("Not allowed by CORS", 403, { origin }, "CORS_NOT_ALLOWED"));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware = cors(corsOptions);
