import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const client = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === "true" ? {} : undefined,
});

client.on("connect", () => console.log("Connected to Redis"));
client.on("error", (err) => console.error("Redis error:", err.message));

client.ping().then((res) => console.log("Ping:", res));
