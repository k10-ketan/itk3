import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { showToast } from '../components/UI/Toast.jsx';
import Button from '../components/UI/Button.jsx';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'At least 6 characters required';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await register({ email: form.email, password: form.password });
    if (result.meta.requestStatus === 'fulfilled') {
      showToast('Account created! Please sign in.', 'success');
      navigate('/login');
    } else {
      showToast(result.payload || 'Registration failed', 'error');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.5rem', height: '3.5rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1rem',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}>T</div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9' }}>Create Account</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748b' }}>Join TaskFlow today</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                autoComplete="email"
              />
              {errors.email && <span className="error-text">⚠ {errors.email}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  className={`input ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem',
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-text">⚠ {errors.password}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="label" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                className={`input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-text">⚠ {errors.confirmPassword}</span>}
            </div>

            <Button type="submit" variant="primary" loading={loading} style={{ width: '100%' }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
