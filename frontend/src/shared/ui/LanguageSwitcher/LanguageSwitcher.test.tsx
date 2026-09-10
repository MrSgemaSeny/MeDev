import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';

describe('LanguageSwitcher Component (JF-1C Pattern)', () => {
  it('renders RU and EN buttons in pill variant by default', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByRole('button', { name: 'RU' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
  });

  it('renders segmented variant with full labels', () => {
    render(<LanguageSwitcher variant="segmented" />);
    expect(screen.getByRole('button', { name: 'Русский' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  });

  it('triggers language switch and dispatches event when clicked', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
    render(<LanguageSwitcher />);

    const ruBtn = screen.getByRole('button', { name: 'RU' });
    fireEvent.click(ruBtn);

    expect(dispatchSpy).toHaveBeenCalled();
  });
});
