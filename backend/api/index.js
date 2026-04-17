'use strict';
// Vercel loads this as the serverless entry point (via "main": "api/index.js").
// server.js already handles serverless export when require.main !== module.
module.exports = require('../src/server');
