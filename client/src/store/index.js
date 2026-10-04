import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import projects from './projectSlice';
import tasks from './taskSlice';

export default configureStore({ reducer: { auth, projects, tasks } });
