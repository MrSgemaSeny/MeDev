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

import { cleanContent } from '../ui/AiChatWidget';

describe('cleanContent', () => {
  it('should return plain text as-is', () => {
    expect(cleanContent('Привет мир')).toBe('Привет мир');
  });

  it('should unpack concatenated JSON content tokens', () => {
    const raw = '{"content":"###"}{"content":" Что"}{"content":" уже"}';
    expect(cleanContent(raw)).toBe('### Что уже');
  });

  it('should preserve newlines and special characters', () => {
    const raw = '{"content":"\\n\\n"}{"content":"- "}{"content":"**Стек**"}';
    expect(cleanContent(raw)).toBe('\n\n- **Стек**');
  });
});

