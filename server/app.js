import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Public health check route (does not require DB connection)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Database connection middleware for API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err.message);
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
