import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectRabbitMQ } from "./config/config.js";
import { consumeEvent } from "./config/rabbitmq.config.js";
import handleSendOtpEmail from "./utils/handleSendOtpEmail.utils.js";

const app = express();
const port = process.env.PORT || 2005;

async function startServer() {
  try {
    await connectRabbitMQ();
    consumeEvent("email:otp:send", handleSendOtpEmail);
    app.listen(port, () => console.log(`ChatApp:Mail service running on P:${port} ✔`));
  } catch (error) {
    console.error("Server Startup Error ❌", error);
    process.exit(1);
  }
}

startServer();
