import dotenv from "dotenv";
dotenv.config();
import express, { json } from "express";
import Route from "./routes/index.js";
import {
  dbConnection,
  redisConnection,
  connectRabbitMQ,
} from "./config/config.js";

const app = express();
const port = process.env.PORT || 2002;

app.use(express.json());
dbConnection();

app.use(
  process.env.API_VERSION!,
  (req, res, next) => {
    req.redisClient = redisConnection;
    next();
  },
  Route,
);

async function startServer() {
  try {
    await connectRabbitMQ();

    app.listen(port, () =>
      console.log(`ChatApp:Identity running on P:${port} ✔`),
    );
  } catch (error) {
    console.error("Server Startup Error ❌", error);
    process.exit(1);
  }
}

startServer();
