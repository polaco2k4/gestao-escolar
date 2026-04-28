import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../config/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  school_id?: string;
  school_name?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadUserProfile();
    }
    setIsLoading(false);
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.data || response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.school_id) {
        localStorage.setItem('school_id', userData.school_id);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      if (userData.school_id) {
        localStorage.setItem('school_id', userData.school_id);
      }
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('school_id');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
