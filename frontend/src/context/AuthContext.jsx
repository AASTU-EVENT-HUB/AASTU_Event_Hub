import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { DEV_MODE, DEV_MOCK_STUDENT, DEV_MOCK_ADMIN } from '../data/mockData';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('aastu_user');
    const storedToken = localStorage.getItem('aastu_token');
    if (stored && storedToken) {
      setUser(JSON.parse(stored));
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Try real API first
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('aastu_user', JSON.stringify(userData));
        localStorage.setItem('aastu_token', userToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
        return { success: true, user: userData };
      } catch {
        // DEV_MODE mock fallback — disabled in production
        if (!DEV_MODE) {
          return { success: false, error: 'Invalid credentials' };
        }
        const mockUser = email.includes('admin') ? DEV_MOCK_ADMIN : DEV_MOCK_STUDENT;
        if (!mockUser) return { success: false, error: 'Invalid credentials' };
        const mockToken = 'mock-token-' + Date.now();
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('aastu_user', JSON.stringify(mockUser));
        localStorage.setItem('aastu_token', mockToken);
        return { success: true, user: mockUser };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (data) => {
    try {
      try {
        const res = await axios.post(`${API_BASE}/auth/register`, data);
        const { user: userData, token: userToken } = res.data;
        const newUser = { ...userData, onboardingComplete: false };
        setUser(newUser);
        setToken(userToken);
        localStorage.setItem('aastu_user', JSON.stringify(newUser));
        localStorage.setItem('aastu_token', userToken);
        return { success: true, user: newUser };
      } catch {
        if (!DEV_MODE) return { success: false, error: 'Registration failed. Please try again.' };
        const newUser = {
          ...(DEV_MOCK_STUDENT || {}),
          ...data,
          id: 'u' + Date.now(),
          onboardingComplete: false,
          role: 'student',
        };
        const mockToken = 'mock-token-' + Date.now();
        setUser(newUser);
        setToken(mockToken);
        localStorage.setItem('aastu_user', JSON.stringify(newUser));
        localStorage.setItem('aastu_token', mockToken);
        return { success: true, user: newUser };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aastu_user');
    localStorage.removeItem('aastu_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('aastu_user', JSON.stringify(updated));
  };

  const completeOnboarding = (interests) => {
    updateUser({ onboardingComplete: true, interests });
  };

  // Used by Google OAuth callback page
  const loginWithToken = (userToken, userData) => {
    const newUser = { ...userData, onboardingComplete: !userData.isFirstLogin };
    setUser(newUser);
    setToken(userToken);
    localStorage.setItem('aastu_user', JSON.stringify(newUser));
    localStorage.setItem('aastu_token', userToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser, completeOnboarding, loginWithToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
