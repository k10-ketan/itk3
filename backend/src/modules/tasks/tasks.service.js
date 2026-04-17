'use strict';
const path = require('path');
const fs = require('fs');
const Task = require('../../models/Task.model');
const Document = require('../../models/Document.model');

const getTasks = async (
  { status, priority, dueBefore, dueAfter, assignedTo, sortBy, order, page = 1, limit = 10 },
  requesterId,
  requesterRole
) => {
  const query = {};
  if (requesterRole !== 'ADMIN') query.createdBy = requesterId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (dueBefore || dueAfter) {
    query.dueDate = {};
    if (dueBefore) query.dueDate.$lte = new Date(dueBefore);
    if (dueAfter) query.dueDate.$gte = new Date(dueAfter);
  }

  const allowed = ['title', 'dueDate', 'priority', 'status', 'createdAt'];
  const sortField = allowed.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'email role')
      .populate('createdBy', 'email role')
      .populate('documents')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Task.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / parseInt(limit, 10));
  return { tasks, pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, totalPages } };
};

const getTaskById = async (id, requesterId, requesterRole) => {
  const task = await Task.findById(id)
    .populate('assignedTo', 'email role')
    .populate('createdBy', 'email role')
    .populate('documents');

  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }

  if (requesterRole !== 'ADMIN' && task.createdBy._id.toString() !== requesterId) {
    const err = new Error('Forbidden: You do not have access to this task.');
    err.statusCode = 403;
    throw err;
  }

  return task;
};

const createTask = async (taskData, files, requesterId) => {
  const task = await Task.create({ ...taskData, createdBy: requesterId });

  if (files && files.length > 0) {
    const docs = await Promise.all(
      files.map((file) =>
        Document.create({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          task: task._id,
          uploadedBy: requesterId,
        })
      )
    );
    task.documents = docs.map((d) => d._id);
    await task.save();
  }

  return Task.findById(task._id)
    .populate('assignedTo', 'email role')
    .populate('createdBy', 'email role')
    .populate('documents');
};

const updateTask = async (id, updateData, files, requesterId, requesterRole) => {
  const task = await Task.findById(id);
  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }

  if (requesterRole !== 'ADMIN' && task.createdBy.toString() !== requesterId) {
    const err = new Error('Forbidden: You can only update your own tasks.');
    err.statusCode = 403;
    throw err;
  }

  const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'assignedTo'];
  for (const key of allowed) {
    if (updateData[key] !== undefined) {
      if ((key === 'assignedTo' || key === 'dueDate') && updateData[key] === '') {
        task[key] = null;
      } else {
        task[key] = updateData[key];
      }
    }
  }

  if (files && files.length > 0) {
    const existingCount = task.documents.length;
    const maxFiles = parseInt(process.env.MAX_FILES || '3', 10);
    if (existingCount + files.length > maxFiles) {
      const err = new Error(`Cannot add more than ${maxFiles} documents per task.`);
      err.statusCode = 400;
      throw err;
    }
    const docs = await Promise.all(
      files.map((file) =>
        Document.create({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          task: task._id,
          uploadedBy: requesterId,
        })
      )
    );
    task.documents.push(...docs.map((d) => d._id));
  }

  await task.save();

  return Task.findById(task._id)
    .populate('assignedTo', 'email role')
    .populate('createdBy', 'email role')
    .populate('documents');
};

const deleteTask = async (id, requesterId, requesterRole) => {
  const task = await Task.findById(id).populate('documents');
  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }

  if (requesterRole !== 'ADMIN' && task.createdBy.toString() !== requesterId) {
    const err = new Error('Forbidden: You can only delete your own tasks.');
    err.statusCode = 403;
    throw err;
  }

  // Delete physical files
  for (const doc of task.documents) {
    try {
      if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
    } catch (e) {
      console.error('Error deleting file:', e.message);
    }
    await Document.findByIdAndDelete(doc._id);
  }

  await Task.findByIdAndDelete(id);
  return task;
};

const getDocumentsByTask = async (taskId, requesterId, requesterRole) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }
  if (requesterRole !== 'ADMIN' && task.createdBy.toString() !== requesterId) {
    const err = new Error('Forbidden.');
    err.statusCode = 403;
    throw err;
  }
  return Document.find({ task: taskId });
};

const downloadDocument = async (docId, requesterId, requesterRole) => {
  const doc = await Document.findById(docId).populate('task');
  if (!doc) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }
  const task = doc.task;
  if (requesterRole !== 'ADMIN' && task.createdBy.toString() !== requesterId) {
    const err = new Error('Forbidden.');
    err.statusCode = 403;
    throw err;
  }
  if (!fs.existsSync(doc.path)) {
    const err = new Error('File not found on server.');
    err.statusCode = 404;
    throw err;
  }
  return doc;
};

const deleteDocument = async (docId, requesterId, requesterRole) => {
  const doc = await Document.findById(docId).populate('task');
  if (!doc) {
    const err = new Error('Document not found.');
    err.statusCode = 404;
    throw err;
  }
  const task = doc.task;
  if (requesterRole !== 'ADMIN' && task.createdBy.toString() !== requesterId) {
    const err = new Error('Forbidden.');
    err.statusCode = 403;
    throw err;
  }

  try {
    if (fs.existsSync(doc.path)) fs.unlinkSync(doc.path);
  } catch (e) {
    console.error('Error deleting file:', e.message);
  }

  await Task.findByIdAndUpdate(doc.task._id, { $pull: { documents: doc._id } });
  await Document.findByIdAndDelete(docId);
  return doc;
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
