import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const Navbar = ({ onMenuClick }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const initials = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="topnav">
      {/* Left: burger + brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          style={{
            display: 'none', /* hidden on desktop, shown via media query below */
            background: 'none', border: 'none',
            color: 'var(--on-surface-variant)', cursor: 'pointer',
            padding: '0.25rem', borderRadius: '0.5rem',
          }}
          className="mobile-menu-btn"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <span style={{
          fontFamily: 'var(--font-headline)',
          fontWeight: 800,
          fontSize: '1.125rem',
          color: 'var(--on-surface)',
          letterSpacing: '-0.01em',
        }}>
          TaskArchitect
        </span>

        {/* Search — hidden on small screens */}
        {/* <div style={{ position: 'relative' }} className="nav-search">
          <span className="material-symbols-outlined" style={{
            position: 'absolute', left: '0.75rem', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--outline)', fontSize: '1.125rem',
            pointerEvents: 'none',
          }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              paddingLeft: '2.25rem', paddingRight: '1rem',
              paddingTop: '0.5rem', paddingBottom: '0.5rem',
              background: 'var(--surface-container)',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              color: 'var(--on-surface)',
              outline: 'none',
              width: '240px',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div> */}
      </div>

      {/* Right: actions + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* <button
          aria-label="Notifications"
          style={{
            background: 'none', border: 'none',
            color: 'var(--on-surface-variant)', cursor: 'pointer',
            padding: '0.5rem', borderRadius: '9999px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <span className="material-symbols-outlined">notifications</span>
        </button> */}

        {/* <button
          aria-label="Help"
          style={{
            background: 'none', border: 'none',
            color: 'var(--on-surface-variant)', cursor: 'pointer',
            padding: '0.5rem', borderRadius: '9999px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <span className="material-symbols-outlined">help</span>
        </button> */}

        {/* Avatar with Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            title={user?.email}
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: '2rem', height: '2rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, var(--primary), var(--primary-container))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, color: '#fff',
              cursor: 'pointer',
              border: '2px solid var(--surface-container-highest)',
              marginLeft: '0.25rem',
            }}
          >
            {initials}
          </div>

          {showMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              background: 'var(--surface)',
              border: '1px solid var(--outline-variant)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              minWidth: '140px',
              padding: '0.5rem',
              zIndex: 50,
            }}>
              <div style={{ padding: '0 0.5rem 0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--outline-variant)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user?.email}</p>
                <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--on-surface-variant)' }}>{isAdmin ? 'Admin' : 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'var(--error)',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>logout</span>
                Logout
              </button>
            </div>
          )}
        </div>

        {isAdmin && (
          <span style={{
            fontSize: '0.6rem', background: 'var(--primary-fixed)',
            color: 'var(--on-primary-fixed-variant)',
            borderRadius: '9999px', padding: '0.125rem 0.5rem',
            fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            Admin
          </span>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .nav-search { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
