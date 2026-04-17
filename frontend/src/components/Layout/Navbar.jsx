import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const Navbar = ({ onMenuClick }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #334155',
      background: 'rgba(15,23,42,0.8)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0, zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem',
            display: 'flex', alignItems: 'center', borderRadius: '0.375rem',
          }}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <span style={{ fontWeight: 600, fontSize: '1.0625rem', color: '#f1f5f9' }}>
          TaskFlow
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={() => navigate('/tasks/new')}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', borderRadius: '0.5rem',
            padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem',
            transition: 'transform 0.2s',
          }}
        >
          + New Task
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            className="avatar"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              width: '2rem', height: '2rem', fontSize: '0.75rem',
              cursor: 'pointer',
            }}
            title={user?.email}
          >
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          {isAdmin && (
            <span style={{
              fontSize: '0.6875rem', background: 'rgba(99,102,241,0.2)',
              color: '#a5b4fc', borderRadius: '9999px', padding: '0.125rem 0.5rem',
              fontWeight: 600,
            }}>ADMIN</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
