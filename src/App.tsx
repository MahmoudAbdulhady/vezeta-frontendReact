import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientDashboard from './pages/patient/PatientDashboard';

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute role="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Doctor routes */}
        <Route path="/doctor/*" element={
          <ProtectedRoute role="Doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        } />

        {/* Patient routes */}
        <Route path="/patient/*" element={
          <ProtectedRoute role="Patient">
            <PatientDashboard />
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
