import mongoose from 'mongoose';

import app from '../server/app.js';

const globalForMongoose = globalThis;

globalForMongoose._mongoose = globalForMongoose._mongoose || {
  conn: null,
  promise: null,
};

async function connectToDatabase() {
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
  await connectToDatabase();
  return app(req, res);
}
