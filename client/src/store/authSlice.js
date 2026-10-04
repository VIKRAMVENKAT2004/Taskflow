import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../api/axios';

const saved = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

const authCall = (type, url) =>
  createAsyncThunk(type, async (body, { rejectWithValue }) => {
    try { return (await api.post(url, body)).data; } catch (e) { return rejectWithValue(errMsg(e)); }
  });

export const login = authCall('auth/login', '/auth/login');
export const register = authCall('auth/register', '/auth/register');

const slice = createSlice({
  name: 'auth',
  initialState: { user: saved(), token: localStorage.getItem('token'), loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null; state.token = null;
      localStorage.removeItem('token'); localStorage.removeItem('user');
    },
    clearAuthError(state) { state.error = null; },
  },
  extraReducers: (b) => {
    [login, register].forEach((thunk) => {
      b.addCase(thunk.pending, (s) => { s.loading = true; s.error = null; })
        .addCase(thunk.fulfilled, (s, { payload }) => {
          s.loading = false; s.user = payload.user; s.token = payload.token;
          localStorage.setItem('token', payload.token);
          localStorage.setItem('user', JSON.stringify(payload.user));
        })
        .addCase(thunk.rejected, (s, { payload }) => { s.loading = false; s.error = payload; });
    });
  },
});

export const { logout, clearAuthError } = slice.actions;
export default slice.reducer;
