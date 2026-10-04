import Task from '../models/Task.js';
import { asyncHandler, httpError } from '../middleware/error.js';
import { getAccessibleProject, isOwner, isProjectMember } from '../utils/access.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const populate = (q) => q.populate('assignee', 'name email').populate('comments.user', 'name');

function assertAssignable(project, assigneeId) {
  if (!assigneeId) return;
  if (!isProjectMember(project, { _id: assigneeId })) throw httpError(400, 'Assignee must be a member of this project');
}

// GET /projects/:projectId/tasks?page=&limit=&search=&status=&assignee=
export const listTasks = asyncHandler(async (req, res) => {
  await getAccessibleProject(req.params.projectId, req.user);
  const { page = 1, limit = 50, search, status, assignee } = req.query;
  const query = { project: req.params.projectId };
  if (status) query.status = status;
  if (assignee) query.assignee = assignee;
  if (search) query.title = { $regex: escapeRegex(search), $options: 'i' };

  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
  const [tasks, total] = await Promise.all([
    populate(Task.find(query).sort('-createdAt').skip((p - 1) * l).limit(l)),
    Task.countDocuments(query),
  ]);
  res.json({ tasks, total, page: p, pages: Math.ceil(total / l) });
});

export const createTask = asyncHandler(async (req, res) => {
  const project = await getAccessibleProject(req.params.projectId, req.user);
  if (!isOwner(project, req.user)) throw httpError(403, 'Only the project owner can create tasks');
  const { title, description, assignee, dueDate, status } = req.body;
  assertAssignable(project, assignee);
  const task = await Task.create({
    title, description, assignee: assignee || null, dueDate: dueDate || null, status, project: project._id,
  });
  res.status(201).json(await populate(Task.findById(task._id)));
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw httpError(404, 'Task not found');
  const project = await getAccessibleProject(task.project, req.user);

  if (isOwner(project, req.user)) {
    const { title, description, assignee, status, dueDate } = req.body;
    if (assignee) assertAssignable(project, assignee);
    const fields = { title, description, assignee: assignee === '' ? null : assignee, status, dueDate: dueDate === '' ? null : dueDate };
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) task[k] = v; });
  } else {
    // Members can only update the status of tasks assigned to them
    if (String(task.assignee) !== String(req.user._id)) throw httpError(403, 'You can only update tasks assigned to you');
    if (req.body.status === undefined) throw httpError(403, 'Members can only change task status');
    task.status = req.body.status;
  }
  await task.save();
  res.json(await populate(Task.findById(task._id)));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw httpError(404, 'Task not found');
  const project = await getAccessibleProject(task.project, req.user);
  if (!isOwner(project, req.user)) throw httpError(403, 'Only the project owner can delete tasks');
  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

export const addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw httpError(404, 'Task not found');
  await getAccessibleProject(task.project, req.user);
  if (!req.body.text?.trim()) throw httpError(400, 'Comment cannot be empty');
  task.comments.push({ user: req.user._id, text: req.body.text });
  await task.save();
  res.status(201).json(await populate(Task.findById(task._id)));
});
