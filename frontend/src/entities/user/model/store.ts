import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../../../shared/api/axios';

interface AuthState {
  accessToken: string | null;
  username: string | null;
  plan: string | null;
  setAuth: (accessToken: string, refreshToken: string, username: string, plan: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setPlan: (plan: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      username: null,
      plan: null,
      setAuth: (accessToken, refreshToken, username, plan) => {
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken, username, plan });
      },
      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('refreshToken', refreshToken);
        set({ accessToken });
      },
      setPlan: (plan) => {
        set({ plan });
      },
      logout: async () => {
        try {
          // Import api here to avoid circular dependency if needed, or use the top level one
          await api.post('/auth/logout');
        } catch (e) {
          console.error('Logout failed on backend', e);
        }
        localStorage.removeItem('refreshToken');
        set({ accessToken: null, username: null, plan: null });
      },
    }),
    {
      name: 'auth-storage', // Key for localStorage
      partialize: (state) => ({ username: state.username, plan: state.plan }), // We don't persist functions and accessToken
    }
  )
);
