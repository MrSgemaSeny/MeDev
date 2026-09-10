import { describe, it, expect, beforeEach } from 'vitest';
import { setTheme, toggleTheme, isDarkMode } from './theme';

describe('theme management (Light & Dark modes)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('sets dark theme properly', () => {
    setTheme(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(isDarkMode()).toBe(true);
  });

  it('sets light theme properly', () => {
    // start with dark
    setTheme(true);
    expect(isDarkMode()).toBe(true);

    // switch to light
    setTheme(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(isDarkMode()).toBe(false);
  });

  it('toggles theme between dark and light seamlessly', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');

    toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(isDarkMode()).toBe(false);

    toggleTheme();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(isDarkMode()).toBe(true);
  });
});
