import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './store';

// Mock API to prevent actual network calls during logout
vi.mock('../../../shared/api/axios', () => ({
  api: {
    post: vi.fn().mockResolvedValue({}),
  }
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Clear store state
    useAuthStore.setState({
      accessToken: null,
      username: null,
      plan: null,
    });
  });

  it('должен иметь начальное состояние', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.username).toBeNull();
    expect(state.plan).toBeNull();
  });

  it('setTokens должен сохранять accessToken в state, а refreshToken в localStorage', () => {
    useAuthStore.getState().setTokens('access123', 'refresh456');
    const state = useAuthStore.getState();
    
    expect(state.accessToken).toBe('access123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh456');
  });

  it('setAuth должен обновлять всё', () => {
    useAuthStore.getState().setAuth('access123', 'refresh456', 'testuser', 'PRO');
    const state = useAuthStore.getState();
    
    expect(state.accessToken).toBe('access123');
    expect(state.username).toBe('testuser');
    expect(state.plan).toBe('PRO');
    expect(localStorage.getItem('refreshToken')).toBe('refresh456');
  });

  it('logout должен очищать состояние и localStorage', async () => {
    useAuthStore.getState().setAuth('access123', 'refresh456', 'testuser', 'PRO');
    
    await useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    
    expect(state.accessToken).toBeNull();
    expect(state.username).toBeNull();
    expect(state.plan).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('setPlan должен обновлять только plan', () => {
    useAuthStore.getState().setPlan('PRO');
    const state = useAuthStore.getState();
    
    expect(state.plan).toBe('PRO');
  });
});
