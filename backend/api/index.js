'use strict';
require('dotenv').config();

// Import Express app directly — never import server.js (which starts HTTP server)
const _appModule = require('../src/app');
const app = (_appModule && _appModule.default) ? _appModule.default : _appModule;

const connectDB = require('../src/config/db');

// Stub Socket.io — Vercel serverless has no persistent WebSocket
// Controllers call req.app.get('io') to emit events; stub prevents crashes
const ioStub = {
  emit: () => {},
  to: () => ({ emit: () => {} }),
  in: () => ({ emit: () => {} }),
  of: () => ({ emit: () => {} }),
};

if (app && typeof app.set === 'function') {
  app.set('io', ioStub);
}

// Track DB connection across warm invocations
let dbConnected = false;

// Vercel calls module.exports as the request handler
const handler = async (req, res) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  return app(req, res);
};

module.exports = handler;
