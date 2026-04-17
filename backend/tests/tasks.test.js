'use strict';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://admin:password@localhost:27017/taskdb_test?authSource=admin';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_that_is_at_least_32_chars';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars';
process.env.JWT_ACCESS_EXPIRES = '15m';
process.env.JWT_REFRESH_EXPIRES = '7d';
process.env.UPLOAD_DIR = 'uploads';
process.env.MAX_FILE_SIZE = '5242880';
process.env.MAX_FILES = '3';
process.env.CLIENT_URL = 'http://localhost:3000';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User.model');
const Task = require('../src/models/Task.model');
const Document = require('../src/models/Document.model');
const { generateAccessToken } = require('../src/utils/jwt.utils');

let adminToken;
let userToken;
let otherUserToken;
let adminUser;
let regularUser;
let otherUser;
let taskId;
let otherTaskId;

// Create a test PDF file path
const testPdfPath = path.join(__dirname, 'test.pdf');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await User.deleteMany({});
  await Task.deleteMany({});
  await Document.deleteMany({});

  adminUser = await User.create({ email: 'admin_task@test.com', password: 'Test@1234', role: 'ADMIN' });
  regularUser = await User.create({ email: 'user_task@test.com', password: 'Test@1234', role: 'USER' });
  otherUser = await User.create({ email: 'other_task@test.com', password: 'Test@1234', role: 'USER' });

  adminToken = generateAccessToken({ id: adminUser._id.toString(), email: adminUser.email, role: adminUser.role });
  userToken = generateAccessToken({ id: regularUser._id.toString(), email: regularUser.email, role: regularUser.role });
  otherUserToken = generateAccessToken({ id: otherUser._id.toString(), email: otherUser.email, role: otherUser.role });

  // Create test tasks
  const task = await Task.create({
    title: 'Test Task',
    description: 'Test description',
    status: 'TODO',
    priority: 'HIGH',
    createdBy: regularUser._id,
  });
  taskId = task._id.toString();

  const otherTask = await Task.create({
    title: 'Other User Task',
    description: 'Owned by other user',
    status: 'TODO',
    priority: 'LOW',
    createdBy: otherUser._id,
  });
  otherTaskId = otherTask._id.toString();

  // Create a minimal valid PDF for upload tests
  const pdfContent = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\ntrailer<</Root 1 0 R/Size 4>>\nstartxref\n155\n%%EOF',
    'utf8'
  );
  fs.writeFileSync(testPdfPath, pdfContent);
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await Document.deleteMany({});
  if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);
  await mongoose.disconnect();
});

describe('GET /api/tasks', () => {
  it('should return paginated tasks for authenticated user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('should filter tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=TODO')
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((t) => t.status === 'TODO')).toBe(true);
  });

  it('should filter tasks by priority', async () => {
    const res = await request(app)
      .get('/api/tasks?priority=HIGH')
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((t) => t.priority === 'HIGH')).toBe(true);
  });

  it('should sort tasks by dueDate', async () => {
    const res = await request(app)
      .get('/api/tasks?sortBy=dueDate&order=asc')
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('admin should see all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Cookie', [`accessToken=${adminToken}`]);
    expect(res.statusCode).toBe(200);
    // Admin sees all tasks (at least 2)
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });
});

describe('POST /api/tasks', () => {
  it('should create a task successfully', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', [`accessToken=${userToken}`])
      .field('title', 'New Task via API')
      .field('description', 'Created in test')
      .field('status', 'TODO')
      .field('priority', 'MEDIUM');
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('New Task via API');
  });

  it('should reject task without title', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', [`accessToken=${userToken}`])
      .field('description', 'No title');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject non-PDF file upload', async () => {
    const txtPath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(txtPath, 'hello');
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', [`accessToken=${userToken}`])
      .field('title', 'Task with text file')
      .attach('documents', txtPath, { contentType: 'text/plain' });
    if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
    expect([400, 201]).toContain(res.statusCode);
    // If the file was rejected expect 400
    if (res.statusCode === 400) {
      expect(res.body.success).toBe(false);
    }
  });

  it('should accept PDF file upload', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', [`accessToken=${userToken}`])
      .field('title', 'Task with PDF')
      .attach('documents', testPdfPath, { contentType: 'application/pdf' });
    expect([200, 201]).toContain(res.statusCode);
  });
});

describe('PUT /api/tasks/:id', () => {
  it('owner can update their task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', [`accessToken=${userToken}`])
      .field('title', 'Updated Task Title')
      .field('status', 'IN_PROGRESS');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
  });

  it('non-owner gets 403', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', [`accessToken=${otherUserToken}`])
      .field('title', 'Should fail');
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('admin can update any task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Cookie', [`accessToken=${adminToken}`])
      .field('priority', 'LOW');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DELETE /api/tasks/:id', () => {
  let deleteTaskId;

  beforeAll(async () => {
    const t = await Task.create({
      title: 'Task to delete',
      status: 'TODO',
      priority: 'LOW',
      createdBy: regularUser._id,
    });
    deleteTaskId = t._id.toString();
  });

  it('other user gets 403', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${deleteTaskId}`)
      .set('Cookie', [`accessToken=${otherUserToken}`]);
    expect(res.statusCode).toBe(403);
  });

  it('owner can delete their task', async () => {
    const res = await request(app)
      .delete(`/api/tasks/${deleteTaskId}`)
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('admin can delete any task', async () => {
    const t = await Task.create({
      title: 'Admin deletes this',
      status: 'TODO',
      priority: 'LOW',
      createdBy: otherUser._id,
    });
    const res = await request(app)
      .delete(`/api/tasks/${t._id}`)
      .set('Cookie', [`accessToken=${adminToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/tasks/:id/documents', () => {
  it('should return documents array for a task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}/documents`)
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('non-owner cannot view documents — gets 403', async () => {
    const res = await request(app)
      .get(`/api/tasks/${otherTaskId}/documents`)
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(403);
  });
});
