import mongoose from 'mongoose';

import app from '../server/app.js';

const globalForMongoose = globalThis;

globalForMongoose._mongoose = globalForMongoose._mongoose || {
	conn: null,
	promise: null,
};

const CONNECTED = 1;
const CONNECTING = 2;

function isConnectionUsable() {
	const state = mongoose.connection.readyState;
	return state === CONNECTED || state === CONNECTING;
}

async function connectToDatabase() {
	if (!process.env.MONGO_URI) {
		throw new Error('Missing MONGO_URI environment variable.');
	}

	if (globalForMongoose._mongoose.conn && isConnectionUsable()) {
		return globalForMongoose._mongoose.conn;
	}

	if (!isConnectionUsable()) {
		globalForMongoose._mongoose.conn = null;
		globalForMongoose._mongoose.promise = null;
	}

	if (!globalForMongoose._mongoose.promise) {
		globalForMongoose._mongoose.promise = mongoose
			.connect(process.env.MONGO_URI, {
				serverSelectionTimeoutMS: 10000,
			})
			.then((mongooseInstance) => mongooseInstance);
	}

	try {
		globalForMongoose._mongoose.conn = await globalForMongoose._mongoose.promise;
		return globalForMongoose._mongoose.conn;
	} catch (error) {
		globalForMongoose._mongoose.promise = null;
		globalForMongoose._mongoose.conn = null;
		throw error;
	}
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
