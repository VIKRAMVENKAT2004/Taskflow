import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, register, clearAuthError } from '../store/authSlice';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const dispatch = useDispatch();
  const { token, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (token) return <Navigate to="/" replace />;

  const submit = (e) => {
    e.preventDefault();
    dispatch(isLogin ? login({ email: form.email, password: form.password }) : register(form));
  };

  return (
    <main className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="muted">{isLogin ? 'Log in to manage your projects.' : 'Start organising your team’s work.'}</p>
        {error && <div className="alert">{error}</div>}
        {!isLogin && (
          <label>Name<input required value={form.name} onChange={set('name')} placeholder="Your name" /></label>
        )}
        <label>Email<input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></label>
        <label>Password<input required type="password" minLength={6} value={form.password} onChange={set('password')} placeholder="Min 6 characters" /></label>
        {!isLogin && (
          <label>Role
            <select value={form.role} onChange={set('role')}>
              <option value="member">Team member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
        <button className="btn btn-primary" disabled={loading}>{loading ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}</button>
        <p className="muted center">
          {isLogin ? 'No account? ' : 'Already registered? '}
          <Link to={isLogin ? '/register' : '/login'} onClick={() => dispatch(clearAuthError())}>
            {isLogin ? 'Sign up' : 'Log in'}
          </Link>
        </p>
      </form>
    </main>
  );
}
