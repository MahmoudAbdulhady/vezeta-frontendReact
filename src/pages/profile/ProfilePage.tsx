import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../../api/patient.api';
import { getDoctorMyProfile, updateDoctorMyProfile } from '../../api/doctor.api';
import { getAdminMyProfile, updateAdminMyProfile } from '../../api/admin.api';
import { getImageUrl } from '../../api/axiosClient';
import { getMyBookings } from '../../api/patient.api';
import { getMyAppointments } from '../../api/doctor.api';
import type { IProfileDTO, IUpdateProfileDTO, IPatientBookingDTO, IDoctorBookingDTO } from '../../models';

type Tab = 'profile' | 'bookings' | 'appointments' | 'security';

// ─── Status Badge (reused from PatientDashboard) ─────────────────────────────
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

const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<IProfileDTO | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Edit form state
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', gender: 0, dateOfBirth: '', imageUrl: null as File | null });

  // Bookings (patient)
  const [bookings, setBookings] = useState<IPatientBookingDTO[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Appointments (doctor)
  const [appointments, setAppointments] = useState<IDoctorBookingDTO[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);

  // ── Load profile on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res;
        if (role === 'Patient') res = await getMyProfile();
        else if (role === 'Doctor') res = await getDoctorMyProfile();
        else res = await getAdminMyProfile();
        setProfile(res.data);
        // Pre-fill edit form
        const [fn, ...rest] = (res.data.fullName || '').split(' ');
        setForm({
          firstName: fn || '',
          lastName: rest.join(' ') || '',
          phoneNumber: res.data.phoneNumber || '',
          gender: res.data.gender?.toLowerCase() === 'female' ? 0 : 1,
          dateOfBirth: res.data.dateOfBirth || '',
          imageUrl: null,
        });
      } catch {
        // profile load failed — stay on page with empty state
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [role]);

  // ── Load bookings tab (patient) ────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'bookings' && role === 'Patient' && bookings.length === 0) {
      setLoadingBookings(true);
      getMyBookings()
        .then(r => setBookings(r.data))
        .finally(() => setLoadingBookings(false));
    }
  }, [activeTab, role]);

  // ── Load appointments tab (doctor) ────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'appointments' && role === 'Doctor' && appointments.length === 0) {
      setLoadingAppts(true);
      getMyAppointments({ pageNumber: 1, pageSize: 50 })
        .then(r => setAppointments(r.data.appointments))
        .finally(() => setLoadingAppts(false));
    }
  }, [activeTab, role]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    const dto: IUpdateProfileDTO = { ...form };
    try {
      if (role === 'Patient') await updateMyProfile(dto);
      else if (role === 'Doctor') await updateDoctorMyProfile(dto);
      else await updateAdminMyProfile(dto);
      // Refresh profile
      let res;
      if (role === 'Patient') res = await getMyProfile();
      else if (role === 'Doctor') res = await getDoctorMyProfile();
      else res = await getAdminMyProfile();
      setProfile(res.data);
      setEditMode(false);
      window.dispatchEvent(new CustomEvent('profile-updated'));
    } catch (e: any) {
      const data = e?.response?.data;
      if (typeof data === 'string') setSaveError(data);
      else if (data?.errors) setSaveError(Object.values(data.errors).flat().join(' '));
      else if (data?.message) setSaveError(data.message);
      else setSaveError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    ...(role === 'Patient' ? [{ key: 'bookings' as Tab, label: 'Bookings' }] : []),
    ...(role === 'Doctor' ? [{ key: 'appointments' as Tab, label: 'Appointments' }] : []),
    { key: 'security', label: 'Security' },
  ];

  const roleColor: Record<string, string> = {
    Admin: '#ef4444',
    Doctor: '#10b981',
    Patient: '#2563eb',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <Navbar />

      <div className="container-xl py-5">
        {/* Page header */}
        <div className="mb-4">
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 32, color: '#0f172a', marginBottom: 6 }}>
            My Profile
          </h2>
          <p style={{ color: '#64748b', fontSize: 15 }}>Manage your account settings and view booking history</p>
        </div>

        {/* Tab navigation */}
        <div style={{
          display: 'flex',
          background: '#e2e8f0',
          borderRadius: 50,
          padding: 4,
          marginBottom: 32,
          width: 'fit-content',
          gap: 4,
        }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '10px 28px',
                borderRadius: 50,
                border: 'none',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === t.key ? '#fff' : 'transparent',
                color: activeTab === t.key ? '#0f172a' : '#64748b',
                boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Tab ──────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px' }}>
            <div className="mb-4">
              <h5 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Profile Information
              </h5>
              <p style={{ color: '#2563eb', fontSize: 14, margin: 0 }}>
                Update your personal information and profile picture
              </p>
            </div>

            {loadingProfile ? (
              <LoadingSpinner text="Loading profile..." />
            ) : (
              <>
                {/* Avatar + name */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                  }}>
                    {getImageUrl(profile?.imageUrl) ? (
                      <img src={getImageUrl(profile?.imageUrl)!} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person-fill text-white" style={{ fontSize: 36 }}></i>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{profile?.fullName}</div>
                    <div style={{ color: roleColor[role!] || '#64748b', fontSize: 14, fontWeight: 500 }}>{role}</div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                      Full Name
                    </label>
                    {editMode ? (
                      <div className="row g-2">
                        <div className="col-6">
                          <input
                            className="form-control"
                            placeholder="First name"
                            value={form.firstName}
                            onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                            style={{ borderRadius: 10 }}
                          />
                        </div>
                        <div className="col-6">
                          <input
                            className="form-control"
                            placeholder="Last name"
                            value={form.lastName}
                            onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                            style={{ borderRadius: 10 }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', color: '#374151', fontSize: 14 }}>
                        {profile?.fullName || '—'}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                      Email
                    </label>
                    <div style={{ padding: '10px 14px', background: '#f1f5f9', borderRadius: 10, border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 14 }}>
                      {profile?.email || '—'}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                      Phone Number
                    </label>
                    {editMode ? (
                      <input
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={form.phoneNumber}
                        onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                        style={{ borderRadius: 10 }}
                      />
                    ) : (
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', color: '#374151', fontSize: 14 }}>
                        {profile?.phoneNumber || '—'}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                      Gender
                    </label>
                    {editMode ? (
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={e => setForm(f => ({ ...f, gender: Number(e.target.value) }))}
                        style={{ borderRadius: 10 }}
                      >
                        <option value={1}>Male</option>
                        <option value={0}>Female</option>
                      </select>
                    ) : (
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', color: '#374151', fontSize: 14 }}>
                        {profile?.gender || '—'}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                      Date of Birth
                    </label>
                    {editMode ? (
                      <input
                        type="date"
                        className="form-control"
                        value={form.dateOfBirth}
                        onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                        style={{ borderRadius: 10 }}
                      />
                    ) : (
                      <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', color: '#374151', fontSize: 14 }}>
                        {profile?.dateOfBirth || '—'}
                      </div>
                    )}
                  </div>

                  {editMode && (
                    <div className="col-md-6">
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                        Profile Picture
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={e => setForm(f => ({ ...f, imageUrl: e.target.files?.[0] ?? null }))}
                        style={{ borderRadius: 10 }}
                      />
                    </div>
                  )}
                </div>

                {saveError && (
                  <div className="alert alert-danger mt-3 rounded-3" style={{ fontSize: 13 }}>{saveError}</div>
                )}

                <div className="mt-4 d-flex gap-2">
                  {editMode ? (
                    <>
                      <button
                        className="btn rounded-pill px-4"
                        style={{ background: '#0f172a', color: '#fff', fontWeight: 600 }}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        ) : (
                          <><i className="bi bi-check2 me-2"></i>Save Changes</>
                        )}
                      </button>
                      <button
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => { setEditMode(false); setSaveError(''); }}
                        disabled={saving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn rounded-pill px-4"
                      style={{ background: '#0f172a', color: '#fff', fontWeight: 600 }}
                      onClick={() => setEditMode(true)}
                    >
                      <i className="bi bi-person-gear me-2"></i>Edit Profile
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Bookings Tab (Patient) ────────────────────────────────── */}
        {activeTab === 'bookings' && role === 'Patient' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px' }}>
            <h5 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
              My Bookings
            </h5>
            {loadingBookings ? (
              <LoadingSpinner text="Loading bookings..." />
            ) : bookings.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x" style={{ fontSize: 48, color: '#cbd5e1' }}></i>
                <p style={{ color: '#94a3b8', marginTop: 12 }}>No bookings found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Doctor</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Specialization</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Day</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Time</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Price</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>{b.doctorName}</td>
                        <td style={{ fontSize: 14, color: '#64748b' }}>{b.specailization}</td>
                        <td style={{ fontSize: 14 }}>{b.day}</td>
                        <td style={{ fontSize: 14 }}>{b.startTime} – {b.endTime}</td>
                        <td style={{ fontSize: 14 }}>${b.finalPrice || b.price}</td>
                        <td><StatusBadge status={b.bookingStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Appointments Tab (Doctor) ─────────────────────────────── */}
        {activeTab === 'appointments' && role === 'Doctor' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px' }}>
            <h5 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
              My Appointments
            </h5>
            {loadingAppts ? (
              <LoadingSpinner text="Loading appointments..." />
            ) : appointments.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-calendar-x" style={{ fontSize: 48, color: '#cbd5e1' }}></i>
                <p style={{ color: '#94a3b8', marginTop: 12 }}>No appointments found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Patient</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Day</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Time</th>
                      <th style={{ fontWeight: 600, fontSize: 13, color: '#64748b' }}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>{a.patientName}</td>
                        <td style={{ fontSize: 14 }}>{a.day}</td>
                        <td style={{ fontSize: 14 }}>{a.startTime} – {a.endTime}</td>
                        <td style={{ fontSize: 14, color: '#64748b' }}>{a.phoneNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Security Tab ─────────────────────────────────────────── */}
        {activeTab === 'security' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '32px' }}>
            <div className="mb-4">
              <h5 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                Security Settings
              </h5>
              <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Change your password</p>
            </div>
            <div className="row g-3" style={{ maxWidth: 480 }}>
              <div className="col-12">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                  Current Password
                </label>
                <input type="password" className="form-control" placeholder="Enter current password" disabled style={{ borderRadius: 10, background: '#f8fafc' }} />
              </div>
              <div className="col-12">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                  New Password
                </label>
                <input type="password" className="form-control" placeholder="Enter new password" disabled style={{ borderRadius: 10, background: '#f8fafc' }} />
              </div>
              <div className="col-12">
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, display: 'block' }}>
                  Confirm New Password
                </label>
                <input type="password" className="form-control" placeholder="Confirm new password" disabled style={{ borderRadius: 10, background: '#f8fafc' }} />
              </div>
              <div className="col-12 mt-2">
                <button className="btn rounded-pill px-4" style={{ background: '#0f172a', color: '#fff', fontWeight: 600 }} disabled>
                  <i className="bi bi-lock me-2"></i>Update Password
                  <span className="badge bg-secondary ms-2" style={{ fontSize: 10 }}>Coming soon</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
