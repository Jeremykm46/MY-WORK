/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('edutrack_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('edutrack_user');
      localStorage.removeItem('edutrack_token');
      return null;
    }
  });
  const [loading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('edutrack_token');
    if (user && token) connectSocket(token);
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login(email, password);
    const { token, user: apiUser } = data.data;
    localStorage.setItem('edutrack_token', token);
    localStorage.setItem('edutrack_user', JSON.stringify(apiUser));
    setUser(apiUser);
    connectSocket(token);
    return apiUser;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    return data;
  };

  const logout = async () => {
    try { await authAPI.logout(); } catch { /* Ignore logout errors and clear local session. */ }
    disconnectSocket();
    localStorage.removeItem('edutrack_token');
    localStorage.removeItem('edutrack_user');
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await authAPI.updateProfile(updates);
    const updated = { ...user, ...data.data };
    setUser(updated);
    localStorage.setItem('edutrack_user', JSON.stringify(updated));
    return updated;
  };

  const refreshProfile = async () => {
    const { data } = await authAPI.getProfile();
    const fresh = data.data;
    setUser(prev => ({ ...prev, ...fresh }));
    localStorage.setItem('edutrack_user', JSON.stringify({ ...user, ...fresh }));
    return fresh;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
