import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api, { errMsg } from '../api/axios';
import { fetchTasks, createTask, moveTask } from '../store/taskSlice';
import TaskModal from '../components/TaskModal';

const COLUMNS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];
const emptyTask = { title: '', description: '', assignee: '', dueDate: '' };

export default function ProjectDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const { items, error, loading } = useSelector((s) => s.tasks);
  const isAdmin = user.role === 'admin';

  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [dragOver, setDragOver] = useState(null);

  const loadStats = useCallback(() => api.get(`/projects/${id}/stats`).then((r) => setStats(r.data)).catch(() => {}), [id]);

  useEffect(() => {
    api.get(`/projects/${id}`).then((r) => setProject(r.data)).catch((e) => setMsg(errMsg(e)));
    loadStats();
  }, [id, loadStats]);

  // Debounced search/filter -> API
  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchTasks({ projectId: id, search, assignee, limit: 100 })), 300);
    return () => clearTimeout(t);
  }, [dispatch, id, search, assignee]);

  const people = project ? [project.owner, ...project.members] : [];
  const selected = items.find((t) => t._id === selectedId);
  const canDrag = (t) => isAdmin || t.assignee?._id === user.id;
  const isOverdue = (t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date();

  const onDrop = async (e, status) => {
    e.preventDefault();
    setDragOver(null);
    const taskId = e.dataTransfer.getData('text/plain');
    await dispatch(moveTask(taskId, status));
    loadStats();
  };

  const addTask = async (e) => {
    e.preventDefault();
    const res = await dispatch(createTask({ projectId: id, ...form }));
    if (res.error) return setMsg(res.payload);
    setForm(emptyTask); setShowForm(false); setMsg(''); loadStats();
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/projects/${id}/members`, { email });
      setProject(data); setEmail(''); setMsg('');
    } catch (e2) { setMsg(errMsg(e2)); }
  };

  if (!project) return <main className="container">{msg ? <div className="alert">{msg}</div> : <p className="muted">Loading…</p>}</main>;

  return (
    <main className="container">
      <Link to="/" className="back">← All projects</Link>
      <div className="page-head">
        <div>
          <h1>{project.title}</h1>
          <p className="muted">{project.description}</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add task'}</button>}
      </div>

      {(msg || error) && <div className="alert">{msg || error}</div>}

      {stats && (
        <section className="stats">
          <div className="card stat"><span>Total</span><strong>{stats.total}</strong></div>
          <div className="card stat"><span>In progress</span><strong>{stats.inProgress}</strong></div>
          <div className="card stat"><span>Overdue</span><strong className={stats.overdue ? 'danger' : ''}>{stats.overdue}</strong></div>
          <div className="card stat wide">
            <span>Completion · {stats.done}/{stats.total} done</span>
            <div className="progress"><div style={{ width: `${stats.completion}%` }} /></div>
            <strong>{stats.completion}%</strong>
          </div>
        </section>
      )}

      <section className="card team">
        <strong>Team:</strong>
        {people.map((p) => <span className="chip" key={p._id}>{p.name}</span>)}
        {isAdmin && project.owner._id === user.id && (
          <form className="inline-form compact" onSubmit={addMember}>
            <input type="email" required placeholder="Add member by email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="btn btn-ghost">Add</button>
          </form>
        )}
      </section>

      {showForm && (
        <form className="card task-form" onSubmit={addTask}>
          <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })}>
            <option value="">Unassigned</option>
            {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button className="btn btn-primary">Create task</button>
        </form>
      )}

      <div className="filters">
        <input placeholder="🔍 Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">All assignees</option>
          {people.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
      </div>

      <section className="board">
        {COLUMNS.map((col) => {
          const tasks = items.filter((t) => t.status === col.key);
          return (
            <div
              key={col.key}
              className={`column ${dragOver === col.key ? 'over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => onDrop(e, col.key)}
            >
              <h3><span className={`dot ${col.key}`} /> {col.label} <small>{tasks.length}</small></h3>
              {tasks.map((t) => (
                <article
                  key={t._id}
                  className={`task ${canDrag(t) ? 'draggable' : ''}`}
                  draggable={canDrag(t)}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', t._id)}
                  onClick={() => setSelectedId(t._id)}
                >
                  <h4>{t.title}</h4>
                  <div className="task-foot">
                    <span>{t.assignee ? `👤 ${t.assignee.name}` : 'Unassigned'}</span>
                    {t.dueDate && <span className={isOverdue(t) ? 'danger' : ''}>📅 {new Date(t.dueDate).toLocaleDateString()}</span>}
                    {t.comments.length > 0 && <span>💬 {t.comments.length}</span>}
                  </div>
                </article>
              ))}
              {!loading && tasks.length === 0 && <p className="muted empty-col">Drop tasks here</p>}
            </div>
          );
        })}
      </section>

      {selected && <TaskModal task={selected} isAdmin={isAdmin} onClose={() => setSelectedId(null)} onChanged={loadStats} />}
    </main>
  );
}
