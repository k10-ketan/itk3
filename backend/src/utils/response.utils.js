'use strict';

/**
 * Send a successful response
 * @param {object} res - Express response object
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 * @param {object|null} pagination
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const response = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', data = null) => {
  return res.status(statusCode).json({ success: false, message, data });
};

module.exports = { sendSuccess, sendError };
