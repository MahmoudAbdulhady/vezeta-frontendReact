import React, { createContext, useContext, useState, useCallback } from 'react';
import { setToken } from '../api/axiosClient';
import { doctorLogin } from '../api/doctor.api';
import { patientLogin } from '../api/patient.api';
import { adminLogin } from '../api/admin.api';
import type { ILoginRequest, IUser, UserRole } from '../models';

interface IAuthContext {
  user: IUser | null;
  role: UserRole | null;
  token: string | null;
  login: (credentials: ILoginRequest, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  const login = useCallback(async (credentials: ILoginRequest, selectedRole: UserRole) => {
    let res;
    if (selectedRole === 'Admin') {
      res = await adminLogin(credentials);
    } else if (selectedRole === 'Doctor') {
      res = await doctorLogin(credentials);
    } else {
      res = await patientLogin(credentials);
    }
    const { token: jwt } = res.data;
    setToken(jwt);
    setTokenState(jwt);
    setRole(selectedRole);
    // Decode basic info from JWT payload
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    setUser({
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || '',
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email || credentials.email,
      fullName: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name || '',
      role: selectedRole,
    });
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setRole(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
