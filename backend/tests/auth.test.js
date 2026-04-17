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

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User.model');
const { generateAccessToken } = require('../src/utils/jwt.utils');

let adminToken;
let userToken;
let adminUser;
let regularUser;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await User.deleteMany({});

  adminUser = await User.create({ email: 'admin_auth@test.com', password: 'Test@1234', role: 'ADMIN' });
  regularUser = await User.create({ email: 'user_auth@test.com', password: 'Test@1234', role: 'USER' });

  adminToken = generateAccessToken({ id: adminUser._id.toString(), email: adminUser.email, role: adminUser.role });
  userToken = generateAccessToken({ id: regularUser._id.toString(), email: regularUser.email, role: regularUser.role });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'newreg@test.com', password: 'NewPass@123' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('newreg@test.com');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'Test@1234' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'Test@1234' });
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'missing@test.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject password shorter than 6 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@test.com', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('should login successfully and set cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin_auth@test.com', password: 'Test@1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin_auth@test.com', password: 'WrongPassword' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject user not found', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Test@1234' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin_auth@test.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('Protected Route Access', () => {
  it('should allow access with valid token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', [`accessToken=${adminToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 with no token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 with expired/invalid token', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', ['accessToken=invalid.token.here']);
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Role Guard', () => {
  it('should allow ADMIN to access admin-only route', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', [`accessToken=${adminToken}`]);
    expect(res.statusCode).toBe(200);
  });

  it('should return 403 for USER accessing admin-only route', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', [`accessToken=${userToken}`]);
    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout and clear cookies', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [`accessToken=${adminToken}`]);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
