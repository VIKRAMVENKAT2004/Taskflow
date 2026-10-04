import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { getAccessibleProject, isOwner } from '../utils/access.js';

const populate = (q) => q.populate('owner', 'name email').populate('members', 'name email');

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await populate(
    Project.find({ $or: [{ owner: req.user._id }, { members: req.user._id }] }).sort('-createdAt')
  );
  res.json(projects);
});

export const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const project = await Project.create({ title, description, owner: req.user._id });
  res.status(201).json(await populate(Project.findById(project._id)));
});

export const getProject = asyncHandler(async (req, res) => {
  await getAccessibleProject(req.params.id, req.user);
  res.json(await populate(Project.findById(req.params.id)));
});

export const addMember = asyncHandler(async (req, res) => {
  const project = await getAccessibleProject(req.params.id, req.user);
  if (!isOwner(project, req.user)) throw httpError(403, 'Only the project owner can add members');
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
  if (!user) throw httpError(404, 'No user found with that email');
  await Project.updateOne({ _id: project._id }, { $addToSet: { members: user._id } });
  res.json(await populate(Project.findById(project._id)));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await getAccessibleProject(req.params.id, req.user);
  if (!isOwner(project, req.user)) throw httpError(403, 'Only the project owner can delete it');
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

// Dashboard stats via aggregation pipeline
export const projectStats = asyncHandler(async (req, res) => {
  const project = await getAccessibleProject(req.params.id, req.user);
  const rows = await Task.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(project._id) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const by = { todo: 0, 'in-progress': 0, done: 0 };
  rows.forEach((r) => { by[r._id] = r.count; });
  const total = by.todo + by['in-progress'] + by.done;
  const overdue = await Task.countDocuments({ project: project._id, status: { $ne: 'done' }, dueDate: { $lt: new Date() } });
  res.json({
    total, todo: by.todo, inProgress: by['in-progress'], done: by.done, overdue,
    completion: total ? Math.round((by.done / total) * 100) : 0,
  });
});
