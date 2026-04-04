import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../models';

interface Props {
  role: UserRole;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ role, children }) => {
  const { token, role: userRole } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (userRole !== role) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;
