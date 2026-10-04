import 'dotenv/config';
import connectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import mongoose from 'mongoose';

await connectDB();
await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({})]);
const admin = await User.create({ name: 'Demo Admin', email: 'admin@demo.com', password: '123456', role: 'admin' });
const member = await User.create({ name: 'Demo Member', email: 'member@demo.com', password: '123456', role: 'member' });
const project = await Project.create({ title: 'Website Redesign', description: 'Revamp the company website', owner: admin._id, members: [member._id] });
const day = 86400000;
await Task.insertMany([
  { title: 'Design homepage mockup', project: project._id, assignee: member._id, status: 'done', dueDate: new Date(Date.now() - day) },
  { title: 'Build login page', project: project._id, assignee: member._id, status: 'in-progress', dueDate: new Date(Date.now() + 2 * day) },
  { title: 'Set up CI pipeline', project: project._id, assignee: admin._id, status: 'todo', dueDate: new Date(Date.now() - 2 * day) },
  { title: 'Write API docs', project: project._id, assignee: member._id, status: 'todo', dueDate: new Date(Date.now() + 7 * day) },
]);
console.log('Seeded. Login: admin@demo.com / member@demo.com (password 123456)');
await mongoose.disconnect();
