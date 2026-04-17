'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Task = require('../src/models/Task.model');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB for seeding...');

    // Clean existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing users and tasks.');

    // Create users
    const admin = await User.create({
      email: 'admin@taskapp.com',
      password: 'Admin@123',
      role: 'ADMIN',
    });

    const user1 = await User.create({
      email: 'user1@taskapp.com',
      password: 'User@123',
      role: 'USER',
    });

    const user2 = await User.create({
      email: 'user2@taskapp.com',
      password: 'User@123',
      role: 'USER',
    });

    console.log('Users created: admin, user1, user2');

    // Create tasks
    const tasks = [
      {
        title: 'Design System Architecture',
        description: 'Create a scalable architecture for the new microservices platform.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        assignedTo: admin._id,
        createdBy: admin._id,
      },
      {
        title: 'Implement JWT Authentication',
        description: 'Set up access and refresh token flow with httpOnly cookies.',
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        assignedTo: user1._id,
        createdBy: admin._id,
      },
      {
        title: 'Build Task CRUD API',
        description: 'RESTful endpoints for task creation, retrieval, update and deletion.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedTo: user1._id,
        createdBy: user1._id,
      },
      {
        title: 'Integrate Socket.io',
        description: 'Real-time task updates using WebSockets.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignedTo: user2._id,
        createdBy: user1._id,
      },
      {
        title: 'Write Unit Tests',
        description: 'Achieve 80%+ coverage with Jest and Supertest.',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        assignedTo: user2._id,
        createdBy: user2._id,
      },
    ];

    await Task.insertMany(tasks);
    console.log('Tasks seeded: 5 tasks created.');

    console.log('\n=== Seed Credentials ===');
    console.log('admin@taskapp.com   | Admin@123 | ADMIN');
    console.log('user1@taskapp.com   | User@123  | USER');
    console.log('user2@taskapp.com   | User@123  | USER');
    console.log('========================\n');
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seed();
