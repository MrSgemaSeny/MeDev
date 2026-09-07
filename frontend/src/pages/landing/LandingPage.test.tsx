import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from './LandingPage';

describe('LandingPage Component', () => {
  it('renders landing hero, features, templates, pricing, and FAQ sections', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Hero verification
    expect(screen.getByText(/Превратите ваш/i)).toBeInTheDocument();
    expect(screen.getByText(/Войти через GitHub/i)).toBeInTheDocument();

    // Features Bento Grid
    expect(screen.getByText(/Автоматический GitHub Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Resume Studio \(Groq GPT-20B\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Job Tracker ATS & Kanban/i)).toBeInTheDocument();

    // Templates Showcase
    expect(screen.getByText(/6 инженерных PDF-дизайнов под любые цели/i)).toBeInTheDocument();
    expect(screen.getByText(/Classic \(ATS Standard\)/i)).toBeInTheDocument();

    // Pricing
    expect(screen.getByText(/Честные тарифы без скрытых платежей/i)).toBeInTheDocument();
    expect(screen.getByText(/PRO Engineer/i)).toBeInTheDocument();

    // FAQ
    expect(screen.getByText(/Ответы на ключевые вопросы/i)).toBeInTheDocument();
  });
});
