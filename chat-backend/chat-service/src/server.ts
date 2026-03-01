import express from "express";
import dotenv from "dotenv";
import Route from "./routes/index.js";
import dbConnection from "./config/db.config.js";
dotenv.config();

const app = express();
const port = process.env.PORT! || 2003;

app.use(express.json());

dbConnection();

app.use(
  process.env.API_VERSION!,
  // (req, res, next) => {
  //   req.redisClient = redisConnection;
  //   next();
  // },
  Route,
);

async function startServer() {
  try {
    // await connectRabbitMQ();

    app.listen(port, () =>
      console.log(`ChatApp:Chat service running on P:${port} ✔`),
    );
  } catch (error) {
    console.error("Server Startup Error ❌", error);
    process.exit(1);
  }
}

startServer();
