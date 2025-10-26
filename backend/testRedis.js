const redis = require("./config/redis");

(async () => {
  await redis.set("test:book", JSON.stringify({ title: "Redis Works!" }), "EX", 10);
  const val = await redis.get("test:book");
  console.log("✅ Redis test value:", val);
  process.exit(0);
})();
