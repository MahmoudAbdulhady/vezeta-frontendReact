import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getMyAppointments, addAppointment, deleteAppointment, confirmCheckup, getMySchedule } from '../../api/doctor.api';
import { getImageUrl } from '../../api/axiosClient';
import type { IDoctorBookingDTO, IDoctorScheduleSlotDTO } from '../../models';

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const DoctorSidebar: React.FC = () => {
  const loc = useLocation();
  const links = [
    { to: '/doctor/dashboard', icon: 'bi-grid-1x2', label: 'Overview' },
    { to: '/doctor/appointments', icon: 'bi-calendar-check', label: 'My Appointments' },
    { to: '/doctor/schedule', icon: 'bi-clock-history', label: 'Manage Schedule' },
    { to: '/doctor/profile', icon: 'bi-person-circle', label: 'My Profile' },
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
const DoctorOverview: React.FC = () => {
  const [bookings, setBookings] = useState<IDoctorBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAppointments({ pageNumber: 1, pageSize: 100 })
      .then(r => setBookings(r.data.appointments))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading your dashboard..." />;

  const todayName = WEEK_DAYS[new Date().getDay()];
  const today = bookings.filter(b => b.day === todayName);

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">Doctor Dashboard</h2>
        <p className="section-subtitle">Your schedule and patient overview</p>
      </div>
      <div className="row g-3 mb-4">
        {[
          { label: "Today's Appointments", value: today.length, icon: 'bi-calendar-day-fill', color: '#2563eb', bg: '#dbeafe' },
          { label: 'Total Appointments', value: bookings.length, icon: 'bi-calendar-check-fill', color: '#10b981', bg: '#d1fae5' },
          { label: 'Upcoming Patients', value: bookings.length, icon: 'bi-people-fill', color: '#f59e0b', bg: '#fef3c7' },
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

      {/* Today's patients */}
      <div className="veezta-card p-4">
        <h6 style={{ fontFamily: 'Sora', fontWeight: 600, marginBottom: 16 }}>
          <i className="bi bi-calendar-day me-2 text-primary"></i>Today's Appointments
        </h6>
        {today.length === 0 ? (
          <div className="text-center py-4" style={{ color: '#94a3b8' }}>
            <i className="bi bi-calendar-x" style={{ fontSize: 40 }}></i>
            <p className="mt-2 mb-0">No appointments today</p>
          </div>
        ) : (
          <div className="row g-3">
            {today.map((b, i) => (
              <div key={i} className="col-md-6">
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 44, height: 44 }}>
                    {b.image ? <img src={getImageUrl(b.image)!} alt={b.patientName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      : <span style={{ color: 'white', fontWeight: 700 }}>{b.patientName[0]}</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.patientName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{b.startTime} – {b.endTime}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Age: {b.age} • {b.phoneNumber}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── All Appointments ─────────────────────────────────────────────────────────
const DoctorAppointments: React.FC = () => {
  const [bookings, setBookings] = useState<IDoctorBookingDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const pageSize = 10;

  const load = () => {
    setLoading(true);
    getMyAppointments({ pageNumber: page, pageSize })
      .then(r => { setBookings(r.data.appointments); setTotal(r.data.totalCounts); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleConfirm = async (bookingId: number) => {
    setConfirmingId(bookingId);
    try {
      await confirmCheckup(bookingId);
      load();
    } catch {
      // silently reload so the latest status is always shown
      load();
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">My Appointments</h2>
        <p className="section-subtitle">{total} patient bookings</p>
      </div>
      <div className="veezta-card p-4">
        {loading ? <LoadingSpinner /> : (
          <div className="table-responsive">
            <table className="table veezta-table mb-0">
              <thead><tr><th>Patient</th><th>Day</th><th>Time</th><th>Phone</th><th>Age</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {bookings.length === 0
                  ? <tr><td colSpan={7} className="text-center py-4 text-muted">No appointments yet.</td></tr>
                  : bookings.map((b, i) => {
                    const status = b.bookingStatus?.toLowerCase();
                    const isPending = status === 'pending';
                    const statusClass = status === 'completed' ? 'bg-success' : status === 'canceled' ? 'bg-secondary' : 'bg-warning text-dark';
                    return (
                      <tr key={i}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar" style={{ width: 38, height: 38 }}>
                              {b.image ? <img src={getImageUrl(b.image)!} alt={b.patientName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                : <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{b.patientName[0]}</span>}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{b.patientName}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13 }}>{b.day}</td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{b.startTime} – {b.endTime}</td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{b.phoneNumber}</td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{b.age}</td>
                        <td>
                          <span className={`badge rounded-pill ${statusClass}`} style={{ fontSize: 11 }}>
                            {b.bookingStatus ?? 'Unknown'}
                          </span>
                        </td>
                        <td>
                          {isPending && (
                            <button
                              className="btn btn-sm btn-outline-success rounded-pill"
                              onClick={() => handleConfirm(b.bookingId)}
                              disabled={confirmingId === b.bookingId}
                            >
                              {confirmingId === b.bookingId
                                ? <span className="spinner-border spinner-border-sm"></span>
                                : <><i className="bi bi-check-circle me-1"></i>Complete</>}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
        {total > pageSize && (
          <div className="d-flex align-items-center justify-content-between mt-3">
            <span style={{ fontSize: 13, color: '#64748b' }}>Showing page {page}</span>
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

const DAY_LABEL: Record<string, string> = {
  '0': 'Unknown', '1': 'Saturday', '2': 'Sunday', '3': 'Monday', '4': 'Tuesday',
  '5': 'Wednesday', '6': 'Thursday', '7': 'Friday',
  'Saturaday': 'Saturday', 'Saturday': 'Saturday', 'Sunday': 'Sunday',
  'Monday': 'Monday', 'Tuesday': 'Tuesday', 'Wednesday': 'Wednesday',
  'Thursday': 'Thursday', 'Friday': 'Friday',
};

// ─── Manage Schedule ──────────────────────────────────────────────────────────
const DoctorSchedule: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [price, setPrice] = useState(0);
  const [slots, setSlots] = useState([{ day: 1, startTime: '', endTime: '' }]);
  const [schedule, setSchedule] = useState<IDoctorScheduleSlotDTO[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const loadSchedule = () => {
    setLoadingSchedule(true);
    getMySchedule()
      .then(r => setSchedule(r.data))
      .catch(() => setSchedule([]))
      .finally(() => setLoadingSchedule(false));
  };

  useEffect(() => { loadSchedule(); }, []);

  const addSlot = () => setSlots(s => [...s, { day: 1, startTime: '', endTime: '' }]);
  const removeSlot = (i: number) => setSlots(s => s.filter((_, idx) => idx !== i));
  const updateSlot = (i: number, field: string, value: string | number) =>
    setSlots(s => s.map((sl, idx) => idx === i ? { ...sl, [field]: value } : sl));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const grouped: Record<number, { startTime: string; endTime: string }[]> = {};
      slots.forEach(s => {
        if (!grouped[s.day]) grouped[s.day] = [];
        grouped[s.day].push({ startTime: s.startTime, endTime: s.endTime });
      });
      await addAppointment({
        doctorId: 0,
        price,
        dayAppointments: Object.entries(grouped).map(([day, times]) => ({
          day: Number(day),
          timeDTOs: times,
        })),
      });
      setSuccess('Appointment slots added successfully!');
      setShowModal(false);
      setSlots([{ day: 1, startTime: '', endTime: '' }]);
      loadSchedule();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data || 'Failed to save slots.');
    } finally { setLoading(false); }
  };

  const handleDelete = async (appointmentId: number) => {
    try {
      await deleteAppointment(appointmentId);
      setSchedule(s => s.filter(sl => sl.appointmentId !== appointmentId));
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.response?.data || 'Could not delete slot.');
    }
  };

  const DAYS = ['', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h2 className="section-title">Manage Schedule</h2>
          <p className="section-subtitle">Add and manage your available appointment slots</p>
        </div>
        <button className="btn btn-primary rounded-pill px-4" onClick={() => { setError(''); setShowModal(true); }}>
          <i className="bi bi-plus-lg me-2"></i>Add Slots
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
          <i className="bi bi-exclamation-circle-fill"></i>{error}
          <button className="btn-close ms-auto" onClick={() => setError('')}></button>
        </div>
      )}

      {loadingSchedule ? <LoadingSpinner /> : schedule.length === 0 ? (
        <div className="veezta-card p-4 text-center" style={{ color: '#94a3b8' }}>
          <i className="bi bi-clock-history" style={{ fontSize: 48 }}></i>
          <p className="mt-3">No slots yet. Use the button above to add available time slots.</p>
        </div>
      ) : (
        <div className="veezta-card p-0" style={{ overflow: 'hidden' }}>
          <table className="table table-hover mb-0">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: '#64748b', fontSize: 13 }}>Day</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: '#64748b', fontSize: 13 }}>Time</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: '#64748b', fontSize: 13 }}>Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, color: '#64748b', fontSize: 13 }}></th>
              </tr>
            </thead>
            <tbody>
              {schedule.map(slot => (
                <tr key={slot.appointmentId}>
                  <td style={{ padding: '14px 20px', fontWeight: 500 }}>{DAY_LABEL[String(slot.day)] ?? slot.day}</td>
                  <td style={{ padding: '14px 20px', color: '#475569' }}>{slot.startTime} – {slot.endTime}</td>
                  <td style={{ padding: '14px 20px' }}>
                    {slot.isBooked
                      ? <span className="badge bg-warning text-dark rounded-pill">Booked</span>
                      : <span className="badge bg-success rounded-pill">Available</span>}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {!slot.isBooked && (
                      <button className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() => handleDelete(slot.appointmentId)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{ borderRadius: 20, border: 'none' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title" style={{ fontFamily: 'Sora', fontWeight: 700 }}>Add Appointment Slots</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-12">
                      <label className="form-label">Price per slot ($)</label>
                      <input type="number" className="form-control" required value={price || ''}
                        onChange={e => setPrice(Number(e.target.value))} placeholder="e.g. 100" />
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <label className="form-label mb-0">Time Slots</label>
                      <button type="button" className="btn btn-sm btn-outline-primary rounded-pill" onClick={addSlot}>
                        <i className="bi bi-plus me-1"></i>Add Slot
                      </button>
                    </div>
                    {slots.map((s, i) => (
                      <div key={i} className="d-flex gap-2 mb-2 align-items-center">
                        <select className="form-select" style={{ width: 150, flexShrink: 0 }} value={s.day}
                          onChange={e => updateSlot(i, 'day', Number(e.target.value))}>
                          {DAYS.slice(1).map((d, di) => <option key={di + 1} value={di + 1}>{d}</option>)}
                        </select>
                        <input type="time" className="form-control" required value={s.startTime}
                          onChange={e => updateSlot(i, 'startTime', e.target.value)} />
                        <span style={{ color: '#94a3b8' }}>–</span>
                        <input type="time" className="form-control" required value={s.endTime}
                          onChange={e => updateSlot(i, 'endTime', e.target.value)} />
                        {slots.length > 1 && (
                          <button type="button" className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8, flexShrink: 0 }} onClick={() => removeSlot(i)}>
                            <i className="bi bi-trash3"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {error && <div className="alert alert-danger py-2" style={{ fontSize: 13, borderRadius: 8 }}>{error}</div>}

                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={loading}>
                      {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : 'Save Slots'}
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

// ─── Doctor Dashboard Root ────────────────────────────────────────────────────
const DoctorDashboard: React.FC = () => (
  <div>
    <Navbar />
    <div className="dashboard-layout">
      <DoctorSidebar />
      <div className="main-content">
        <Routes>
          <Route path="dashboard" element={<DoctorOverview />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="*" element={<DoctorOverview />} />
        </Routes>
      </div>
    </div>
  </div>
);

export default DoctorDashboard;
