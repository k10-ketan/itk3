'use strict';
const { sendError } = require('../utils/response.utils');

/**
 * Middleware factory: restricts access to listed roles
 * @param {...string} roles - Allowed roles e.g. 'ADMIN'
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthenticated.');
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Forbidden: insufficient permissions.');
    }
    next();
  };
};

module.exports = { requireRole };
