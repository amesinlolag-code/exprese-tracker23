import mongoose from "mongoose";

/**
 * Connects to MongoDB.
 *
 * Primary path: set a real MONGO_URI (MongoDB Atlas free tier, or local mongod) in backend/.env.
 * This is the recommended path — it's reliable on every machine and matches how you'll connect
 * once deployed.
 *
 * Fallback path: if MONGO_URI is unset (or explicitly "memory"), this tries to spin up a
 * temporary in-memory MongoDB via mongodb-memory-server. That package downloads a MongoDB
 * binary on first run, which can fail or hang on locked-down networks, corporate firewalls, or
 * antivirus software — if that happens, don't fight it, just switch to Atlas (see README).
 */
const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  if (!uri || uri === "memory") {
    console.log("[DB] No MONGO_URI set — attempting a temporary in-memory database...");
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mem = await MongoMemoryServer.create({
        instance: { launchTimeout: 30000 },
      });
      uri = mem.getUri();
      console.log("[DB] In-memory database ready. Data will reset when the server restarts.");
    } catch (memError) {
      console.error("\n[DB] Could not start the in-memory database:", memError.message);
      console.error(
        "[DB] This usually means a firewall/antivirus blocked the MongoDB binary download.\n" +
          "[DB] Fix: set a real MONGO_URI in backend/.env instead — a free MongoDB Atlas cluster\n" +
          "[DB] takes about 3 minutes and needs no download. See the README's 'Database setup' section.\n"
      );
      process.exit(1);
    }
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[DB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DB] Connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
