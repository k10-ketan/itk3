'use strict';
// Vercel serverless entry point — wraps Express app without starting a TCP server
require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect once per cold start (Vercel caches module scope between invocations)
connectDB();

// Vercel expects module.exports to be a request handler (Express app satisfies this)
module.exports = app;
