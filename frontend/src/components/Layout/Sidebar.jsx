import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { showToast } from '../UI/Toast.jsx';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
];

const adminLinks = [
  { to: '/admin/users', label: 'Users', icon: '👥' },
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
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 39, display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside
        className={`sidebar ${isOpen ? 'mobile-open' : ''}`}
        style={{ zIndex: 40 }}
      >
        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.25rem 1rem',
          borderBottom: '1px solid #334155',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <div style={{
            width: '2.25rem', height: '2.25rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.125rem', fontWeight: 800,
          }}>T</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>TaskFlow</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Management System</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                textDecoration: 'none', fontSize: '0.9375rem', fontWeight: 500,
                color: isActive ? '#a5b4fc' : '#94a3b8',
                background: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                transition: 'all 0.2s',
              })}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #334155',
          display: 'flex', flexDirection: 'column', gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="avatar"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', width: '2rem', height: '2rem', fontSize: '0.75rem' }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.5rem',
              color: '#f87171', padding: '0.5rem', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
