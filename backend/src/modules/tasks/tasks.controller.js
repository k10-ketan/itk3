'use strict';
const path = require('path');
const tasksService = require('./tasks.service');
const { sendSuccess, sendError } = require('../../utils/response.utils');

const getTasks = async (req, res) => {
  const { status, priority, dueBefore, dueAfter, assignedTo, sortBy, order, page, limit } = req.query;
  const { tasks, pagination } = await tasksService.getTasks(
    { status, priority, dueBefore, dueAfter, assignedTo, sortBy, order, page, limit },
    req.user.id,
    req.user.role
  );
  return sendSuccess(res, 200, 'Tasks fetched successfully.', tasks, pagination);
};

const getTaskById = async (req, res) => {
  const task = await tasksService.getTaskById(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, 200, 'Task fetched successfully.', task);
};

const createTask = async (req, res) => {
  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  if (!title) return sendError(res, 400, 'Title is required.');

  const task = await tasksService.createTask(
    { title, description, status, priority, dueDate, assignedTo },
    req.files,
    req.user.id
  );

  // Emit socket event
  const io = req.app.get('io');
  if (io) io.emit('task:created', { task });

  return sendSuccess(res, 201, 'Task created successfully.', task);
};

const updateTask = async (req, res) => {
  const task = await tasksService.updateTask(
    req.params.id,
    req.body,
    req.files,
    req.user.id,
    req.user.role
  );

  const io = req.app.get('io');
  if (io) io.emit('task:updated', { task });

  return sendSuccess(res, 200, 'Task updated successfully.', task);
};

const deleteTask = async (req, res) => {
  await tasksService.deleteTask(req.params.id, req.user.id, req.user.role);

  const io = req.app.get('io');
  if (io) io.emit('task:deleted', { taskId: req.params.id });

  return sendSuccess(res, 200, 'Task deleted successfully.', null);
};

const getDocumentsByTask = async (req, res) => {
  const docs = await tasksService.getDocumentsByTask(req.params.id, req.user.id, req.user.role);
  return sendSuccess(res, 200, 'Documents fetched successfully.', docs);
};

const downloadDocument = async (req, res) => {
  const doc = await tasksService.downloadDocument(req.params.docId, req.user.id, req.user.role);
  res.setHeader('Content-Disposition', `attachment; filename="${doc.originalName}"`);
  res.setHeader('Content-Type', doc.mimetype);
  return res.sendFile(path.resolve(doc.path));
};

const deleteDocument = async (req, res) => {
  await tasksService.deleteDocument(req.params.docId, req.user.id, req.user.role);
  return sendSuccess(res, 200, 'Document deleted successfully.', null);
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getDocumentsByTask,
  downloadDocument,
  deleteDocument,
};
