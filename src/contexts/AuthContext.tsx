import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

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
  const toast = useToast();
  const navigate = useNavigate();

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
      // Merge guest cart if exists
      try {
        const guestRaw = localStorage.getItem('guest_cart');
        const guestItems = guestRaw ? JSON.parse(guestRaw) : [];
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          await apiService.mergeGuestCart(guestItems);
          localStorage.removeItem('guest_cart');
        }
      } catch (err) {
        console.warn('Failed to merge guest cart on login:', err);
      }
      setUser({
        id: userData.id?.toString() ?? '',
        name: userData.name ?? '',
        email: userData.email ?? '',
        role: userData.role ?? 'user',
        avatar: userData.avatar,
      });
      // Show toast
      try {
        toast.showToast('Connexion réussie', {
          label: 'Aller à mon profil',
          onClick: () => navigate('/dashboard?tab=courses')
        });
      } catch (e) {}
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
      // Merge guest cart if exists
      try {
        const guestRaw = localStorage.getItem('guest_cart');
        const guestItems = guestRaw ? JSON.parse(guestRaw) : [];
        if (Array.isArray(guestItems) && guestItems.length > 0) {
          await apiService.mergeGuestCart(guestItems);
          localStorage.removeItem('guest_cart');
        }
      } catch (err) {
        console.warn('Failed to merge guest cart on register:', err);
      }
      setUser({
        id: userData.id?.toString() ?? '',
        name: userData.name ?? '',
        email: userData.email ?? '',
        role: userData.role ?? 'user',
        avatar: userData.avatar,
      });
      try {
        toast.showToast('Inscription réussie', {
          label: 'Aller à mes formations',
          onClick: () => navigate('/dashboard?tab=courses')
        });
      } catch (e) {}
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