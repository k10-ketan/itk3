'use strict';
const { verifyAccessToken } = require('../utils/jwt.utils');
const { sendError } = require('../utils/response.utils');

const authenticate = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return sendError(res, 401, 'Access token missing. Please login.');
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Access token expired.');
    }
    return sendError(res, 401, 'Invalid access token.');
  }
};

module.exports = { authenticate };
