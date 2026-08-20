import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../../shared/api/axios';
import { useAuthStore } from '../../entities/user/model/store';

// Mock API
vi.mock('../../shared/api/axios', () => ({
  BASE_URL: 'http://localhost:8080/api/v1',
  api: {
    post: vi.fn(),
  }
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ accessToken: null, username: null, plan: null });
  });

  const renderComponent = () => render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );

  it('renders login form correctly', () => {
    renderComponent();
    expect(screen.getByText('Sign in to MeDev')).toBeDefined();
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeDefined();
  });

  it('shows error on failed login', async () => {
    (api.post as any).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(screen.getByRole('button', { name: /Signing in.../i })).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  it('updates store on successful login', async () => {
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
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe('access-token');
      expect(state.username).toBe('testuser');
      expect(state.plan).toBe('FREE');
    });
  });
});
