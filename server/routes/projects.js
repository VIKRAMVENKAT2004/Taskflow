import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listProjects, createProject, getProject, addMember, deleteProject, projectStats,
} from '../controllers/projectController.js';

const router = Router();
router.use(protect);
router.route('/').get(listProjects).post(authorize('admin'), createProject);
router.get('/:id/stats', projectStats);
router.post('/:id/members', authorize('admin'), addMember);
router.route('/:id').get(getProject).delete(authorize('admin'), deleteProject);
export default router;
