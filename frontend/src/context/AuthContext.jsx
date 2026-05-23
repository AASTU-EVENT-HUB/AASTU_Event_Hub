import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { DEV_MODE, DEV_MOCK_STUDENT, DEV_MOCK_ADMIN } from '../data/mockData';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('aastu_user');
    const storedToken = localStorage.getItem('aastu_token');
    if (stored && storedToken) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        // Corrupted storage — clear it
        localStorage.removeItem('aastu_user');
        localStorage.removeItem('aastu_token');
      }
    }
    setLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      console.log('[Auth] Attempting login for:', email);
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      console.log('[Auth] Login response:', res.data);

      const { user: userData, token: userToken } = res.data;

      // Ensure onboardingComplete is set (backend sends it, but guard here too)
      const enrichedUser = {
        ...userData,
        onboardingComplete: userData.onboardingComplete ?? !userData.isFirstLogin,
      };

      setUser(enrichedUser);
      setToken(userToken);
      localStorage.setItem('aastu_user', JSON.stringify(enrichedUser));
      localStorage.setItem('aastu_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      return { success: true, user: enrichedUser };
    } catch (err) {
      console.error('[Auth] Login error:', err.response?.data || err.message);

      // DEV_MODE mock fallback — only when real API is unreachable
      if (DEV_MODE && !err.response) {
        console.warn('[Auth] DEV_MODE: falling back to mock user');
        const mockUser = email.includes('admin') ? DEV_MOCK_ADMIN : DEV_MOCK_STUDENT;
        if (!mockUser) return { success: false, error: 'Invalid credentials' };
        const mockToken = 'mock-token-' + Date.now();
        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem('aastu_user', JSON.stringify(mockUser));
        localStorage.setItem('aastu_token', mockToken);
        return { success: true, user: mockUser };
      }

      const errorMessage =
        err.response?.data?.message ||
        (err.response ? 'Invalid email or password' : 'Cannot connect to server. Please try again.');

      return { success: false, error: errorMessage };
    }
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = async (data) => {
    try {
      console.log('[Auth] Attempting registration for:', data.email);
      const res = await axios.post(`${API_BASE}/auth/register`, data);
      console.log('[Auth] Register response:', res.data);

      const { user: userData, token: userToken } = res.data;
      const newUser = {
        ...userData,
        onboardingComplete: false,
      };

      setUser(newUser);
      setToken(userToken);
      localStorage.setItem('aastu_user', JSON.stringify(newUser));
      localStorage.setItem('aastu_token', userToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;

      return { success: true, user: newUser };
    } catch (err) {
      console.error('[Auth] Register error:', err.response?.data || err.message);

      // DEV_MODE mock fallback — only when real API is unreachable
      if (DEV_MODE && !err.response) {
        console.warn('[Auth] DEV_MODE: falling back to mock registration');
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

      const errorMessage =
        err.response?.data?.message ||
        (err.response ? 'Registration failed. Please check your details.' : 'Cannot connect to server. Please try again.');

      return { success: false, error: errorMessage };
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aastu_user');
    localStorage.removeItem('aastu_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // ── Update user ────────────────────────────────────────────────────────────
  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('aastu_user', JSON.stringify(updated));
  };

  const completeOnboarding = (interests) => {
    updateUser({ onboardingComplete: true, isFirstLogin: false, interests });
  };

  // ── Google OAuth callback ──────────────────────────────────────────────────
  const loginWithToken = (userToken, userData) => {
    const newUser = {
      ...userData,
      onboardingComplete: !userData.isFirstLogin,
    };
    setUser(newUser);
    setToken(userToken);
    localStorage.setItem('aastu_user', JSON.stringify(newUser));
    localStorage.setItem('aastu_token', userToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, updateUser, completeOnboarding, loginWithToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
