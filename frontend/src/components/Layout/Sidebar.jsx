import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { showToast } from '../UI/Toast.jsx';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard',  icon: 'dashboard' },
  { to: '/tasks',     label: 'Tasks',       icon: 'assignment' },
];
const adminLinks = [
  { to: '/admin/users', label: 'Team',     icon: 'group' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const links = isAdmin ? [...navLinks, ...adminLinks] : navLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 39,
          }}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div style={{
          padding: '1.5rem 1.25rem 1rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: '2.5rem', height: '2.5rem',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
            borderRadius: '0.75rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent)',
          }}>
            <span
              className="material-symbols-outlined"
              style={{ color: '#fff', fontSize: '1.25rem', fontVariationSettings: "'FILL' 1" }}
            >
              architecture
            </span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--primary)' }}>
              Task Management
            </div>
            <div style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)', fontWeight: 600 }}>
              Enterprise Edition
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* New Task CTA */}
        <div style={{ padding: '0 1rem 1rem' }}>
          <button
            onClick={() => { navigate('/tasks/new'); onClose?.(); }}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', borderRadius: '0.75rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>add</span>
            New Task
          </button>
        </div>

        {/* User footer */}
        <div style={{
          borderTop: '1px solid var(--outline-variant)',
          padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.5rem', marginBottom: '0.25rem' }}>
            <div
              className="avatar"
              style={{
                width: '2rem', height: '2rem', fontSize: '0.75rem',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {user?.role}
              </div>
            </div>
          </div>

          {/* <NavLink to="/tasks/new" onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>settings</span>
            <span>Settings</span>
          </NavLink> */}

          <button
            onClick={handleLogout}
            className="nav-link"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: '100%', textAlign: 'left',
              color: 'var(--error)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
