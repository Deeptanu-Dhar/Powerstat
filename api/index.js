import mongoose from 'mongoose';

import app from '../server/app.js';

const globalForMongoose = globalThis;

globalForMongoose._mongoose = globalForMongoose._mongoose || {
  conn: null,
  promise: null,
};

async function connectToDatabase() {
  if (!process.env.MONGO_URI) {
    throw new Error('Missing MONGO_URI environment variable.');
  }

  if (globalForMongoose._mongoose.conn) {
    return globalForMongoose._mongoose.conn;
  }

  if (!globalForMongoose._mongoose.promise) {
    globalForMongoose._mongoose.promise = mongoose
      .connect(process.env.MONGO_URI)
      .then((mongooseInstance) => mongooseInstance);
  }

  globalForMongoose._mongoose.conn = await globalForMongoose._mongoose.promise;
  return globalForMongoose._mongoose.conn;
}

export default async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server initialization failed.',
    });
  }
}
