'use strict';
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

// Guard against bundler CJS/ESM interop: Vercel's Rust bundler may wrap
// the default export so `require('./app')` returns { default: expressApp }.
const _appModule = require('./app');
const app = (_appModule && _appModule.default) ? _appModule.default : _appModule;

const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['polling', 'websocket'],
});

// Safely attach io — guard for serverless or bundler interop edge cases
if (app && typeof app.set === 'function') {
  app.set('io', io);
}

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT} | Env: ${process.env.NODE_ENV}`);
    console.log(`[Swagger] http://localhost:${PORT}/api/docs`);
  });
};

// Detect execution context:
// - `node src/server.js` (local / Docker): require.main === module → start HTTP server
// - Vercel serverless bundler wraps this file: export app as request handler
if (require.main === module) {
  start();
} else {
  // Vercel / serverless: connect DB and export Express app as handler
  connectDB().catch((err) => console.error('[DB] Connection error:', err));
  module.exports = app;
}
