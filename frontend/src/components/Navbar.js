import React from 'react';
import { useAuth } from '../AuthContext';

export default function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="logo-icon">🛡️</div>
        SmartComplaint
      </div>

      <div className="navbar-links">
        {user ? (
          <>
            <button
              className={`nav-btn ghost`}
              style={page === 'dashboard' ? { color: 'var(--text-primary)', background: 'var(--bg-hover)' } : {}}
              onClick={() => setPage('dashboard')}
            >
              📊 Dashboard
            </button>
            <button
              className={`nav-btn ghost`}
              style={page === 'submit' ? { color: 'var(--text-primary)', background: 'var(--bg-hover)' } : {}}
              onClick={() => setPage('submit')}
            >
              ✍️ New Complaint
            </button>

            <div className="nav-user">
              <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.name}</span>
            </div>

            <button className="nav-btn outline" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <button className="nav-btn outline" onClick={() => setPage('auth')}>
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
