import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, createProject, deleteProject } from '../store/projectSlice';

export default function Projects() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { items, loading, error } = useSelector((s) => s.projects);
  const [form, setForm] = useState({ title: '', description: '' });
  const isAdmin = user.role === 'admin';

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(createProject(form));
    if (!res.error) setForm({ title: '', description: '' });
  };

  return (
    <main className="container">
      <div className="page-head">
        <div>
          <h1>Projects</h1>
          <p className="muted">{isAdmin ? 'Create projects and assign work to your team.' : 'Projects you are part of.'}</p>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      {isAdmin && (
        <form className="card inline-form" onSubmit={submit}>
          <input required placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Short description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary">+ New project</button>
        </form>
      )}

      {loading && <p className="muted">Loading…</p>}
      {!loading && items.length === 0 && <div className="empty">No projects yet.{isAdmin ? ' Create your first one above.' : ' Ask an admin to add you.'}</div>}

      <div className="grid">
        {items.map((p) => (
          <div className="card project-card" key={p._id}>
            <Link to={`/projects/${p._id}`} className="project-link">
              <h3>{p.title}</h3>
              <p className="muted">{p.description || 'No description'}</p>
            </Link>
            <div className="project-meta">
              <span>👤 {p.owner?.name}</span>
              <span>👥 {p.members.length + 1} member{p.members.length ? 's' : ''}</span>
            </div>
            <div className="project-actions">
              <Link to={`/projects/${p._id}`} className="btn btn-ghost">Open</Link>
              {isAdmin && p.owner?._id === user.id && (
                <button className="btn btn-danger" onClick={() => window.confirm('Delete this project and all its tasks?') && dispatch(deleteProject(p._id))}>Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
