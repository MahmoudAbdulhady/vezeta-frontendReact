import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';

const LandingPage: React.FC = () => {
  const { user, role } = useAuth();

  // Redirect logged-in users straight to their dashboard
  if (user && role) {
    return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4ff' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 0 60px' }}>
        <div className="container-xl">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 style={{
                fontFamily: 'Sora, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                color: '#0f172a',
                lineHeight: 1.15,
                marginBottom: 16,
              }}>
                Modern Healthcare<br />
                <span style={{ color: '#2563eb' }}>Booking System</span>
              </h1>
              <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
                Connect with healthcare professionals seamlessly. Book appointments,
                manage your health records, and get the care you deserve.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link
                  to="/register"
                  className="btn btn-primary rounded-pill px-5 py-2"
                  style={{ fontWeight: 600, fontSize: 15 }}
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="btn btn-outline-secondary rounded-pill px-5 py-2"
                  style={{ fontWeight: 600, fontSize: 15 }}
                >
                  Sign In
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div style={{
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 24px 64px rgba(37,99,235,0.15)',
                background: '#cbd5e1',
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <i className="bi bi-hospital" style={{ fontSize: 80 }}></i>
                  <p style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>Healthcare Reception</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Everything You Need ──────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: '#fff' }}>
        <div className="container-xl">
          <div className="text-center mb-5">
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#0f172a' }}>
              Everything You Need
            </h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Comprehensive healthcare management for everyone.</p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: 'bi-calendar2-heart',
                color: '#2563eb',
                bg: '#dbeafe',
                title: 'Easy Booking',
                desc: 'Book appointments with your preferred doctors in just a few clicks. View available time slots and choose what works best for you.',
              },
              {
                icon: 'bi-person-badge',
                color: '#10b981',
                bg: '#d1fae5',
                title: 'Expert Doctors',
                desc: 'Access a wide network of qualified healthcare professionals across multiple specializations to meet your specific needs.',
              },
              {
                icon: 'bi-clock-history',
                color: '#8b5cf6',
                bg: '#ede9fe',
                title: 'Flexible Scheduling',
                desc: 'Manage your appointments efficiently with real-time availability updates and flexible rescheduling options.',
              },
            ].map(f => (
              <div key={f.title} className="col-md-4">
                <div style={{
                  background: '#f8fafc',
                  borderRadius: 16,
                  padding: '28px 24px',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: f.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <i className={`bi ${f.icon}`} style={{ fontSize: 22, color: f.color }}></i>
                  </div>
                  <h5 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    {f.title}
                  </h5>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Designed For Everyone ────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: '#f0f4ff' }}>
        <div className="container-xl">
          <div className="text-center mb-5">
            <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: 28, color: '#0f172a' }}>
              Designed For Everyone
            </h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>
              Tailored experiences for{' '}
              <span style={{ color: '#2563eb', fontWeight: 600 }}>patients</span>,{' '}
              <span style={{ color: '#10b981', fontWeight: 600 }}>doctors</span>, and{' '}
              <span style={{ color: '#8b5cf6', fontWeight: 600 }}>administrators</span>.
            </p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: 'bi-person-heart',
                color: '#2563eb',
                bg: '#dbeafe',
                title: 'Patients',
                bullets: [
                  'Browse doctors by specialization',
                  'Book time slots',
                  'View available doctors',
                  'Access promo codes',
                  'Track appointments',
                ],
              },
              {
                icon: 'bi-clipboard2-pulse',
                color: '#10b981',
                bg: '#d1fae5',
                title: 'Doctors',
                bullets: [
                  'Manage time slots',
                  'View appointments',
                  'Update availability',
                  'Patient management',
                ],
              },
              {
                icon: 'bi-shield-check',
                color: '#8b5cf6',
                bg: '#ede9fe',
                title: 'Administrators',
                bullets: [
                  'Manage doctor accounts',
                  'Manage patient accounts',
                  'System oversight',
                  'User administration',
                ],
              },
            ].map(r => (
              <div key={r.title} className="col-md-4">
                <div style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '28px 24px',
                  border: '1px solid #e2e8f0',
                  height: '100%',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: r.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <i className={`bi ${r.icon}`} style={{ fontSize: 28, color: r.color }}></i>
                  </div>
                  <h5 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                    {r.title}
                  </h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                    {r.bullets.map(b => (
                      <li key={b} style={{ color: '#64748b', fontSize: 14, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="bi bi-check2" style={{ color: r.color, flexShrink: 0 }}></i>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: '64px 0',
        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
        textAlign: 'center',
      }}>
        <div className="container-xl">
          <h2 style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            color: '#fff',
            marginBottom: 12,
          }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15, marginBottom: 28 }}>
            Join thousands of users managing their healthcare seamlessly
          </p>
          <Link
            to="/register"
            className="btn rounded-pill px-5 py-2"
            style={{
              background: '#fff',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
            }}
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
