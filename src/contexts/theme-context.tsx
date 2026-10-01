import { t, useLanguage } from '@/i18n';
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
    get name() { return t("Claro"); },
    get description() { return t("Branco perolado e luz suave"); },
    colors: {
      bg: '#f5f5f7',
      bgSecondary: '#eeeef2',
      surface: '#ffffff',
      surfaceSoft: '#f8f8fa',
      border: '#dedee4',
      text: '#1d1d1f',
      textSoft: '#48484e',
      textMuted: '#6e6e76',
      amethyst: '#7c3aed',
      amethystLight: '#a78bfa',
      amethystBg: '#f5f3ff',
      amethystBorder: '#ddd6fe',
    },
  },
  dark: {
    id: 'dark',
    get name() { return t("Escuro"); },
    get description() { return t("Preto profundo e cinzas neutros"); },
    colors: {
      bg: '#000000',
      bgSecondary: '#080808',
      surface: '#0a0a0a',
      surfaceSoft: '#171717',
      border: '#2f2f2f',
      text: '#ededed',
      textSoft: '#c7c7c7',
      textMuted: '#929292',
      amethyst: '#a78bfa',
      amethystLight: '#c4b5fd',
      amethystBg: '#171717',
      amethystBorder: '#404040',
    },
  },
  'amethyst-dark': {
    id: 'amethyst-dark',
    get name() { return t("Ametista"); },
    get description() { return t("Ameixa profunda e reflexos de lavanda"); },
    colors: {
      bg: '#110d19',
      bgSecondary: '#181220',
      surface: '#20182e',
      surfaceSoft: '#2a203b',
      border: '#40334f',
      text: '#fbf8ff',
      textSoft: '#dcd1e8',
      textMuted: '#b0a0c1',
      amethyst: '#b794ff',
      amethystLight: '#d8c7ff',
      amethystBg: '#2c1d40',
      amethystBorder: '#67468a',
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
  useLanguage();
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
    const isNeutralDark = themeId === 'dark';
    root.style.colorScheme = isLight ? 'light' : 'dark';
    for (const [name, rgb] of Object.entries({ 'accent-rgb': '124, 58, 237', 'accent-soft-rgb': '167, 139, 250', 'accent-deep-rgb': '76, 29, 149', 'accent-pale-rgb': '196, 181, 253', 'accent-faint-rgb': '221, 214, 254' })) {
      root.style.setProperty(`--${name}`, isNeutralDark ? '128, 128, 128' : isLight ? '176, 172, 190' : rgb);
    }

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
      isLight ? 'rgba(60, 60, 75, 0.10)' : 'rgba(255, 255, 255, 0.08)',
    );
    root.style.setProperty(
      '--surface-glass',
      isLight ? 'rgba(255, 255, 255, 0.92)' : isNeutralDark ? 'rgba(10, 10, 10, 0.90)' : 'rgba(43, 32, 58, 0.90)',
    );
    root.style.setProperty(
      '--surface-elevated',
      isLight ? 'rgba(236, 236, 242, 0.78)' : isAmethystDark ? 'rgba(23, 17, 33, 0.92)' : 'rgba(255, 255, 255, 0.045)',
    );
    root.style.setProperty(
      '--sidebar-bg',
      isLight ? 'rgba(255, 255, 255, 0.72)' : isAmethystDark ? 'rgba(13, 10, 26, 0.78)' : 'rgba(0, 0, 0, 0.90)',
    );
    root.style.setProperty(
      '--card-bg',
      isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(255, 255, 255, 0.045)',
    );
    root.style.setProperty(
      '--glass-border',
      isLight ? 'rgba(60, 60, 75, 0.10)' : isAmethystDark ? 'rgba(210, 185, 240, 0.12)' : 'rgba(255, 255, 255, 0.07)',
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
      isLight ? '0 8px 24px rgba(28, 28, 40, 0.045)' : '0 10px 28px rgba(0, 0, 0, 0.24)',
    );
    root.style.setProperty(
      '--shadow-card',
      isLight ? '0 12px 36px rgba(28, 28, 40, 0.055)' : '0 18px 50px rgba(0, 0, 0, 0.34)',
    );
    root.style.setProperty(
      '--shadow-md',
      isLight ? '0 18px 48px rgba(28, 28, 40, 0.065)' : '0 24px 70px rgba(0, 0, 0, 0.48)',
    );
    root.style.setProperty(
      '--shadow-amethyst',
      isLight ? '0 14px 34px rgba(124, 58, 237, 0.18)' : isNeutralDark ? '0 14px 34px rgba(0, 0, 0, 0.28)' : '0 14px 34px rgba(124, 58, 237, 0.28)',
    );
    root.style.setProperty(
      '--shadow-danger',
      isLight ? '0 14px 34px rgba(225, 29, 72, 0.12)' : '0 14px 34px rgba(251, 113, 133, 0.18)',
    );

    root.style.setProperty('--radius-sm', '14px');
    root.style.setProperty('--radius-md', '20px');
    root.style.setProperty('--radius-lg', '28px');
    root.style.setProperty('--ease-premium', 'cubic-bezier(0.2, 0.8, 0.2, 1)');

    root.style.setProperty('--panel-background', isNeutralDark ? 'var(--surface-glass)' : 'linear-gradient(145deg, var(--surface-glass) 0%, var(--surface) 48%, var(--surface-elevated) 100%)');
    root.style.setProperty('--card-background', isNeutralDark ? 'var(--card-bg)' : 'linear-gradient(155deg, var(--surface) 0%, var(--surface-soft) 100%)');
    document.body.style.background = isLight
      ? 'radial-gradient(ellipse at 85% 0%, rgba(222, 215, 237, 0.22), transparent 55%), linear-gradient(160deg, #ffffff 0%, #f5f5f7 45%, #eeeef2 100%)'
      : isAmethystDark
        ? 'radial-gradient(ellipse at 85% 0%, rgba(125, 82, 165, 0.12), transparent 55%), linear-gradient(160deg, #1b1327 0%, #110d19 55%, #17101f 100%)'
        : c.bg;
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
