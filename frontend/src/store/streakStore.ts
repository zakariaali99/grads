import { create } from 'zustand'
import { streakService } from '@/lib/api-services'

interface StreakState {
  currentStreak: number
  longestStreak: number
  totalActivities: number
  lastActive: string | null
  todayActive: boolean
  isLoading: boolean
  error: string | null
  fetchStreak: () => Promise<void>
}

export const useStreakStore = create<StreakState>((set) => ({
  currentStreak: 0,
  longestStreak: 0,
  totalActivities: 0,
  lastActive: null,
  todayActive: false,
  isLoading: false,
  error: null,

  fetchStreak: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await streakService.getMyStreak()
      set({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        totalActivities: data.total_activities,
        lastActive: data.last_active,
        todayActive: data.today_active,
        isLoading: false,
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },
}))
