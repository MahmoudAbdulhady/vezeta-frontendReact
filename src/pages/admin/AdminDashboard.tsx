import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import {
  getNumOfDoctors, getTotalPatients, getRequestStats,
  getTopSpecializations, getTopDoctors, getNumOfDoctorsLast24h,
  getAllDoctors, getAllPatients, deleteDoctorById, addDoctor,
  getAllSpecializations, addSpecialization, deleteSpecialization,
} from '../../api/admin.api';
import { getAllCoupons, createCoupon, deactivateCoupon, deleteCoupon } from '../../api/coupon.api';
import { getImageUrl } from '../../api/axiosClient';
import type { ITopSpecialization, ITopDoctor, IRequestsDTO, IDoctorDTO, IPatientDTO, IDoctorRegisterForm, ISpecializationDTO, ICouponDTO } from '../../models';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const AdminSidebar: React.FC = () => {
  const loc = useLocation();
  const links = [
    { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/admin/doctors', icon: 'bi-heart-pulse', label: 'Doctors' },
    { to: '/admin/patients', icon: 'bi-people', label: 'Patients' },
    { to: '/admin/coupons', icon: 'bi-tag', label: 'Coupons' },
    { to: '/admin/specializations', icon: 'bi-hospital', label: 'Specializations' },
    { to: '/admin/profile', icon: 'bi-person-circle', label: 'My Profile' },
  ];
  return (
    <div className="sidebar d-none d-md-block">
      <div className="px-4 mb-3">
        <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Navigation</span>
      </div>
      {links.map(l => (
        <Link key={l.to} to={l.to} className={`sidebar-link ${loc.pathname === l.to ? 'active' : ''}`}>
          <i className={`bi ${l.icon}`}></i>{l.label}
        </Link>
      ))}
    </div>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState({ doctors: 0, patients: 0, last24h: 0 });
  const [requests, setRequests] = useState<IRequestsDTO | null>(null);
  const [topSpecs, setTopSpecs] = useState<ITopSpecialization[]>([]);
  const [topDocs, setTopDocs] = useState<ITopDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getNumOfDoctors(), getTotalPatients(), getNumOfDoctorsLast24h(),
      getRequestStats(), getTopSpecializations(), getTopDoctors(),
    ]).then(([d, p, l24, req, specs, docs]) => {
      setStats({ doctors: d.data.totalDoctors, patients: p.data.totalPatients, last24h: l24.data.doctorsAddedLast24Hours });
      setRequests(req.data);
      setTopSpecs(specs.data);
      setTopDocs(docs.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const statCards = [
    { label: 'Total Doctors', value: stats.doctors, icon: 'bi-heart-pulse-fill', color: '#10b981', bg: '#d1fae5' },
    { label: 'Total Patients', value: stats.patients, icon: 'bi-people-fill', color: '#2563eb', bg: '#dbeafe' },
    { label: 'New Doctors (24h)', value: stats.last24h, icon: 'bi-person-plus-fill', color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Pending Bookings', value: requests?.numOfPendingRequest ?? 0, icon: 'bi-clock-fill', color: '#8b5cf6', bg: '#ede9fe' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">Dashboard Overview</h2>
        <p className="section-subtitle">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {statCards.map(c => (
          <div key={c.label} className="col-6 col-xl-3">
            <div style={{
              background: 'white', borderRadius: 16, padding: '20px',
              border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`bi ${c.icon}`} style={{ fontSize: 22, color: c.color }}></i>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Sora', color: '#0f172a', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request status row */}
      {requests && (
        <div className="row g-3 mb-4">
          {[
            { label: 'Completed', val: requests.numOfCompletedRequest, cls: 'status-completed', icon: 'bi-check-circle-fill' },
            { label: 'Pending', val: requests.numOfPendingRequest, cls: 'status-pending', icon: 'bi-clock-fill' },
            { label: 'Canceled', val: requests.numOfCanceledRequest, cls: 'status-canceled', icon: 'bi-x-circle-fill' },
          ].map(r => (
            <div key={r.label} className="col-4">
              <div className="veezta-card p-3 text-center">
                <span className={`status-badge ${r.cls}`}><i className={`bi ${r.icon} me-1`}></i>{r.label}</span>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Sora', marginTop: 8 }}>{r.val}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>bookings</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-3">
        {/* Top Specializations */}
        <div className="col-md-6">
          <div className="veezta-card p-4 h-100">
            <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 16 }}>
              <i className="bi bi-bar-chart-fill me-2 text-primary"></i>Top Specializations
            </h6>
            {topSpecs.map((s, i) => {
              const max = topSpecs[0]?.requestCount || 1;
              const pct = Math.round((s.requestCount / max) * 100);
              return (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.specalizationName}</span>
                    <span style={{ fontSize: 13, color: '#64748b' }}>{s.requestCount} bookings</span>
                  </div>
                  <div style={{ height: 6, background: '#e2e8f0', borderRadius: 4 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #2563eb, #06b6d4)', borderRadius: 4, transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Doctors */}
        <div className="col-md-6">
          <div className="veezta-card p-4 h-100">
            <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 16 }}>
              <i className="bi bi-trophy-fill me-2 text-warning"></i>Top Doctors
            </h6>
            {topDocs.slice(0, 5).map((d, i) => (
              <div key={i} className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < 3 ? '#fef3c7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: i < 3 ? '#92400e' : '#64748b' }}>#{i + 1}</span>
                </div>
                <div className="avatar" style={{ width: 36, height: 36, flexShrink: 0 }}>
                  {d.image
                    ? <img src={getImageUrl(d.image)!} alt={d.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{d.fullName[0]}</span>
                  }
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.fullName}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{d.specilization}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>{d.requestCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Doctors Management ───────────────────────────────────────────────────────
const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<IDoctorDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<IDoctorRegisterForm>({
    email: '', password: '', firstName: '', lastName: '',
    specialization: '', phoneNumber: '', dateOfBirth: '', imageUrl: null, gender: 1,
  });
  const [specializations, setSpecializations] = useState<ISpecializationDTO[]>([]);
  const pageSize = 10;

  const load = () => {
    setLoading(true);
    getAllDoctors({ pageNumber: page, pageSize, searchTerm: search })
      .then(r => { setDoctors(r.data.doctors); setTotal(r.data.totalCount); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  useEffect(() => {
    getAllSpecializations()
      .then(r => setSpecializations(r.data))
      .catch(() => {/* non-critical */});
  }, []);

  const handleDelete = async (email: string, idx: number) => {
    if (!confirm(`Delete doctor ${email}?`)) return;
    await deleteDoctorById(idx + 1);
    load();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await addDoctor(form);
      setShowModal(false);
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setFormError(typeof axiosErr.response?.data === 'string' ? axiosErr.response.data : 'Failed to add doctor.');
    } finally {
      setFormLoading(false);
    }
  };

  const setF = (field: string, value: string | number | File | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2 className="section-title">Doctors</h2>
          <p className="section-subtitle">{total} doctors registered</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>Add Doctor
        </button>
      </div>

      <div className="veezta-card p-4">
        <div className="mb-3">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRight: 'none' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input className="form-control" placeholder="Search doctors..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ borderLeft: 'none' }} />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table veezta-table mb-0">
              <thead>
                <tr>
                  <th>Doctor</th><th>Specialization</th><th>Phone</th><th>Gender</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">No doctors found.</td></tr>
                ) : doctors.map((d, i) => (
                  <tr key={i}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar" style={{ width: 38, height: 38 }}>
                          {d.imageUrl
                            ? <img src={getImageUrl(d.imageUrl)!} alt={d.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{d.fullName[0]}</span>
                          }
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{d.fullName}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">{d.specilization}</span></td>
                    <td style={{ fontSize: 13, color: '#64748b' }}>{d.phoneNumber}</td>
                    <td style={{ fontSize: 13, color: '#64748b' }}>{d.gender}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDelete(d.email, i)}>
                        <i className="bi bi-trash3 me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="d-flex align-items-center justify-content-between mt-3">
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="btn btn-outline-secondary" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: 20, border: 'none' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title" style={{ fontFamily: 'Sora', fontWeight: 700 }}>Add New Doctor</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAdd}>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label">First Name</label>
                      <input className="form-control" required value={form.firstName} onChange={e => setF('firstName', e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Last Name</label>
                      <input className="form-control" required value={form.lastName} onChange={e => setF('lastName', e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" required value={form.email} onChange={e => setF('email', e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" required value={form.password} onChange={e => setF('password', e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Specialization</label>
                      <select className="form-select" required value={form.specialization} onChange={e => setF('specialization', e.target.value)}>
                        <option value="">— Select specialization —</option>
                        {specializations.map(s => (
                          <option key={s.specializationId} value={s.specializationName}>
                            {s.specializationName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Phone Number</label>
                      <input className="form-control" required value={form.phoneNumber} onChange={e => setF('phoneNumber', e.target.value)}
                        placeholder="01012345678" maxLength={13}
                        pattern="^(\+?20)?01[0125]\d{8}$"
                        title="Egyptian number: 010, 011, 012, or 015" />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Date of Birth</label>
                      <input type="date" className="form-control" required value={form.dateOfBirth} onChange={e => setF('dateOfBirth', e.target.value)} />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Gender</label>
                      <select className="form-select" value={form.gender} onChange={e => setF('gender', Number(e.target.value))}>
                        <option value={1}>Male</option>
                        <option value={0}>Female</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Profile Image</label>
                      <input type="file" accept="image/*" className="form-control" required
                        onChange={e => setF('imageUrl', e.target.files?.[0] ?? null)} />
                    </div>
                  </div>
                  {formError && (
                    <div className="alert alert-danger py-2 mt-3" style={{ fontSize: 13, borderRadius: 10 }}>
                      <i className="bi bi-exclamation-circle me-2"></i>{formError}
                    </div>
                  )}
                  <div className="d-flex gap-2 mt-4 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={formLoading}>
                      {formLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Adding...</> : 'Add Doctor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Patients Management ──────────────────────────────────────────────────────
const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<IPatientDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const load = () => {
    setLoading(true);
    getAllPatients({ pageNumber: page, pageSize, searchTerm: search })
      .then(r => { setPatients(r.data.patients); setTotal(r.data.totalPatients); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">Patients</h2>
        <p className="section-subtitle">{total} patients registered</p>
      </div>
      <div className="veezta-card p-4">
        <div className="mb-3">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRight: 'none' }}>
              <i className="bi bi-search text-muted"></i>
            </span>
            <input className="form-control" placeholder="Search patients..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ borderLeft: 'none' }} />
          </div>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table veezta-table mb-0">
              <thead><tr><th>Patient</th><th>Phone</th><th>Date of Birth</th><th>Gender</th></tr></thead>
              <tbody>
                {patients.length === 0
                  ? <tr><td colSpan={4} className="text-center py-4 text-muted">No patients found.</td></tr>
                  : patients.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar" style={{ width: 38, height: 38 }}>
                            {p.imageUrl
                              ? <img src={getImageUrl(p.imageUrl)!} alt={p.fullName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{p.fullName[0]}</span>
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{p.fullName}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{p.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{p.phoneNumber}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{p.dateOfBirth}</td>
                      <td style={{ fontSize: 13, color: '#64748b' }}>{p.gender}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        {total > pageSize && (
          <div className="d-flex align-items-center justify-content-between mt-3">
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
            </span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="btn btn-outline-secondary" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Coupon Management ────────────────────────────────────────────────────────
const DISCOUNT_OPTIONS = [
  { value: 50, label: 'Fifty (50)' },
  { value: 100, label: 'One Hundred (100)' },
];

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<ICouponDTO[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ couponName: '', couponCode: 50, isActive: true });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadCoupons = () => {
    setListLoading(true);
    getAllCoupons()
      .then(r => setCoupons(r.data))
      .catch(() => setError('Failed to load coupons.'))
      .finally(() => setListLoading(false));
  };

  useEffect(() => { loadCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createCoupon(form);
      setSuccess(`Coupon "${form.couponName}" created successfully!`);
      setShowModal(false);
      setForm({ couponName: '', couponCode: 50, isActive: true });
      loadCoupons();
    } catch { setError('Failed to create coupon.'); }
    finally { setLoading(false); }
  };

  const handleDeactivate = async (id: number) => {
    setActionLoadingId(id);
    try {
      await deactivateCoupon(id);
      loadCoupons();
    } catch { setError('Failed to deactivate coupon.'); }
    finally { setActionLoadingId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon permanently?')) return;
    setActionLoadingId(id);
    try {
      await deleteCoupon(id);
      loadCoupons();
    } catch { setError('Failed to delete coupon.'); }
    finally { setActionLoadingId(null); }
  };

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2 className="section-title">Coupon Management</h2>
          <p className="section-subtitle">Create and manage discount coupons for patients</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus-lg me-2"></i>New Coupon
        </button>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
          <i className="bi bi-check-circle-fill"></i>{success}
          <button className="btn-close ms-auto" onClick={() => setSuccess('')}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
          <i className="bi bi-exclamation-triangle-fill"></i>{error}
          <button className="btn-close ms-auto" onClick={() => setError('')}></button>
        </div>
      )}

      {listLoading ? <LoadingSpinner text="Loading coupons..." /> : (
        <div className="veezta-card p-4">
          {coupons.length === 0 ? (
            <div className="text-center py-5" style={{ color: '#94a3b8' }}>
              <i className="bi bi-tag" style={{ fontSize: 48 }}></i>
              <p className="mt-3">No coupons yet. Create your first one above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr style={{ fontSize: 13, color: '#64748b' }}>
                    <th>Name</th>
                    <th>Code Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c.couponId}>
                      <td style={{ fontWeight: 600 }}>{c.couponName}</td>
                      <td>{c.code}</td>
                      <td>
                        <span className={`badge rounded-pill ${c.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {c.isActive && (
                            <button
                              className="btn btn-sm btn-outline-warning rounded-pill"
                              disabled={actionLoadingId === c.couponId}
                              onClick={() => handleDeactivate(c.couponId)}
                            >
                              {actionLoadingId === c.couponId
                                ? <span className="spinner-border spinner-border-sm"></span>
                                : <><i className="bi bi-pause-circle me-1"></i>Deactivate</>}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill"
                            disabled={actionLoadingId === c.couponId}
                            onClick={() => handleDelete(c.couponId)}
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 20, border: 'none' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title" style={{ fontFamily: 'Sora', fontWeight: 700 }}>Create Coupon</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreate}>
                  <div className="mb-3">
                    <label className="form-label">Coupon Name</label>
                    <input className="form-control" required value={form.couponName}
                      onChange={e => setForm(f => ({ ...f, couponName: e.target.value }))}
                      placeholder="e.g. SUMMER20" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Discount Code</label>
                    <select className="form-select" value={form.couponCode}
                      onChange={e => setForm(f => ({ ...f, couponCode: Number(e.target.value) }))}>
                      {DISCOUNT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-check mb-3">
                    <input className="form-check-input" type="checkbox" id="isActive"
                      checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                    <label className="form-check-label" htmlFor="isActive">Active immediately</label>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                      {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Specializations Management ───────────────────────────────────────────────
const AdminSpecializations: React.FC = () => {
  const [specs, setSpecs] = useState<ISpecializationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    setLoading(true);
    getAllSpecializations()
      .then(r => setSpecs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError('');
    setAdding(true);
    try {
      await addSpecialization(newName.trim());
      setSuccess(`"${newName.trim()}" added successfully.`);
      setNewName('');
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setError(typeof axiosErr.response?.data === 'string' ? axiosErr.response.data : 'Failed to add specialization.');
    } finally { setAdding(false); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Doctors assigned to it must be reassigned first.`)) return;
    setDeletingId(id);
    try {
      await deleteSpecialization(id);
      setSuccess(`"${name}" deleted.`);
      load();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      setError(typeof axiosErr.response?.data === 'string' ? axiosErr.response.data : 'Failed to delete specialization.');
    } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">Specializations</h2>
        <p className="section-subtitle">Manage the specializations doctors can be assigned to</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
          <i className="bi bi-exclamation-circle-fill"></i>{error}
          <button className="btn-close ms-auto" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
          <i className="bi bi-check-circle-fill"></i>{success}
          <button className="btn-close ms-auto" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Add form */}
      <div className="veezta-card p-4 mb-4">
        <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-plus-circle me-2 text-primary"></i>Add Specialization
        </h6>
        <form onSubmit={handleAdd} className="d-flex gap-2">
          <input
            className="form-control"
            placeholder="e.g. Cardiology"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            style={{ maxWidth: 320 }}
          />
          <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={adding || !newName.trim()}>
            {adding ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-plus-lg me-1"></i>}
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="veezta-card p-4">
        <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-list-ul me-2 text-primary"></i>All Specializations ({specs.length})
        </h6>
        {loading ? <LoadingSpinner /> : (
          <div className="row g-2">
            {specs.length === 0 ? (
              <div className="col-12 text-center py-4" style={{ color: '#94a3b8' }}>
                <i className="bi bi-inbox" style={{ fontSize: 40 }}></i>
                <p className="mt-2 mb-0">No specializations yet. Add one above.</p>
              </div>
            ) : specs.map(s => (
              <div key={s.specializationId} className="col-md-4 col-lg-3">
                <div className="d-flex align-items-center justify-content-between p-3"
                  style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>
                    <i className="bi bi-hospital me-2 text-primary" style={{ fontSize: 13 }}></i>
                    {s.specializationName}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    style={{ borderRadius: 8, padding: '2px 8px' }}
                    disabled={deletingId === s.specializationId}
                    onClick={() => handleDelete(s.specializationId, s.specializationName)}
                  >
                    {deletingId === s.specializationId
                      ? <span className="spinner-border spinner-border-sm"></span>
                      : <i className="bi bi-trash3"></i>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Admin Dashboard Root ─────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => (
  <div>
    <Navbar />
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <Routes>
          <Route path="dashboard" element={<AdminOverview />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="specializations" element={<AdminSpecializations />} />
          <Route path="*" element={<AdminOverview />} />
        </Routes>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
