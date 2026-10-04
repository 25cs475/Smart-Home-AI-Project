import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('smarthome_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smarthome_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smarthome_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.user);
          localStorage.setItem('smarthome_user', JSON.stringify(res.user));
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('smarthome_token', res.token);
    localStorage.setItem('smarthome_user', JSON.stringify(res.user));
  };

  const register = async (email: string, password: string, name: string, role?: string) => {
    const res = await authService.register({ email, password, name, role });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('smarthome_token', res.token);
    localStorage.setItem('smarthome_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smarthome_token');
    localStorage.removeItem('smarthome_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
