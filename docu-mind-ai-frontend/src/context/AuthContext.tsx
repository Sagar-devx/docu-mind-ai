import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { UserDto, LoginRequest, RegisterRequest } from '../types';

interface AuthContextType {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (req: LoginRequest) => Promise<void>;
  register: (req: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const saved = authService.getUser();
    const token = authService.getToken();
    if (saved && token) setUser(saved);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (req: LoginRequest) => {
    const res = await authService.login(req);
    setUser(res.user);
  }, []);

  const register = useCallback(async (req: RegisterRequest) => {
    await authService.register(req);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
