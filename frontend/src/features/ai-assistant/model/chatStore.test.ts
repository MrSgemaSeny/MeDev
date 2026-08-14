import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chatStore';

describe('ChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({ initialPrompt: null, isOpen: false });
  });

  it('should have initial state', () => {
    const state = useChatStore.getState();
    expect(state.initialPrompt).toBeNull();
    expect(state.isOpen).toBe(false);
  });

  it('setInitialPrompt should update prompt', () => {
    useChatStore.getState().setInitialPrompt('test prompt');
    expect(useChatStore.getState().initialPrompt).toBe('test prompt');
  });

  it('setIsOpen should update isOpen', () => {
    useChatStore.getState().setIsOpen(true);
    expect(useChatStore.getState().isOpen).toBe(true);
  });

  it('openChatWithPrompt should set prompt and open chat', () => {
    useChatStore.getState().openChatWithPrompt('help me');
    const state = useChatStore.getState();
    expect(state.initialPrompt).toBe('help me');
    expect(state.isOpen).toBe(true);
  });
});
