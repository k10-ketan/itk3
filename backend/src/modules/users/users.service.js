'use strict';
const User = require('../../models/User.model');

const getUsers = async ({ page = 1, limit = 10, search = '', sortBy = 'createdAt', order = 'desc' }) => {
  const query = {};
  if (search) {
    query.email = { $regex: search, $options: 'i' };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const sortOrder = order === 'asc' ? 1 : -1;
  const allowedSort = ['email', 'role', 'createdAt'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    User.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit, 10));
  return { users, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, totalPages } };
};

const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const updateUser = async (id, updates, requesterId, requesterRole) => {
  if (requesterRole !== 'ADMIN' && requesterId !== id) {
    const err = new Error('Forbidden: You can only update your own profile.');
    err.statusCode = 403;
    throw err;
  }
  const allowedFields = ['email'];
  if (requesterRole === 'ADMIN') allowedFields.push('role');

  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  // Handle password separately to trigger pre-save hook
  if (updates.password) {
    const user = await User.findById(id).select('+password');
    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      throw err;
    }
    Object.assign(user, filteredUpdates);
    user.password = updates.password;
    await user.save();
    return user;
  }

  const user = await User.findByIdAndUpdate(id, filteredUpdates, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { getUsers, getUserById, updateUser, deleteUser };
