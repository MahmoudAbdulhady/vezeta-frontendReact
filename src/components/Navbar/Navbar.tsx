import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile } from '../../api/patient.api';
import { getDoctorMyProfile } from '../../api/doctor.api';
import { getAdminMyProfile } from '../../api/admin.api';
import { getImageUrl } from '../../api/axiosClient';

const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !role) return;
    const fetchAvatar = () => {
      const fn = role === 'Doctor' ? getDoctorMyProfile : role === 'Admin' ? getAdminMyProfile : getMyProfile;
      fn().then(res => setAvatarUrl(getImageUrl(res.data.imageUrl))).catch(() => {});
    };
    fetchAvatar();
    window.addEventListener('profile-updated', fetchAvatar);
    return () => window.removeEventListener('profile-updated', fetchAvatar);
  }, [user, role]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = role
    ? `/${role.toLowerCase()}/dashboard`
    : '/login';

  const roleColor: Record<string, string> = {
    Admin: 'bg-danger',
    Doctor: 'bg-success',
    Patient: 'bg-primary',
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e9ecef', zIndex: 1050 }}>
      <div className="container-xl">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to={user ? dashboardLink : '/'}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="bi bi-heart-pulse-fill text-white" style={{ fontSize: 18 }}></i>
          </div>
          <span className="fw-700" style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 20, color: '#0f172a', letterSpacing: '-0.3px' }}>
            Veezta
          </span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link fw-500" to={dashboardLink} style={{ color: '#475569', fontWeight: 500 }}>
                    <i className="bi bi-grid-1x2 me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item d-flex align-items-center gap-2 px-3">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar"
                      style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e9ecef' }} />
                  ) : (
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <i className="bi bi-person-fill text-white" style={{ fontSize: 16 }}></i>
                    </div>
                  )}
                  <div className="d-none d-lg-block">
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                      {user.fullName || user.email}
                    </div>
                    <span className={`badge ${roleColor[role!] || 'bg-secondary'} rounded-pill`} style={{ fontSize: 10 }}>
                      {role}
                    </span>
                  </div>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" style={{ color: '#475569', fontWeight: 500 }}>Sign In</Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-primary rounded-pill px-4" to="/register">Get Started</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
