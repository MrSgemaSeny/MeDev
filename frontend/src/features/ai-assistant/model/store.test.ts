import { describe, it, expect, beforeEach } from 'vitest';
import { useAiChatStore } from './store';

describe('AiChatStore', () => {
  beforeEach(() => {
    useAiChatStore.setState({
      isOpen: false,
      messages: [],
      isLoading: false,
      pendingPrompt: null,
    });
  });

  it('should have initial state', () => {
    const state = useAiChatStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.messages).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.pendingPrompt).toBeNull();
  });

  it('toggleChat should toggle isOpen', () => {
    useAiChatStore.getState().toggleChat();
    expect(useAiChatStore.getState().isOpen).toBe(true);

    useAiChatStore.getState().toggleChat();
    expect(useAiChatStore.getState().isOpen).toBe(false);
  });

  it('openWithPrompt should set isOpen and pendingPrompt', () => {
    useAiChatStore.getState().openWithPrompt('Hello AI');
    const state = useAiChatStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.pendingPrompt).toBe('Hello AI');
  });

  it('clearPendingPrompt should clear pendingPrompt', () => {
    useAiChatStore.setState({ pendingPrompt: 'Hello AI' });
    useAiChatStore.getState().clearPendingPrompt();
    expect(useAiChatStore.getState().pendingPrompt).toBeNull();
  });

  it('addMessage should append a message', () => {
    const msg = { id: '1', role: 'user' as const, content: 'Hi' };
    useAiChatStore.getState().addMessage(msg);
    expect(useAiChatStore.getState().messages).toHaveLength(1);
    expect(useAiChatStore.getState().messages[0]).toEqual(msg);
  });

  it('updateLastMessage should append content to the last message', () => {
    const msg = { id: '1', role: 'assistant' as const, content: 'Hell' };
    useAiChatStore.setState({ messages: [msg] });
    
    useAiChatStore.getState().updateLastMessage('o');
    expect(useAiChatStore.getState().messages[0].content).toBe('Hello');
  });

  it('updateLastMessage should do nothing if no messages', () => {
    useAiChatStore.getState().updateLastMessage('o');
    expect(useAiChatStore.getState().messages).toHaveLength(0);
  });

  it('setLoading should update isLoading', () => {
    useAiChatStore.getState().setLoading(true);
    expect(useAiChatStore.getState().isLoading).toBe(true);
  });

  it('clearChat should empty messages', () => {
    useAiChatStore.setState({ messages: [{ id: '1', role: 'user', content: 'test' }] });
    useAiChatStore.getState().clearChat();
    expect(useAiChatStore.getState().messages).toHaveLength(0);
  });
});
