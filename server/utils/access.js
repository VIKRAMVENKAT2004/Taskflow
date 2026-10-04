import Project from '../models/Project.js';
import { httpError } from '../middleware/error.js';

export const isOwner = (project, user) => String(project.owner._id || project.owner) === String(user._id);

export const isProjectMember = (project, user) =>
  isOwner(project, user) || project.members.some((m) => String(m._id || m) === String(user._id));

export async function getAccessibleProject(projectId, user) {
  const project = await Project.findById(projectId);
  if (!project) throw httpError(404, 'Project not found');
  if (!isProjectMember(project, user)) throw httpError(403, 'You do not have access to this project');
  return project;
}
