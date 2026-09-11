import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiTailorModal } from './AiTailorModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import * as hooks from '../../../entities/job-tracker/api/hooks';
import type { JobApplicationDto } from '../../../entities/job-tracker/model/types';

const mockApp: JobApplicationDto = {
  id: 101,
  companyName: 'Stripe',
  role: 'Senior Backend Engineer',
  status: 'WISHLIST',
  jobDescription: 'Looking for a Senior Java engineer with Spring Boot expertise.',
  updatedAt: new Date().toISOString(),
};

describe('AiTailorModal', () => {
  let queryClient: QueryClient;
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(hooks, 'useTailorResume').mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    vi.spyOn(hooks, 'useUpdateJobApplication').mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('renders with prefilled job description and target role', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AiTailorModal app={mockApp} isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.getByText('Senior Backend Engineer')).toBeDefined();
    expect(screen.getByText('Stripe')).toBeDefined();
    const textarea = screen.getByDisplayValue('Looking for a Senior Java engineer with Spring Boot expertise.') as HTMLTextAreaElement;
    expect(textarea).toBeDefined();
  });

  it('calls tailorMutation with job description on submit', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AiTailorModal app={mockApp} isOpen={true} onClose={vi.fn()} />
        </MemoryRouter>
      </QueryClientProvider>
    );

    const submitBtn = screen.getByRole('button', { name: /Адаптировать резюме/i });
    fireEvent.click(submitBtn);

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        jobDescription: 'Looking for a Senior Java engineer with Spring Boot expertise.',
        targetRole: 'Senior Backend Engineer',
      }),
      expect.any(Object)
    );
  });
});
