'use strict';
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT access token
 * @param {object} payload - Data to embed in token
 * @returns {string}
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

/**
 * Generate a JWT refresh token
 * @param {object} payload - Data to embed in token
 * @returns {string}
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

/**
 * Verify a JWT access token
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

/**
 * Verify a JWT refresh token
 * @param {string} token
 * @returns {object} decoded payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Cookie options for httpOnly cookies
 */
const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  accessCookieOptions,
  refreshCookieOptions,
};
