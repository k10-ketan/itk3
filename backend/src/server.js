'use strict';
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in controllers via app
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} | Env: ${process.env.NODE_ENV}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
  });
};

start();

module.exports = { app, server, io };
