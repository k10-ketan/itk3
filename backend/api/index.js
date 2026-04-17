'use strict';
require('dotenv').config();

const connectDB = require('../src/config/db');

// Stub Socket.io — no persistent WebSocket in Vercel serverless
const ioStub = {
  emit: () => {},
  to: () => ({ emit: () => {} }),
  in: () => ({ emit: () => {} }),
  of: () => ({ emit: () => {} }),
};

// Track DB connection across warm invocations
let dbConnected = false;

// Raw Node.js error response — res.status() is Express-only, not available here
const sendError = (res, code, message) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, message }));
};

const handler = async (req, res) => {
  try {
    // Connect DB once per cold start
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    // Lazy-load the Express app INSIDE the handler.
    // Loading at the top level causes Vercel's Rust bundler to capture
    // the initial empty module.exports ({}) before app.js reassigns it.
    const _appModule = require('../src/app');

    let app;
    if (typeof _appModule === 'function') {
      app = _appModule;
    } else if (_appModule && typeof _appModule.default === 'function') {
      app = _appModule.default;
    } else {
      console.error('[api/index] Module shape:', typeof _appModule, JSON.stringify(Object.keys(_appModule || {})));
      return sendError(res, 500, 'Express app failed to load.');
    }

    // Attach io stub if not already attached
    if (typeof app.get === 'function' && !app.get('io')) {
      app.set('io', ioStub);
    }

    return app(req, res);
  } catch (err) {
    console.error('[api/index] Unhandled error:', err.message);
    return sendError(res, 500, err.message || 'Internal Server Error');
  }
};

module.exports = handler;
