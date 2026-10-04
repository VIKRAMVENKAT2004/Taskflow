import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

export const fetchTasks = createAsyncThunk('tasks/fetch', async ({ projectId, ...params }, { rejectWithValue }) => {
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
    return (await api.get(`/projects/${projectId}/tasks`, { params: clean })).data.tasks;
  } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const createTask = createAsyncThunk('tasks/create', async ({ projectId, ...body }, { rejectWithValue }) => {
  try { return (await api.post(`/projects/${projectId}/tasks`, body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
});
export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/tasks/${id}`); return id; } catch (e) { return rejectWithValue(errMsg(e)); }
});

const slice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    setStatus(state, { payload: { id, status } }) {
      const t = state.items.find((x) => x._id === id);
      if (t) t.status = status;
    },
    upsertTask(state, { payload }) {
      const i = state.items.findIndex((x) => x._id === payload._id);
      if (i >= 0) state.items[i] = payload; else state.items.unshift(payload);
    },
    setTaskError(state, { payload }) { state.error = payload; },
  },
  extraReducers: (b) => {
    b.addCase(fetchTasks.pending, (s) => { s.loading = true; })
      .addCase(fetchTasks.fulfilled, (s, { payload }) => { s.loading = false; s.items = payload; })
      .addCase(fetchTasks.rejected, (s, { payload }) => { s.loading = false; s.error = payload; })
      .addCase(createTask.fulfilled, (s, { payload }) => { s.items.unshift(payload); })
      .addCase(deleteTask.fulfilled, (s, { payload }) => { s.items = s.items.filter((t) => t._id !== payload); });
  },
});

export const { setStatus, upsertTask, setTaskError } = slice.actions;

// Optimistic update: move card instantly, roll back if the API call fails
export const moveTask = (id, status) => async (dispatch, getState) => {
  const task = getState().tasks.items.find((t) => t._id === id);
  if (!task || task.status === status) return;
  const previous = task.status;
  dispatch(setStatus({ id, status }));
  dispatch(setTaskError(null));
  try {
    await api.patch(`/tasks/${id}`, { status });
  } catch (e) {
    dispatch(setStatus({ id, status: previous }));
    dispatch(setTaskError(errMsg(e)));
  }
};

export default slice.reducer;
