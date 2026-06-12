import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '../types/auth';

interface AuthActions {
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false }),

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),

      clearAuth: () =>
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'homelabos-auth-storage',
    }
  )
);
