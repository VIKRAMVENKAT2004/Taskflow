import { useState } from 'react';
import { useDispatch } from 'react-redux';
import api, { errMsg } from '../api/axios';
import { upsertTask, deleteTask } from '../store/taskSlice';

const LABEL = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

export default function TaskModal({ task, isAdmin, onClose, onChanged }) {
  const dispatch = useDispatch();
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const addComment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { text });
      dispatch(upsertTask(data));
      setText('');
    } catch (e2) { setErr(errMsg(e2)); }
  };

  const remove = async () => {
    if (!window.confirm('Delete this task?')) return;
    const res = await dispatch(deleteTask(task._id));
    if (res.error) return setErr(res.payload);
    onChanged(); onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{task.title}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-meta">
          <span className={`pill ${task.status}`}>{LABEL[task.status]}</span>
          <span>👤 {task.assignee?.name || 'Unassigned'}</span>
          <span>📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
        </div>
        <p className="muted">{task.description || 'No description.'}</p>

        <h4>Comments ({task.comments.length})</h4>
        <ul className="comments">
          {task.comments.map((c) => (
            <li key={c._id}><strong>{c.user?.name}</strong> <small className="muted">{new Date(c.createdAt).toLocaleString()}</small><p>{c.text}</p></li>
          ))}
          {task.comments.length === 0 && <li className="muted">No comments yet.</li>}
        </ul>
        {err && <div className="alert">{err}</div>}
        <form className="inline-form" onSubmit={addComment}>
          <input required value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" />
          <button className="btn btn-primary">Send</button>
        </form>
        {isAdmin && <button className="btn btn-danger" onClick={remove}>Delete task</button>}
      </div>
    </div>
  );
}
