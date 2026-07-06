import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const THEME_CLASS_NAMES = [
  'theme-v3rii',
  'theme-corporate-blue',
  'theme-graphite',
  'theme-emerald',
  'theme-executive',
  'theme-burgundy',
  'theme-industrial-steel',
  'theme-clean-light',
  'theme-high-contrast',
  'theme-minimal-crm',
  'theme-flat-navy',
  'theme-flat-slate',
  'theme-flat-white',
] as const;

const STALE_BRAND_STORAGE_KEYS = [
  'vite-ui-brand-theme',
  'vite-ui-color-scheme-mode',
  'vite-ui-aqua-brand-theme',
  'vite-ui-aqua-color-scheme-mode',
] as const;

const getStoredTheme = (storageKey: string, defaultTheme: Theme): Theme => {
  const stored = localStorage.getItem(storageKey);
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return defaultTheme;
};

const applyThemeClass = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
    root.dataset.theme = systemTheme;
    return;
  }

  root.classList.add(theme);
  root.dataset.theme = theme;
};

/** React render oncesi: stale brand tema kalintilarini temizler, dark/light'i geri yukler. */
export const initializeThemeDom = (storageKey = 'vite-ui-theme', defaultTheme: Theme = 'system') => {
  const root = document.documentElement;
  root.classList.remove(...THEME_CLASS_NAMES);
  delete root.dataset.brandTheme;

  for (const key of STALE_BRAND_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  applyThemeClass(getStoredTheme(storageKey, defaultTheme));
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme(storageKey, defaultTheme));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASS_NAMES);
    delete root.dataset.brandTheme;

    applyThemeClass(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeClass('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setThemeAndStore = useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
    [storageKey],
  );

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeAndStore,
    }),
    [theme, setThemeAndStore],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
