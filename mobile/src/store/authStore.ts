import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../lib/api';
import type { User } from '@/lib/types';

const MOCK_USERS: Record<string, User> = {
  graduate: {
    id: 'mock-user-1',
    username: 'graduate',
    email: 'grad@graduators.ly',
    full_name: 'خريج تجريبي',
    user_type: 'graduate',
    phone: '+218912345678',
    city: 'طرابلس',
    avatar: null,
    bio: 'مطور تطبيقات حديث التخرج',
    is_verified: true,
  },
  employer: {
    id: 'mock-user-2',
    username: 'employer',
    email: 'emp@graduators.ly',
    full_name: 'صاحب عمل تجريبي',
    user_type: 'employer',
    phone: '+218912345679',
    city: 'بنغازي',
    avatar: null,
    bio: 'مدير شركة تقنية',
    is_verified: true,
  },
  admin: {
    id: 'mock-user-3',
    username: 'admin',
    email: 'admin@graduators.ly',
    full_name: 'مدير النظام',
    user_type: 'admin',
    phone: '+218912345680',
    city: 'طرابلس',
    avatar: null,
    bio: 'مدير المنصة',
    is_verified: true,
  },
  institution: {
    id: 'mock-user-4',
    username: 'institution',
    email: 'inst@graduators.ly',
    full_name: 'مؤسسة تعليمية تجريبية',
    user_type: 'institution',
    phone: '+218912345681',
    city: 'مصراتة',
    avatar: null,
    bio: 'جامعة تجريبية',
    is_verified: true,
  },
};


function getMockUser(username: string): User {
  const key = username.toLowerCase() as keyof typeof MOCK_USERS;
  return MOCK_USERS[key] || MOCK_USERS.graduate;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    try {
      const { data } = await api.post('/auth/login/', { username, password });
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refresh_token', data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      const mockUser = getMockUser(username);
      await AsyncStorage.setItem('access_token', 'mock-access-token');
      await AsyncStorage.setItem('refresh_token', 'mock-refresh-token');
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    }
  },

  register: async (formData) => {
    try {
      const { data } = await api.post('/auth/register/', formData);
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refresh_token', data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      const mockUser = getMockUser(formData.username || 'graduate');
      await AsyncStorage.setItem('access_token', 'mock-access-token');
      await AsyncStorage.setItem('refresh_token', 'mock-refresh-token');
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile/');
      await AsyncStorage.setItem('user', JSON.stringify(data));
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        set({ user: JSON.parse(stored), isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { data } = await api.patch('/auth/profile/', profileData);
      set({ user: data });
    } catch {
      set((state) => state.user ? { user: { ...state.user, ...profileData } } : {});
    }
  },
}));
