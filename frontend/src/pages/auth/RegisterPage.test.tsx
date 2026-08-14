import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegisterPage } from './RegisterPage';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../shared/api/axios';
import { useAuthStore } from '../../entities/user/model/store';

// Mock API
vi.mock('../../shared/api/axios', () => ({
  api: {
    post: vi.fn(),
  }
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, username: null, plan: null });
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );

  it('renders register form correctly', () => {
    renderComponent();
    expect(screen.getByText('Create your account')).toBeDefined();
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Username/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeDefined();
  });

  it('shows error on failed registration', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { message: 'Username taken' } }
    });

    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

    expect(screen.getByRole('button', { name: /Creating.../i })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Username taken')).toBeDefined();
    });
  });

  it('updates store on successful registration', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        username: 'testuser',
        plan: 'FREE'
      }
    });

    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('access-token');
      expect(state.username).toBe('testuser');
      expect(state.plan).toBe('FREE');
    });
  });
});
