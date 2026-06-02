import { create } from 'zustand'
import { User } from '@/lib/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    localStorage.setItem('user', JSON.stringify(data.user))
    set({ user: data.user, isAuthenticated: true })
  },

  register: async (formData) => {
    const { data } = await api.post('/auth/register/', formData)
    return data
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    set({ user: null, isAuthenticated: false })
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile/')
      localStorage.setItem('user', JSON.stringify(data))
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  updateProfile: async (profileData) => {
    const { data } = await api.patch('/auth/profile/', profileData)
    set({ user: data })
  },
}))
