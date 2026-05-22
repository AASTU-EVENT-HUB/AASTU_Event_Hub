import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Mock data for development
const MOCK_STUDENT = {
  id: 'u1',
  name: 'Selam Balcha',
  email: 'selam@aastu.edu.et',
  studentId: 'AAU-2021-CS-042',
  department: 'Computer Science & AI',
  role: 'student',
  avatar: null,
  bio: 'Passionate about algorithmic efficiency and decentralized systems.',
  interests: ['Tech', 'Hackathons', 'Workshops'],
  onboardingComplete: true,
  eventCredits: 1240,
  gpa: 3.85,
};

const MOCK_ADMIN = {
  id: 'a1',
  name: 'Mekdes A.',
  email: 'admin@aastu.edu.et',
  role: 'admin',
  avatar: null,
  department: 'Administration',
};

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
      // Try real API first, fall back to mock
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
        // Mock login for development
        const mockUser = email.includes('admin') ? MOCK_ADMIN : MOCK_STUDENT;
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
        setUser({ ...userData, onboardingComplete: false });
        setToken(userToken);
        localStorage.setItem('aastu_user', JSON.stringify({ ...userData, onboardingComplete: false }));
        localStorage.setItem('aastu_token', userToken);
        return { success: true, user: userData };
      } catch {
        const newUser = { ...MOCK_STUDENT, ...data, id: 'u' + Date.now(), onboardingComplete: false };
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

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
