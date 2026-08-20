import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';
import { MemoryRouter } from 'react-router-dom';
import { useProfile } from '../../shared/api/hooks/useProfile';
import { useAuthStore } from '../../entities/user/model/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock dependencies
vi.mock('../../shared/api/hooks/useProfile');
vi.mock('../../entities/user/model/store');

const queryClient = new QueryClient();

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(useProfile).mockReturnValue({ data: undefined, isLoading: true } as any);
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      if (selector.toString().includes('username')) return 'testuser';
      if (selector.toString().includes('plan')) return 'FREE';
      return null;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('renders dynamic profile data (no mock data)', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: {
        fullName: 'Real User Name',
        headline: 'Real Headline',
        summary: 'Real summary text',
        githubUsername: 'realgh',
        skills: [{ name: 'React' }, { name: 'Java' }],
        experience: [],
        education: []
      },
      isLoading: false
    } as any);

    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      if (selector.toString().includes('username')) return 'testuser';
      if (selector.toString().includes('plan')) return 'PRO';
      return null;
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // Verify Hero
    expect(screen.getByText(/Welcome back,/)).toBeTruthy();
    expect(screen.getByText('Real User Name.')).toBeTruthy();

    // Verify Stats
    expect(screen.getByText('Synced')).toBeTruthy(); // githubUsername is present
    expect(screen.getByText('PRO')).toBeTruthy();

    // Verify Live Preview uses real data
    expect(screen.getByText('Real User Name')).toBeTruthy();
    expect(screen.getByText('Real Headline')).toBeTruthy();
    expect(screen.getByText('Real summary text')).toBeTruthy();
    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText('Java')).toBeTruthy();
    
    // Ensure no mock repositories from LandingPage leaked here
    const element = screen.queryByText('dev-utils');
    expect(element).toBeNull();
  });
});
