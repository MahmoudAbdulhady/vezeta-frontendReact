import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getDoctorAppointments, getMyBookings, bookAppointment, cancelBooking } from '../../api/patient.api';
import type { IAppointmentDTO, IPatientBookingDTO, ITimeSlotInfoDTO } from '../../models';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const PatientSidebar: React.FC = () => {
  const loc = useLocation();
  const links = [
    { to: '/patient/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/patient/find-doctors', icon: 'bi-search-heart', label: 'Find Doctors' },
    { to: '/patient/my-bookings', icon: 'bi-calendar-check', label: 'My Bookings' },
    { to: '/patient/profile', icon: 'bi-person-circle', label: 'My Profile' },
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

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase();
  const cls = s === 'completed' ? 'status-completed' : s === 'canceled' ? 'status-canceled' : 'status-pending';
  const icon = s === 'completed' ? 'bi-check-circle-fill' : s === 'canceled' ? 'bi-x-circle-fill' : 'bi-clock-fill';
  return (
    <span className={`status-badge ${cls}`}>
      <i className={`bi ${icon} me-1`}></i>{status || 'Pending'}
    </span>
  );
};

// ─── Overview ─────────────────────────────────────────────────────────────────
const PatientOverview: React.FC = () => {
  const [bookings, setBookings] = useState<IPatientBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const PROMO_CODES = [
    { code: 'FIRST20', discount: '20% OFF', desc: 'First appointment discount', color: '#dbeafe', border: '#2563eb', text: '#1d4ed8' },
    { code: 'HEALTH10', discount: '10% OFF', desc: 'All bookings discount', color: '#d1fae5', border: '#10b981', text: '#065f46' },
    { code: 'WELLNESS15', discount: '15% OFF', desc: 'Wellness checkup discount', color: '#ede9fe', border: '#8b5cf6', text: '#6d28d9' },
  ];

  useEffect(() => {
    getMyBookings()
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const pending = bookings.filter(b => b.bookingStatus?.toLowerCase() === 'pending');
  const completed = bookings.filter(b => b.bookingStatus?.toLowerCase() === 'completed');

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">My Health Dashboard</h2>
        <p className="section-subtitle">Manage your appointments and health journey</p>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: 'bi-calendar-heart-fill', color: '#2563eb', bg: '#dbeafe' },
          { label: 'Upcoming', value: pending.length, icon: 'bi-clock-fill', color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Completed', value: completed.length, icon: 'bi-check-circle-fill', color: '#10b981', bg: '#d1fae5' },
        ].map(c => (
          <div key={c.label} className="col-md-4">
            <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className={`bi ${c.icon}`} style={{ fontSize: 22, color: c.color }}></i>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Sora', color: '#0f172a', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{c.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo codes */}
      <div className="veezta-card p-4 mb-4">
        <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-gift-fill me-2" style={{ color: '#8b5cf6' }}></i>Available Promo Codes
        </h6>
        <div className="row g-3">
          {PROMO_CODES.map(p => (
            <div key={p.code} className="col-md-4">
              <div className="promo-card" style={{ background: p.color, borderColor: p.border }}
                onClick={() => navigator.clipboard.writeText(p.code)}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Sora', color: p.text }}>{p.code}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.text, marginBottom: 4 }}>{p.discount}</div>
                <div style={{ fontSize: 12, color: p.text, opacity: 0.8 }}>{p.desc}</div>
                <div style={{ fontSize: 11, color: p.text, opacity: 0.6, marginTop: 6 }}>
                  <i className="bi bi-clipboard me-1"></i>Click to copy
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="veezta-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 0 }}>
            <i className="bi bi-calendar-check me-2 text-primary"></i>Recent Bookings
          </h6>
          <Link to="/patient/my-bookings" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            View all <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-4" style={{ color: '#94a3b8' }}>
            <i className="bi bi-calendar-x" style={{ fontSize: 40 }}></i>
            <p className="mt-2 mb-0">No bookings yet. <Link to="/patient/find-doctors">Find a doctor</Link></p>
          </div>
        ) : (
          bookings.slice(0, 3).map((b, i) => (
            <div key={i} className="d-flex align-items-center gap-3 mb-3 p-3" style={{ background: '#f8fafc', borderRadius: 12 }}>
              <div className="avatar" style={{ width: 44, height: 44 }}>
                {b.image ? <img src={b.image} alt={b.doctorName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : <span style={{ color: 'white', fontWeight: 700 }}>{b.doctorName[0]}</span>}
              </div>
              <div className="flex-grow-1">
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.doctorName}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{b.specailization} • {b.day} {b.startTime}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Price: {b.finalPrice || b.price}
                  {b.finalPrice && b.finalPrice !== b.price && <span className="ms-1 text-success">(Discounted)</span>}
                </div>
              </div>
              <StatusBadge status={b.bookingStatus} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Find Doctors ─────────────────────────────────────────────────────────────
const PatientFindDoctors: React.FC = () => {
  const [appointments, setAppointments] = useState<IAppointmentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState<{ apt: IAppointmentDTO; dayIdx: number; timeIdx: number; appointmentId: number } | null>(null);
  const [coupon, setCoupon] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const pageSize = 10;

  const load = () => {
    setLoading(true);
    getDoctorAppointments({ pageNumber: page, pageSize, searchTerm: search })
      .then(r => { setAppointments(r.data.appointments); setTotal(r.data.totalCounts); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  const handleBook = async () => {
    if (!bookingModal) return;
    setBookingLoading(true);
    try {
      await bookAppointment({ appointmentId: bookingModal.appointmentId, couponName: coupon || undefined });
      setSuccessMsg('Appointment booked successfully!');
      setBookingModal(null);
      setCoupon('');
    } catch { /* handled */ }
    finally { setBookingLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">Find Doctors</h2>
        <p className="section-subtitle">Browse available doctors and book appointments</p>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2" style={{ borderRadius: 12 }}>
          <i className="bi bi-check-circle-fill"></i>{successMsg}
          <button className="btn-close ms-auto" onClick={() => setSuccessMsg('')}></button>
        </div>
      )}

      <div className="mb-4">
        <div className="input-group" style={{ maxWidth: 380 }}>
          <span className="input-group-text" style={{ background: 'white', borderRight: 'none' }}>
            <i className="bi bi-search text-muted"></i>
          </span>
          <input className="form-control" placeholder="Search by doctor name or specialization..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ borderLeft: 'none' }} />
        </div>
      </div>

      {loading ? <LoadingSpinner text="Finding available doctors..." /> : (
        <div className="row g-3">
          {appointments.length === 0 ? (
            <div className="col-12 text-center py-5" style={{ color: '#94a3b8' }}>
              <i className="bi bi-search" style={{ fontSize: 48 }}></i>
              <p className="mt-2">No doctors found. Try a different search.</p>
            </div>
          ) : appointments.map((apt, i) => (
            <div key={i} className="col-md-6 col-xl-4">
              <div className="doctor-card h-100">
                <div className="p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="avatar" style={{ width: 56, height: 56 }}>
                      <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{apt.doctorName[0]}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, fontFamily: 'Sora' }}>{apt.doctorName}</div>
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill" style={{ fontSize: 11 }}>
                        {apt.specailization}
                      </span>
                    </div>
                  </div>
                  {apt.price && (
                    <div className="mb-3 d-flex align-items-center gap-1">
                      <i className="bi bi-currency-dollar text-success"></i>
                      <span style={{ fontWeight: 600, color: '#10b981', fontSize: 15 }}>${apt.price}</span>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>per visit</span>
                    </div>
                  )}
                  <div>
                    {apt.availableDay?.slice(0, 3).map((day, di) => (
                      <div key={di} className="mb-2">
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                          <i className="bi bi-calendar3 me-1"></i>{day.day}
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {day.timeSlots?.slice(0, 4).map((slot, ti) => (
                            <button key={ti} className="btn btn-sm"
                              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid #2563eb', color: '#2563eb', background: 'transparent' }}
                              onClick={() => setBookingModal({ apt, dayIdx: di, timeIdx: ti, appointmentId: slot.appointmentId })}>
                              {slot.display}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > pageSize && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-outline-secondary rounded-pill" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <i className="bi bi-chevron-left me-1"></i>Previous
          </button>
          <button className="btn btn-outline-secondary rounded-pill" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>
            Next<i className="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 20, border: 'none' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title" style={{ fontFamily: 'Sora', fontWeight: 700 }}>Book Appointment</h5>
                <button className="btn-close" onClick={() => setBookingModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="p-3 mb-4" style={{ background: '#f8fafc', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600 }}>{bookingModal.apt.doctorName}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {bookingModal.apt.specailization} •{' '}
                    {bookingModal.apt.availableDay?.[bookingModal.dayIdx]?.day}{' '}
                    {bookingModal.apt.availableDay?.[bookingModal.dayIdx]?.timeSlots?.[bookingModal.timeIdx]?.display}
                  </div>
                  {bookingModal.apt.price && (
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981', marginTop: 4 }}>
                      ${bookingModal.apt.price}
                    </div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Promo Code (optional)</label>
                  <div className="input-group">
                    <span className="input-group-text" style={{ background: '#f8fafc' }}>
                      <i className="bi bi-tag text-primary"></i>
                    </span>
                    <input className="form-control" placeholder="e.g. FIRST20" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
                  </div>
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {['FIRST20', 'HEALTH10', 'WELLNESS15'].map(c => (
                      <button key={c} type="button" className="btn btn-sm btn-outline-primary rounded-pill"
                        style={{ fontSize: 11 }} onClick={() => setCoupon(c)}>{c}</button>
                    ))}
                  </div>
                </div>
                <div className="d-flex gap-2 justify-content-end">
                  <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setBookingModal(null)}>Cancel</button>
                  <button className="btn btn-primary rounded-pill px-4" onClick={handleBook} disabled={bookingLoading}>
                    {bookingLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>Booking...</> : <><i className="bi bi-calendar-check me-2"></i>Confirm Booking</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── My Bookings ──────────────────────────────────────────────────────────────
const PatientMyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<IPatientBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    getMyBookings().then(r => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (idx: number) => {
    if (!confirm('Cancel this booking?')) return;
    setCancelingId(idx);
    try {
      await cancelBooking(idx);
      load();
    } finally { setCancelingId(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.bookingStatus?.toLowerCase() === filter);

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">My Bookings</h2>
        <p className="section-subtitle">{bookings.length} total bookings</p>
      </div>

      {/* Filter tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'completed', 'canceled'].map(f => (
          <button key={f} className={`btn btn-sm rounded-pill ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
            style={{ textTransform: 'capitalize', fontWeight: 500 }}
            onClick={() => setFilter(f)}>
            {f} {f === 'all' ? `(${bookings.length})` : `(${bookings.filter(b => b.bookingStatus?.toLowerCase() === f).length})`}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="row g-3">
          {filtered.length === 0 ? (
            <div className="col-12 text-center py-5" style={{ color: '#94a3b8' }}>
              <i className="bi bi-calendar-x" style={{ fontSize: 48 }}></i>
              <p className="mt-2">No {filter !== 'all' ? filter : ''} bookings found.</p>
            </div>
          ) : filtered.map((b, i) => (
            <div key={i} className="col-12">
              <div className="veezta-card p-4 d-flex align-items-center gap-4">
                <div className="avatar" style={{ width: 56, height: 56, flexShrink: 0 }}>
                  {b.image ? <img src={b.image} alt={b.doctorName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{b.doctorName[0]}</span>}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{b.doctorName}</span>
                    <StatusBadge status={b.bookingStatus} />
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    <i className="bi bi-hospital me-1"></i>{b.specailization}
                    <span className="mx-2">•</span>
                    <i className="bi bi-calendar3 me-1"></i>{b.day}
                    <span className="mx-2">•</span>
                    <i className="bi bi-clock me-1"></i>{b.startTime} – {b.endTime}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    <span style={{ color: '#94a3b8' }}>Price: </span>
                    <span style={{ fontWeight: 600 }}>{b.finalPrice || b.price}</span>
                    {b.finalPrice && b.finalPrice !== b.price && (
                      <span className="ms-2 text-success" style={{ fontSize: 12 }}>
                        <i className="bi bi-tag-fill me-1"></i>Coupon applied
                      </span>
                    )}
                  </div>
                </div>
                {b.bookingStatus?.toLowerCase() === 'pending' && (
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={() => handleCancel(b.bookingId)}
                    disabled={cancelingId === b.bookingId}
                  >
                    {cancelingId === b.bookingId
                      ? <span className="spinner-border spinner-border-sm"></span>
                      : <><i className="bi bi-x-circle me-1"></i>Cancel</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Patient Dashboard Root ───────────────────────────────────────────────────
const PatientDashboard: React.FC = () => (
  <div>
    <Navbar />
    <div className="dashboard-layout">
      <PatientSidebar />
      <div className="main-content">
        <Routes>
          <Route path="dashboard" element={<PatientOverview />} />
          <Route path="find-doctors" element={<PatientFindDoctors />} />
          <Route path="my-bookings" element={<PatientMyBookings />} />
          <Route path="*" element={<PatientOverview />} />
        </Routes>
      </div>
    </div>
  </div>
);

export default PatientDashboard;
