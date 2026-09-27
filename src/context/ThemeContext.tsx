import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ut_color_theme';

function getStoredInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    const settingsRaw = localStorage.getItem('ut_cms_site_settings');
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw);
      if (parsed.default_theme === 'dark' || parsed.default_theme === 'light' || parsed.default_theme === 'system') {
        return parsed.default_theme;
      }
    }
  } catch {}
  return 'dark'; // Default to dark for Ultimate Tomato aesthetic
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Synchronize on external theme changes (e.g. from PortfolioSettingsView)
  useEffect(() => {
    const handleThemeEvent = (e: any) => {
      const newTheme = e.detail?.theme;
      if (newTheme && (newTheme === 'dark' || newTheme === 'light' || newTheme === 'system')) {
        setThemeState(newTheme);
      }
    };

    window.addEventListener('ut_theme_changed', handleThemeEvent);
    return () => window.removeEventListener('ut_theme_changed', handleThemeEvent);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme() {
      let resolved: ResolvedTheme = 'dark';
      if (theme === 'system') {
        resolved = media.matches ? 'dark' : 'light';
      } else {
        resolved = theme;
      }

      setResolvedTheme(resolved);

      const root = document.documentElement;
      if (resolved === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }

      // Update meta color-scheme
      let meta = document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'color-scheme';
        document.head.appendChild(meta);
      }
      meta.content = resolved;
    }

    applyTheme();

    const listener = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
