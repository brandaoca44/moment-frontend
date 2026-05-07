import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId = 'light' | 'dark' | 'amethyst-dark';

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  colors: {
    bg: string;
    bgSecondary: string;
    surface: string;
    surfaceSoft: string;
    border: string;
    text: string;
    textSoft: string;
    textMuted: string;
    amethyst: string;
    amethystLight: string;
    amethystBg: string;
    amethystBorder: string;
  };
};

export const themes: Record<ThemeId, Theme> = {
  light: {
    id: 'light',
    name: 'Claro',
    description: 'Suave e acolhedor',
    colors: {
      bg: '#fbfaff',
      bgSecondary: '#f5f3ff',
      surface: '#ffffff',
      surfaceSoft: '#fafafa',
      border: '#ede9fe',
      text: '#161827',
      textSoft: '#404152',
      textMuted: '#8b8ca3',
      amethyst: '#7c3aed',
      amethystLight: '#a78bfa',
      amethystBg: '#f5f3ff',
      amethystBorder: '#ddd6fe',
    },
  },
  dark: {
    id: 'dark',
    name: 'Escuro',
    description: 'Confortável para a noite',
    colors: {
      bg: '#0f1422',
      bgSecondary: '#151b2b',
      surface: '#1b2233',
      surfaceSoft: '#242d41',
      border: '#303a52',
      text: '#f8fafc',
      textSoft: '#d8deea',
      textMuted: '#96a0b5',
      amethyst: '#a78bfa',
      amethystLight: '#c4b5fd',
      amethystBg: '#241f4f',
      amethystBorder: '#4c3a87',
    },
  },
  'amethyst-dark': {
    id: 'amethyst-dark',
    name: 'Ametista',
    description: 'Intenso e imersivo',
    colors: {
      bg: '#0d0a1a',
      bgSecondary: '#130e24',
      surface: '#1a1230',
      surfaceSoft: '#221840',
      border: '#332166',
      text: '#fbf8ff',
      textSoft: '#ded2ff',
      textMuted: '#a795d0',
      amethyst: '#b794ff',
      amethystLight: '#d8c7ff',
      amethystBg: '#231044',
      amethystBorder: '#5b35a8',
    },
  },
};

type ThemeContextType = {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  themeId: 'light',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('moment-theme') as ThemeId | null;
    return saved && themes[saved] ? saved : 'light';
  });

  const theme = themes[themeId];

  function setTheme(id: ThemeId) {
    setThemeId(id);
    localStorage.setItem('moment-theme', id);
  }

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    const isLight = themeId === 'light';
    const isAmethystDark = themeId === 'amethyst-dark';

    root.style.setProperty('--bg', c.bg);
    root.style.setProperty('--bg-secondary', c.bgSecondary);
    root.style.setProperty('--surface', c.surface);
    root.style.setProperty('--surface-soft', c.surfaceSoft);
    root.style.setProperty('--border', c.border);
    root.style.setProperty('--text', c.text);
    root.style.setProperty('--text-soft', c.textSoft);
    root.style.setProperty('--text-muted', c.textMuted);
    root.style.setProperty('--amethyst', c.amethyst);
    root.style.setProperty('--amethyst-light', c.amethystLight);
    root.style.setProperty('--amethyst-bg', c.amethystBg);
    root.style.setProperty('--amethyst-border', c.amethystBorder);

    root.style.setProperty('--danger', isLight ? '#e11d48' : '#fb7185');
    root.style.setProperty('--danger-bg', isLight ? '#fff1f2' : 'rgba(127, 29, 29, 0.26)');
    root.style.setProperty('--danger-border', isLight ? '#fecdd3' : 'rgba(251, 113, 133, 0.28)');

    root.style.setProperty('--success', isLight ? '#047857' : '#6ee7b7');
    root.style.setProperty('--success-bg', isLight ? '#ecfdf5' : 'rgba(6, 78, 59, 0.26)');
    root.style.setProperty('--success-border', isLight ? '#a7f3d0' : 'rgba(110, 231, 183, 0.24)');

    root.style.setProperty(
      '--border-soft',
      isLight ? 'rgba(237, 233, 254, 0.72)' : 'rgba(255, 255, 255, 0.08)',
    );
    root.style.setProperty(
      '--surface-glass',
      isLight ? 'rgba(255, 255, 255, 0.76)' : 'rgba(26, 18, 48, 0.76)',
    );
    root.style.setProperty(
      '--surface-elevated',
      isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.045)',
    );
    root.style.setProperty(
      '--sidebar-bg',
      isLight ? 'rgba(255, 255, 255, 0.72)' : isAmethystDark ? 'rgba(13, 10, 26, 0.78)' : 'rgba(15, 20, 34, 0.78)',
    );
    root.style.setProperty(
      '--card-bg',
      isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.045)',
    );
    root.style.setProperty(
      '--glass-border',
      isLight ? 'rgba(255, 255, 255, 0.74)' : 'rgba(255, 255, 255, 0.07)',
    );
    root.style.setProperty(
      '--glass-highlight',
      isLight ? 'rgba(255, 255, 255, 0.86)' : 'rgba(255, 255, 255, 0.045)',
    );

    root.style.setProperty(
      '--shadow-xs',
      isLight ? '0 1px 2px rgba(15, 23, 42, 0.04)' : '0 1px 2px rgba(0, 0, 0, 0.35)',
    );
    root.style.setProperty(
      '--shadow-sm',
      isLight ? '0 10px 28px rgba(76, 29, 149, 0.055)' : '0 10px 28px rgba(0, 0, 0, 0.24)',
    );
    root.style.setProperty(
      '--shadow-card',
      isLight ? '0 18px 50px rgba(76, 29, 149, 0.07)' : '0 18px 50px rgba(0, 0, 0, 0.34)',
    );
    root.style.setProperty(
      '--shadow-md',
      isLight ? '0 24px 70px rgba(76, 29, 149, 0.09)' : '0 24px 70px rgba(0, 0, 0, 0.48)',
    );
    root.style.setProperty(
      '--shadow-amethyst',
      isLight ? '0 14px 34px rgba(124, 58, 237, 0.18)' : '0 14px 34px rgba(124, 58, 237, 0.28)',
    );
    root.style.setProperty(
      '--shadow-danger',
      isLight ? '0 14px 34px rgba(225, 29, 72, 0.12)' : '0 14px 34px rgba(251, 113, 133, 0.18)',
    );

    root.style.setProperty('--radius-sm', '14px');
    root.style.setProperty('--radius-md', '20px');
    root.style.setProperty('--radius-lg', '28px');
    root.style.setProperty('--ease-premium', 'cubic-bezier(0.2, 0.8, 0.2, 1)');

    document.body.style.background = c.bg;
    document.body.style.color = c.text;
  }, [theme, themeId]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
