import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { showToast } from '../components/UI/Toast.jsx';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin'); // 'signin' | 'register'
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await login(form);
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('Welcome back! 👋', 'success');
      navigate('/dashboard', { replace: true });
    } else {
      showToast(result.payload || 'Login failed', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: '960px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        minHeight: '640px',
        borderRadius: '1rem',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
        background: 'var(--surface-container-lowest)',
      }}>

        {/* ── Left: Branding column ─────────────────── */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: '-4rem', right: '-4rem',
            width: '16rem', height: '16rem',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-3rem', left: '-3rem',
            width: '12rem', height: '12rem',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '0.625rem',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontVariationSettings: "'FILL' 1" }}>
                architecture
              </span>
            </div>
            <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: '#fff', letterSpacing: '-0.01em' }}>
              TaskArchitect
            </span>
          </div>

          {/* Headline */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-headline)',
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.15,
              margin: '0 0 1rem',
            }}>
              Plan your workflow with{' '}
              <span style={{ color: 'var(--primary-fixed-dim)' }}>precision</span>
            </h1>
            <p style={{ color: 'var(--on-primary-container)', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
              The enterprise-grade workspace designed for architectural clarity and seamless team execution.
            </p>
          </div>

          {/* Stats */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '2rem' }}>
            {[['100%', 'Free'], ['256-bit', 'Security'], ['15k+', 'Enterprises']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-headline)' }}>{val}</div>
                <div style={{ color: 'var(--primary-fixed-dim)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form column ───────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '3rem 2.5rem',
          background: 'var(--surface-container-lowest)',
        }}>
          {/* Welcome heading */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', margin: '0 0 0.375rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>
              Sign in to access your enterprise workspace.
            </p>
          </div>

          {/* Tab toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-container-high)',
            borderRadius: '0.625rem',
            padding: '0.25rem',
            marginBottom: '2rem',
            maxWidth: '18rem',
          }}>
            {[['signin', 'Sign In'], ['register', 'Register']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => key === 'register' ? navigate('/register') : setTab(key)}
                style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  background: tab === key ? 'var(--surface-container-lowest)' : 'transparent',
                  color: tab === key ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label className="label" htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  className={`input ${errors.email ? 'error' : ''}`}
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none',
                }}>alternate_email</span>
              </div>
              {errors.email && <span className="error-text">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="label" style={{ margin: 0 }} htmlFor="login-password">Password</label>
                {/* <a href="#" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Forgot?</a> */}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type="password"
                  className={`input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none',
                }}>lock</span>
              </div>
              {errors.password && <span className="error-text">⚠ {errors.password}</span>}
            </div>

            {/* Remember me */}
            {/* <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                Keep me signed in for 30 days
              </span>
            </label> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              id="login-submit"
              style={{ width: '100%', justifyContent: 'center', borderRadius: '0.625rem', letterSpacing: '0.04em' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* SSO divider */}
          <div style={{ margin: '1.75rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Or continue with Demo
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--outline-variant)' }} />
          </div>

          {/* SSO buttons */}
          {/* <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Google', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )},
              { label: 'Azure AD', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--on-surface-variant)">
                  <path d="M11.4 10.9L8.5 5.1l-7 13.5h4.3l5.6-7.7zm1.2 0l4.7 6.5-9.8 1.7 5.1-8.2zM8.5 3L0 18.6h3.8L8.5 3zm7 2.1L12 3 9.5 7.4l2.5 4.3 3.5-6.6z"/>
                </svg>
              )},
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                  padding: '0.625rem',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: '0.625rem',
                  background: 'var(--surface-container-lowest)',
                  color: 'var(--on-surface)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-container-lowest)'}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Demo creds */}
          <div style={{
            marginTop: '1.5rem',
            padding: '0.875rem 1rem',
            background: 'var(--primary-fixed)',
            borderRadius: '0.625rem',
            fontSize: '0.8rem',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--on-primary-fixed-variant)', marginBottom: '0.25rem' }}>🔑 Demo Credentials</div>
            <div style={{ color: 'var(--on-primary-fixed)' }}>Admin: <code style={{ fontWeight: 600 }}>admin@taskapp.com / Admin@123</code></div>
            <div style={{ color: 'var(--on-primary-fixed)' }}>User: <code style={{ fontWeight: 600 }}>user1@taskapp.com / User@123</code></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
