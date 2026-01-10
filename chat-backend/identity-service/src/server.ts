import dotenv from "dotenv";
dotenv.config();
import express from "express";
import dbConnection from "./config/db.config.js";
import redisClient from "./config/redis.config.js";
import Route from "./routes/index.js";
import connectRabbitMQ from "./config/rabbitmq.config.js";

const app = express();
const port = process.env.PORT || 2002;

dbConnection();

app.use(
  process.env.API_VERSION!,
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  Route
);

async function startServer() {
  try {
    await connectRabbitMQ();

    // consume events from post service

    app.listen(port, () => console.log(`ChatApp running on P:${port} ✔`));
  } catch (error) {
    console.error("Server Startup Error ❌", error);
    process.exit(1);
  }
}

startServer();
