'use strict';
const usersService = require('./users.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

const getUsers = async (req, res) => {
  const { page, limit, search, sortBy, order } = req.query;
  const { users, pagination } = await usersService.getUsers({ page, limit, search, sortBy, order });
  return sendSuccess(res, 200, 'Users fetched successfully.', users, pagination);
};

const getUserById = async (req, res) => {
  // Non-admins can only view themselves
  if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
    return sendError(res, 403, 'Forbidden: You can only view your own profile.');
  }
  const user = await usersService.getUserById(req.params.id);
  return sendSuccess(res, 200, 'User fetched successfully.', user);
};

const updateUser = async (req, res) => {
  const user = await usersService.updateUser(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, 200, 'User updated successfully.', user);
};

const deleteUser = async (req, res) => {
  await usersService.deleteUser(req.params.id);
  return sendSuccess(res, 200, 'User deleted successfully.', null);
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
