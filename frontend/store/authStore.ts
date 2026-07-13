'use client';
/**
 * Auth Store (Zustand)
 * Persists JWT token and user data in localStorage.
 * Hydrates from localStorage on first load.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthStore {
  user:       User | null;
  token:      string | null;
  isLoggedIn: boolean;
  _hasHydrated: boolean;

  setAuth:  (user: User, token: string) => void;
  logout:   () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user:       null,
      token:      null,
      isLoggedIn: false,
      _hasHydrated: false,

      setAuth: (user, token) => {
        localStorage.setItem('voltedge_token', token);
        set({ user, token, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem('voltedge_token');
        localStorage.removeItem('voltedge_user');
        set({ user: null, token: null, isLoggedIn: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name:    'voltedge_auth',
      // Only persist token and user — not derived state
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        if (state) state._hasHydrated = true;
      },
    },
  ),
);
