import { useMemo } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  return useMemo(
    () => ({
      user: store.user,
      isAuthenticated: store.isAuthenticated,
      isLoading: store.isLoading,
      userRole: store.user?.user_type || null,
      login: store.login,
      logout: store.logout,
      register: store.register,
      fetchProfile: store.fetchProfile,
      updateProfile: store.updateProfile,
    }),
    [store],
  );
};
