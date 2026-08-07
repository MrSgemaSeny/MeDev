import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  username: string | null;
  plan: string | null;
  setAuth: (accessToken: string, refreshToken: string, username: string, plan: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
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
      logout: () => {
        localStorage.removeItem('refreshToken');
        set({ accessToken: null, username: null, plan: null });
      },
    }),
    {
      name: 'auth-storage', // Key for localStorage
      partialize: (state) => ({ accessToken: state.accessToken, username: state.username, plan: state.plan }), // We don't persist functions
    }
  )
);
