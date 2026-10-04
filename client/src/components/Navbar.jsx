import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <header className="navbar">
      <Link to="/" className="brand">✔ TaskFlow</Link>
      {user && (
        <div className="nav-right">
          <span className="nav-user">{user.name} <span className={`badge ${user.role}`}>{user.role}</span></span>
          <button className="btn btn-ghost" onClick={() => { dispatch(logout()); navigate('/login'); }}>Logout</button>
        </div>
      )}
    </header>
  );
}
