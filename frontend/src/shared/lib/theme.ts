export const toggleTheme = (setDark?: (isDark: boolean) => void) => {
  const html = document.documentElement;
  const isCurrentlyDark = html.classList.contains('dark');
  const willBeDark = !isCurrentlyDark;

  // Add transition class
  html.classList.add('theme-transition');

  if (willBeDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  if (setDark) {
    setDark(willBeDark);
  }

  // Remove transition class after animation completes
  setTimeout(() => {
    html.classList.remove('theme-transition');
  }, 300);
};

export const setTheme = (isDark: boolean, setDark?: (isDark: boolean) => void) => {
  const html = document.documentElement;
  
  if (html.classList.contains('dark') === isDark) return;

  html.classList.add('theme-transition');

  if (isDark) {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }

  if (setDark) {
    setDark(isDark);
  }

  setTimeout(() => {
    html.classList.remove('theme-transition');
  }, 300);
};
