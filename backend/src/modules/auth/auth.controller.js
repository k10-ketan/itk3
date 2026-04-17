'use strict';
const authService = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');
const { accessCookieOptions, refreshCookieOptions } = require('../../utils/jwt.utils');

const register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }
  const user = await authService.register({ email, password });
  return sendSuccess(res, 201, 'User registered successfully.', user);
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  return sendSuccess(res, 200, 'Login successful.', user);
};

const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

  return sendSuccess(res, 200, 'Token refreshed successfully.', null);
};

const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return sendSuccess(res, 200, 'Logged out successfully.', null);
};

module.exports = { register, login, refresh, logout };
