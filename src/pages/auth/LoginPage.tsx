import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../models';

const ROLES: UserRole[] = ['Admin', 'Doctor', 'Patient'];

const DEMO_ACCOUNTS: Record<UserRole, { email: string; password: string }> = {
  Admin:   { email: 'admin@hospital.com',       password: 'Admin@123' },
  Doctor:  { email: 'dr.smith@hospital.com',    password: 'Doctor@123' },
  Patient: { email: 'john@email.com',           password: 'Patient@123' },
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password }, role);
      navigate(`/${role.toLowerCase()}/dashboard`);
    } catch {
      setError('Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const demo = DEMO_ACCOUNTS[role];
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const roleIcon: Record<UserRole, string> = {
    Admin: 'bi-shield-fill',
    Doctor: 'bi-heart-pulse-fill',
    Patient: 'bi-person-fill',
  };
  const roleColor: Record<UserRole, string> = {
    Admin: 'var(--danger)',
    Doctor: 'var(--success)',
    Patient: 'var(--primary)',
  };

  return (
    <div className="auth-page">
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--r-md)',
            background: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <i className="bi bi-heart-pulse-fill text-white" style={{ fontSize: 24 }}></i>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 28, color: 'var(--ink)', marginBottom: 4 }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign in to your Veezta account</p>
        </div>

        <div className="auth-card">
          {/* Role selector */}
          <div className="mb-4">
            <label className="form-label">Sign in as</label>
            <div className="d-flex gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-fill btn btn-sm"
                  style={{
                    borderRadius: 'var(--r-sm)',
                    border: `2px solid ${role === r ? roleColor[r] : 'var(--border)'}`,
                    background: role === r ? `color-mix(in srgb, ${roleColor[r]} 10%, transparent)` : 'var(--surface)',
                    color: role === r ? roleColor[r] : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: 13,
                    padding: '8px 0',
                    transition: 'all 0.15s',
                  }}
                >
                  <i className={`bi ${roleIcon[r]} me-1`}></i>{r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: '0 var(--r-sm) var(--r-sm) 0', borderColor: 'var(--border)' }}
                  onClick={() => setShowPass(v => !v)}
                >
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2" style={{ borderRadius: 'var(--r-sm)', fontSize: 13 }}>
                <i className="bi bi-exclamation-circle-fill"></i>{error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100 mt-1"
              disabled={loading}
              style={{ borderRadius: 'var(--r-sm)', padding: '11px', fontWeight: 600, fontSize: 15 }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-4 p-3" style={{ background: 'var(--bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Demo credentials ({role})
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                style={{ fontSize: 11, padding: '2px 10px', borderRadius: 'var(--r-sm)' }}
                onClick={fillDemo}
              >
                <i className="bi bi-lightning-fill me-1"></i>Auto-fill
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              <div><i className="bi bi-envelope me-1"></i>{DEMO_ACCOUNTS[role].email}</div>
              <div><i className="bi bi-key me-1"></i>{DEMO_ACCOUNTS[role].password}</div>
            </div>
          </div>

          {role === 'Patient' && (
            <p className="text-center mt-3 mb-0" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
