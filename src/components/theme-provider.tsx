import { type ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  type BrandTheme,
  DEFAULT_BRAND_THEME,
  brandThemes,
} from '@/lib/brand-themes';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  brandTheme: BrandTheme;
  setBrandTheme: (brandTheme: BrandTheme) => void;
  isBrandThemeActive: boolean;
  setIsBrandThemeActive: (active: boolean) => void;
};

const BRAND_THEME_STORAGE_KEY = 'v3rii-brand-theme';
const BRAND_THEME_ACTIVE_STORAGE_KEY = 'v3rii-brand-active';

const BRAND_THEME_CLASS_NAMES = brandThemes.map((item) => item.className);

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

const isValidBrandTheme = (value: string | null): value is BrandTheme => {
  return Boolean(value && brandThemes.some((item) => item.id === value));
};

const getStoredBrandTheme = (): BrandTheme => {
  const stored = localStorage.getItem(BRAND_THEME_STORAGE_KEY);
  if (isValidBrandTheme(stored)) return stored;
  return DEFAULT_BRAND_THEME;
};

const getStoredBrandThemeActive = (): boolean => {
  return localStorage.getItem(BRAND_THEME_ACTIVE_STORAGE_KEY) === 'true';
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

const applyBrandThemeClass = (brandTheme: BrandTheme, isActive: boolean) => {
  const root = document.documentElement;
  root.classList.remove(...BRAND_THEME_CLASS_NAMES);
  delete root.dataset.brandTheme;

  if (!isActive) return;

  const themeClass = brandThemes.find((item) => item.id === brandTheme)?.className;
  if (themeClass) {
    root.classList.add(themeClass);
  }
  root.dataset.brandTheme = brandTheme;
};

/** React render oncesi: stale brand tema kalintilarini temizler, dark/light ve aktif brand temayi geri yukler. */
export const initializeThemeDom = (storageKey = 'vite-ui-theme', defaultTheme: Theme = 'system') => {
  for (const key of STALE_BRAND_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }

  applyThemeClass(getStoredTheme(storageKey, defaultTheme));
  applyBrandThemeClass(getStoredBrandTheme(), getStoredBrandThemeActive());
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  brandTheme: DEFAULT_BRAND_THEME,
  setBrandTheme: () => null,
  isBrandThemeActive: false,
  setIsBrandThemeActive: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme(storageKey, defaultTheme));
  const [brandTheme, setBrandThemeState] = useState<BrandTheme>(() => getStoredBrandTheme());
  const [isBrandThemeActive, setIsBrandThemeActiveState] = useState<boolean>(() => getStoredBrandThemeActive());

  useEffect(() => {
    applyThemeClass(theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeClass('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    applyBrandThemeClass(brandTheme, isBrandThemeActive);
  }, [brandTheme, isBrandThemeActive]);

  const setThemeAndStore = useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
    [storageKey],
  );

  const setBrandThemeAndStore = useCallback((newBrandTheme: BrandTheme) => {
    localStorage.setItem(BRAND_THEME_STORAGE_KEY, newBrandTheme);
    setBrandThemeState(newBrandTheme);
  }, []);

  const setIsBrandThemeActiveAndStore = useCallback((active: boolean) => {
    localStorage.setItem(BRAND_THEME_ACTIVE_STORAGE_KEY, String(active));
    setIsBrandThemeActiveState(active);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeAndStore,
      brandTheme,
      setBrandTheme: setBrandThemeAndStore,
      isBrandThemeActive,
      setIsBrandThemeActive: setIsBrandThemeActiveAndStore,
    }),
    [theme, setThemeAndStore, brandTheme, setBrandThemeAndStore, isBrandThemeActive, setIsBrandThemeActiveAndStore],
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
