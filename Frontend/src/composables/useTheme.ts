import { ref } from 'vue';

const THEME_KEY = 'theme';
type Theme = 'light' | 'dark';

const isDark = ref(false);

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    isDark.value = true;
  } else {
    document.documentElement.classList.remove('dark');
    isDark.value = false;
  }
}

function toggleTheme() {
  const next: Theme = isDark.value ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  const theme: Theme = saved === 'dark' ? 'dark' : 'light';
  applyTheme(theme);
}

export function useTheme() {
  initTheme();
  return { isDark, toggleTheme };
}
