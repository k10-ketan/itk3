'use strict';
require('dotenv').config();

const connectDB = require('../src/config/db');

// Vercel's Rust bundler may wrap CJS exports. Resolve the actual Express app:
// - If bundler sets .default to a function → use .default
// - If _appModule itself is the Express function → use it directly
// - Last resort: try .default anyway
const _appModule = require('../src/app');
let app;
if (typeof _appModule === 'function') {
  app = _appModule;
} else if (typeof _appModule.default === 'function') {
  app = _appModule.default;
} else {
  // Shouldn't happen — log for debugging and fall back
  console.error('[Vercel] Unexpected app module shape:', typeof _appModule, Object.keys(_appModule || {}));
  app = _appModule.default || _appModule;
}

// Stub Socket.io — no persistent WebSocket in Vercel serverless
const ioStub = {
  emit: () => {},
  to: () => ({ emit: () => {} }),
  in: () => ({ emit: () => {} }),
  of: () => ({ emit: () => {} }),
};

if (typeof app.set === 'function') {
  app.set('io', ioStub);
}

// Track DB connection across warm invocations (Mongoose caches internally too)
let dbConnected = false;

const handler = async (req, res) => {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }

    // Final safety check
    if (typeof app !== 'function') {
      console.error('[Vercel] app is not callable. Type:', typeof app);
      return res.status(500).json({ success: false, message: 'Server misconfigured.' });
    }

    return app(req, res);
  } catch (err) {
    console.error('[Vercel] Handler error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = handler;
