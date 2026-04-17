import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { showToast } from '../components/UI/Toast.jsx';

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

        {/* Branding Left */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%)',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-4rem', right: '-4rem', width: '16rem', height: '16rem', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-3rem', left: '-3rem', width: '12rem', height: '12rem', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '0.625rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontVariationSettings: "'FILL' 1" }}>architecture</span>
            </div>
            <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>TaskArchitect</span>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-headline)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: '0 0 1rem' }}>
              Start building with <span style={{ color: 'var(--primary-fixed-dim)' }}>your team</span> today.
            </h1>
            <p style={{ color: 'var(--on-primary-container)', fontSize: '1rem', lineHeight: 1.65, margin: 0 }}>
              Create your enterprise workspace and invite your team to collaborate.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '2rem' }}>
            {[['Free', 'To Start'], ['30-sec', 'Setup'], ['256-bit', 'Security']].map(([val, lbl]) => (
              <div key={lbl}>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.125rem', fontFamily: 'var(--font-headline)' }}>{val}</div>
                <div style={{ color: 'var(--primary-fixed-dim)', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Right */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3rem 2.5rem', background: 'var(--surface-container-lowest)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)', margin: '0 0 0.375rem' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--on-surface-variant)', margin: 0 }}>Join TaskArchitect and plan your workflow.</p>
          </div>

          {/* Tab toggle */}
          <div style={{
            display: 'flex', background: 'var(--surface-container-high)',
            borderRadius: '0.625rem', padding: '0.25rem',
            marginBottom: '2rem', maxWidth: '18rem',
          }}>
            {[['signin', 'Sign In'], ['register', 'Register']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => key === 'signin' ? navigate('/login') : undefined}
                style={{
                  flex: 1, padding: '0.5rem 1rem',
                  borderRadius: '0.375rem', border: 'none', cursor: 'pointer',
                  fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  background: key === 'register' ? 'var(--surface-container-lowest)' : 'transparent',
                  color: key === 'register' ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: key === 'register' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email */}
            <div>
              <label className="label" htmlFor="reg-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-email" type="email"
                  className={`input ${errors.email ? 'error' : ''}`}
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                />
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>alternate_email</span>
              </div>
              {errors.email && <span className="error-text">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password" type={showPass ? 'text' : 'password'}
                  className={`input ${errors.password ? 'error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {errors.password && <span className="error-text">⚠ {errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label" htmlFor="reg-confirm">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-confirm" type="password"
                  className={`input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  autoComplete="new-password"
                />
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '1.125rem', pointerEvents: 'none' }}>lock</span>
              </div>
              {errors.confirmPassword && <span className="error-text">⚠ {errors.confirmPassword}</span>}
            </div>

            <button
              type="submit" disabled={loading}
              className="btn btn-primary btn-lg"
              id="register-submit"
              style={{ width: '100%', justifyContent: 'center', borderRadius: '0.625rem', letterSpacing: '0.04em', marginTop: '0.25rem' }}
            >
              {loading ? (
                <><span className="spinner spinner-sm" /> Creating Account...</>
              ) : (
                <>CREATE ACCOUNT <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_forward</span></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
