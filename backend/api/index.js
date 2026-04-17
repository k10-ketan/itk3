'use strict';
require('dotenv').config();

const app = require('../src/app');
const connectDB = require('../src/config/db');

// Stub Socket.io on the app so controllers that call req.app.get('io')
// gracefully no-op instead of crashing on Vercel (no persistent WS).
const ioStub = {
  emit: () => {},
  to: () => ({ emit: () => {} }),
  in: () => ({ emit: () => {} }),
};
app.set('io', ioStub);

// Connect to MongoDB once per cold start.
// Mongoose caches the connection so subsequent invocations reuse it.
let dbConnected = false;
const ensureDB = async () => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
};

// Vercel calls this file as a CJS serverless function.
// Express app IS a valid request handler: (req, res) => void
// We wrap it to ensure the DB is connected before handling the request.
module.exports = async (req, res) => {
  await ensureDB();
  return app(req, res);
};
