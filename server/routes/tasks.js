import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { listTasks, createTask, updateTask, deleteTask, addComment } from '../controllers/taskController.js';

const router = Router();
router.use(protect);
router.route('/projects/:projectId/tasks').get(listTasks).post(createTask);
router.route('/tasks/:id').patch(updateTask).delete(deleteTask);
router.post('/tasks/:id/comments', addComment);
export default router;
