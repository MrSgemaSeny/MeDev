import { create } from 'zustand';

export interface MobileNavState {
  isOpen: boolean;
  isDesktopCollapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleDesktopCollapsed: () => void;
  setDesktopCollapsed: (collapsed: boolean) => void;
}

const getInitialDesktopCollapsed = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('medev_sidebar_collapsed') === 'true';
  } catch {
    return false;
  }
};

export const useMobileNavStore = create<MobileNavState>((set) => ({
  isOpen: false,
  isDesktopCollapsed: getInitialDesktopCollapsed(),

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  toggleDesktopCollapsed: () =>
    set((state) => {
      const next = !state.isDesktopCollapsed;
      try {
        localStorage.setItem('medev_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return { isDesktopCollapsed: next };
    }),

  setDesktopCollapsed: (collapsed: boolean) => {
    try {
      localStorage.setItem('medev_sidebar_collapsed', String(collapsed));
    } catch {
      // ignore
    }
    set({ isDesktopCollapsed: collapsed });
  },

  toggle: () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      set((state) => {
        const next = !state.isDesktopCollapsed;
        try {
          localStorage.setItem('medev_sidebar_collapsed', String(next));
        } catch {
          // ignore
        }
        return { isDesktopCollapsed: next };
      });
    } else {
      set((state) => ({ isOpen: !state.isOpen }));
    }
  },
}));
