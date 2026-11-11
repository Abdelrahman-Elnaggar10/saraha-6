import './config.js'
import express from "express";
import helmet from "helmet";
import authController from "./Modules/Auth/auth.controller.js";
import userController from "./Modules/User/user.controller.js";
import messageController from "./Modules/Message/message.controller.js";
import dbConnection from "./DB/db.connection.js";
import redisConnection from "./DB/redis.connection.js";
import globalErrorHandler from "./Middlewares/global-error-handler.middleware.js";
import { corsMiddleware } from "./Middlewares/cors.middleware.js";
const app = express();


dbConnection();
await redisConnection();

const { rateLimiter } = await import("./Middlewares/rate-limiter.middleware.js");

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(corsMiddleware);
app.use(rateLimiter);

app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use('/api/auth',  authController);
app.use('/api/users', userController);
app.use('/api/message', messageController);



app.get('/', (req, res) => {
    res.status(200).json({
        message: "Blog App API is running"
    });
});



app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    });
});


app.use(globalErrorHandler);


const port= process.env.PORT

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});