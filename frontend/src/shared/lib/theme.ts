export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
};

export const toggleTheme = (setDark?: (isDark: boolean) => void) => {
  const html = document.documentElement;
  const isCurrentlyDark = html.classList.contains('dark');
  const willBeDark = !isCurrentlyDark;

  html.classList.add('theme-transition');

  if (willBeDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  window.dispatchEvent(new CustomEvent('medev-theme-changed', { detail: { isDark: willBeDark } }));

  if (setDark) {
    setDark(willBeDark);
  }

  setTimeout(() => {
    html.classList.remove('theme-transition');
  }, 300);
};

export const setTheme = (isDark: boolean, setDark?: (isDark: boolean) => void) => {
  const html = document.documentElement;
  
  if (html.classList.contains('dark') === isDark) {
    if (setDark) setDark(isDark);
    return;
  }

  html.classList.add('theme-transition');

  if (isDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  window.dispatchEvent(new CustomEvent('medev-theme-changed', { detail: { isDark } }));

  if (setDark) {
    setDark(isDark);
  }

  setTimeout(() => {
    html.classList.remove('theme-transition');
  }, 300);
};

