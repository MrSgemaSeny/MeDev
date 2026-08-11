import { create } from 'zustand';

interface UpsellState {
  isOpen: boolean;
  openUpsell: () => void;
  closeUpsell: () => void;
}

export const useUpsellStore = create<UpsellState>((set) => ({
  isOpen: false,
  openUpsell: () => set({ isOpen: true }),
  closeUpsell: () => set({ isOpen: false }),
}));
