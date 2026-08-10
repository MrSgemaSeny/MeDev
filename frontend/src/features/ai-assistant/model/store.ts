import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AiChatState {
  isOpen: boolean;
  messages: Message[];
  isLoading: boolean;
  
  toggleChat: () => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useAiChatStore = create<AiChatState>((set) => ({
  isOpen: false,
  messages: [],
  isLoading: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) => set((state) => {
    const newMessages = [...state.messages];
    if (newMessages.length > 0) {
      const last = newMessages[newMessages.length - 1];
      newMessages[newMessages.length - 1] = { ...last, content: last.content + content };
    }
    return { messages: newMessages };
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearChat: () => set({ messages: [] }),
}));
