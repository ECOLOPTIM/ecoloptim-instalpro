import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 AuthContext: Attempting login:', username);
      console.log('📡 AuthContext: API baseURL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', { username, password });
      console.log('✅ AuthContext: Response received:', response.data);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      
      console.log('✅ AuthContext: User set, returning success');
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      console.error('❌ AuthContext: Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Eroare la autentificare' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, message: 'Cont creat cu succes! Te poți autentifica.' };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Eroare la înregistrare' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Navigate will be handled by component
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};