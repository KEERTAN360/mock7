


import mongoose from "mongoose";

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  throw new Error("MONGODB_URI is not defined");
}

let cached = (global as any)._mongoose;

if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoURI!, {
      dbName: "tourist_app",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}


