import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

export const fetchProjects = createAsyncThunk('projects/fetch', async (_, { rejectWithValue }) => {
  try { return (await api.get('/projects')).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const createProject = createAsyncThunk('projects/create', async (body, { rejectWithValue }) => {
  try { return (await api.post('/projects', body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/projects/${id}`); return id; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'projects',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProjects.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProjects.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
      .addCase(fetchProjects.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createProject.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(createProject.rejected, (s, { payload }) => { s.error = payload; })
      .addCase(deleteProject.fulfilled, (s, { payload }) => { s.items = s.items.filter((p) => p._id !== payload); })
      .addCase(deleteProject.rejected, (s, { payload }) => { s.error = payload; });
  },
});

export default slice.reducer;
