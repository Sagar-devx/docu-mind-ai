import api from './api';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, UserDto } from '../types';

const TOKEN_KEY = 'documind_token';
const USER_KEY = 'documind_user';

export const authService = {
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/api/v1/auth/login', req);
    authService.setToken(data.accessToken);
    authService.setUser(data.user);
    return data;
  },

  register: async (req: RegisterRequest): Promise<UserDto> => {
    const { data } = await api.post<ApiResponse<UserDto>>('/api/v1/auth/register', req);
    return data.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),

  getUser: (): UserDto | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user: UserDto) => localStorage.setItem(USER_KEY, JSON.stringify(user)),

  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};
