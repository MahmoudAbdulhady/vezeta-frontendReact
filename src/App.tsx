import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/profile/ProfilePage';

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/profile" element={
          <ProtectedRoute role="Admin">
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Doctor routes */}
        <Route path="/doctor/*" element={
          <ProtectedRoute role="Doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/doctor/profile" element={
          <ProtectedRoute role="Doctor">
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Patient routes */}
        <Route path="/patient/*" element={
          <ProtectedRoute role="Patient">
            <PatientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/patient/profile" element={
          <ProtectedRoute role="Patient">
            <ProfilePage />
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
