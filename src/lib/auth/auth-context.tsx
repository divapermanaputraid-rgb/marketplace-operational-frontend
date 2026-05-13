import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { systemApi } from '@/lib/api/client';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, adminData: Admin) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (newToken: string, adminData: Admin) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setAdmin(adminData);
  };

  const logout = () => {
    // Optional: Call backend logout endpoint
    systemApi.logout().catch(console.error).finally(() => {
      localStorage.removeItem('token');
      setToken(null);
      setAdmin(null);
      window.location.href = '/login';
    });
  };

  const refreshMe = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await systemApi.getMe();
      setAdmin(data.admin as Admin);
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      // Let the API interceptor handle the 401 redirect
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ admin, token, isLoading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
