import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        apiService.setToken(token);
        try {
          const response: any = await apiService.getProfile(); // 👈 typage explicite en any
          const userData: any = response.user; // 👈 idem ici
          setUser({
            id: userData.id?.toString() ?? '',
            name: userData.name ?? '',
            email: userData.email ?? '',
            role: userData.role ?? 'user',
            avatar: userData.avatar,
          });
        } catch (error: any) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    loadUserFromToken();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: any = await apiService.login(email, password);
      const userData: any = response.user;
      setUser({
        id: userData.id?.toString() ?? '',
        name: userData.name ?? '',
        email: userData.email ?? '',
        role: userData.role ?? 'user',
        avatar: userData.avatar,
      });
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response: any = await apiService.register(name, email, password);
      const userData: any = response.user;
      setUser({
        id: userData.id?.toString() ?? '',
        name: userData.name ?? '',
        email: userData.email ?? '',
        role: userData.role ?? 'user',
        avatar: userData.avatar,
      });
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    apiService.setToken(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};