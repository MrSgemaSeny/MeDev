export const toggleTheme = (setDark?: (isDark: boolean) => void) => {
  const html = document.documentElement;
  html.classList.add('dark');
  localStorage.setItem('theme', 'dark');

  if (setDark) {
    setDark(true);
  }
};

export const setTheme = (_isDark: boolean, setDark?: (isDark: boolean) => void) => {
  const html = document.documentElement;
  html.classList.add('dark');
  localStorage.setItem('theme', 'dark');

  if (setDark) {
    setDark(true);
  }
};
