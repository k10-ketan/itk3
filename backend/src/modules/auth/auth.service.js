'use strict';
const User = require('../../models/User.model');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/jwt.utils');

const register = async ({ email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }
  const user = await User.create({ email, password });
  return user;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) {
    const err = new Error('Refresh token missing.');
    err.statusCode = 401;
    throw err;
  }
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 401;
    throw err;
  }

  const payload = { id: user._id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken: newRefreshToken };
};

module.exports = { register, login, refresh };
