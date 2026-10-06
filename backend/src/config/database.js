import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Connects to MongoDB Atlas if MONGO_URI is set.
// Otherwise spins up an in-memory database so you can start immediately.
export async function connectDatabase() {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      console.log("No MONGO_URI found — starting in-memory database...");
      const mem = await MongoMemoryServer.create();
      uri = mem.getUri();
      console.log("In-memory database ready.");
    }

    await mongoose.connect(uri);
    console.log("Database connected.");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}
