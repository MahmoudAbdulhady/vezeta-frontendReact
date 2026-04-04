import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientRegister } from '../../api/patient.api';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    firstName: '', lastName: '', phoneNumber: '',
    dateOfBirth: '', gender: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (field: string, value: string | number) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await patientRegister({
        email: form.email, password: form.password,
        firstName: form.firstName, lastName: form.lastName,
        phoneNumber: form.phoneNumber, dateOfBirth: form.dateOfBirth,
        gender: form.gender, imageUrl: imageFile,
      });
      navigate('/login');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setError(
        typeof axiosErr.response?.data === 'string'
          ? axiosErr.response.data
          : 'Registration failed. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div className="text-center mb-4">
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
          }}>
            <i className="bi bi-person-plus-fill text-white" style={{ fontSize: 24 }}></i>
          </div>
          <h1 style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 26, color: '#0f172a', marginBottom: 4 }}>
            Create your account
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Join Veezta as a patient today</p>
        </div>

        <div className="auth-card" style={{ maxWidth: 520 }}>
          <form onSubmit={handleSubmit}>
            {/* Profile Image */}
            <div className="text-center mb-4">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: imagePreview ? 'none' : 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer',
                }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <i className="bi bi-person-fill text-white" style={{ fontSize: 32 }}></i>
                  }
                </div>
                <label htmlFor="imageUpload" style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px solid white',
                }}>
                  <i className="bi bi-camera-fill text-white" style={{ fontSize: 11 }}></i>
                </label>
                <input id="imageUpload" type="file" accept="image/*" className="d-none" onChange={handleImageChange} />
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>Optional profile photo</p>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <label className="form-label">First Name</label>
                <input className="form-control" required value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="John" />
              </div>
              <div className="col-6">
                <label className="form-label">Last Name</label>
                <input className="form-control" required value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Doe" />
              </div>
              <div className="col-12">
                <label className="form-label">Email address</label>
                <input type="email" className="form-control" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="col-6">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input type={showPass ? 'text' : 'password'} className="form-control" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
                  <button type="button" className="btn btn-outline-secondary" style={{ borderRadius: '0 10px 10px 0', borderColor: '#e2e8f0' }} onClick={() => setShowPass(v => !v)}>
                    <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="col-6">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-control" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" />
              </div>
              <div className="col-6">
                <label className="form-label">Phone Number</label>
                <input className="form-control" required value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} placeholder="+1234567890" />
              </div>
              <div className="col-6">
                <label className="form-label">Date of Birth</label>
                <input type="date" className="form-control" required value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Gender</label>
                <select className="form-select" value={form.gender} onChange={e => set('gender', Number(e.target.value))}>
                  <option value={0}>Male</option>
                  <option value={1}>Female</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 mt-3 d-flex align-items-center gap-2" style={{ borderRadius: 10, fontSize: 13 }}>
                <i className="bi bi-exclamation-circle-fill"></i>{error}
              </div>
            )}

            <button type="submit" className="btn btn-primary w-100 mt-4" disabled={loading}
              style={{ borderRadius: 10, padding: '11px', fontWeight: 600, fontSize: 15 }}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</> : 'Create Account'}
            </button>

            <p className="text-center mt-3 mb-0" style={{ fontSize: 13, color: '#64748b' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
