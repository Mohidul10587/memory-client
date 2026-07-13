'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data as User);
      }
    } catch (err: unknown) {
      // On 401 / session failure just clear local state — do NOT redirect here.
      // The fetchWithAuth interceptor handles redirects for protected page calls,
      // but during initial auth check we only want to silently clear the session.
      const status = (err as { status?: number })?.status;
      if (status === 401 || !status) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (phone: string, password: string): Promise<User> => {
    // Clear any stale tokens before attempting login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    const res = await authApi.login(phone, password);
    if (res.success && res.data) {
      const data = res.data as { user: User; accessToken: string; refreshToken: string };
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      return data.user;
    }
    throw new Error('লগইন ব্যর্থ হয়েছে');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken') || '';
    try {
      await authApi.logout(refreshToken);
    } catch {
      // ignore errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
