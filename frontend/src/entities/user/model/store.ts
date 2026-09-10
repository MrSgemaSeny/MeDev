import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BASE_URL } from '../../../shared/api/api';

interface AuthState {
  accessToken: string | null;
  username: string | null;
  plan: string | null;
  role: string | null;
  setAuth: (accessToken: string, refreshToken?: string, username?: string, plan?: string, role?: string) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setPlan: (plan: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      username: null,
      plan: null,
      role: null,
      setAuth: (accessToken, _ignoredRefreshToken, username, plan, role) => {
        set({ accessToken, username, plan, role: role || null });
      },
      setTokens: (accessToken, _ignoredRefreshToken) => {
        set({ accessToken });
      },
      setPlan: (plan) => set({ plan }),
      logout: async () => {
        const token = useAuthStore.getState().accessToken;
        try {
          await fetch(`${BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
        } catch (e) {
          // Backend logout failure should not prevent local session clearance
        } finally {
          set({ accessToken: null, username: null, plan: null, role: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ username: state.username, plan: state.plan, role: state.role }),
    }
  )
);
