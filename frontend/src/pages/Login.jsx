import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { showToast } from '../components/UI/Toast.jsx';
import Button from '../components/UI/Button.jsx';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '1rem', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff',
            marginBottom: '1rem', boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}>T</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>TaskFlow</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="admin@taskapp.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
              {errors.email && <span className="error-text">⚠ {errors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className={`input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem',
                  }}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-text">⚠ {errors.password}</span>}
            </div>

            <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
              Create one
            </Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '1rem', padding: '1rem', background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem',
          fontSize: '0.8125rem', color: '#94a3b8',
        }}>
          <div style={{ fontWeight: 600, color: '#a5b4fc', marginBottom: '0.5rem' }}>Demo Credentials</div>
          <div>Admin: <code style={{ color: '#f1f5f9' }}>admin@taskapp.com / Admin@123</code></div>
          <div>User: <code style={{ color: '#f1f5f9' }}>user1@taskapp.com / User@123</code></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
