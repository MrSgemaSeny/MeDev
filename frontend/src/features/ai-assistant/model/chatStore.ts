import { create } from 'zustand';

interface ChatState {
  initialPrompt: string | null;
  setInitialPrompt: (prompt: string | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openChatWithPrompt: (prompt: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  initialPrompt: null,
  setInitialPrompt: (prompt) => set({ initialPrompt: prompt }),
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  openChatWithPrompt: (prompt) => set({ initialPrompt: prompt, isOpen: true }),
}));
