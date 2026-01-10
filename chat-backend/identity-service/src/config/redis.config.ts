import { Redis } from "ioredis";

const redisClient = new Redis(process.env.REDIS_URI!);
redisClient.on("connect", () => {
  console.log("Redis connected ✔");
});

redisClient.on("error", (err: string) => {
  console.error("Redis Connection Error ❌", err);
});

export default redisClient;
