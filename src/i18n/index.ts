import { useSyncExternalStore } from 'react';
import { messages } from './messages';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';
export const languages: { code: Language; name: string }[] = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'en-US', name: 'English (United States)' },
  { code: 'es-ES', name: 'Español (España)' },
];
export function isLanguage(value: unknown): value is Language { return languages.some(item => item.code === value); }
function initialLanguage(): Language {
  try { const saved = localStorage.getItem('moment-language'); if (isLanguage(saved)) return saved; } catch { /* Storage can be unavailable in private browsing. */ }
  const language = navigator.language.toLowerCase();
  return language.startsWith('en') ? 'en-US' : language.startsWith('es') ? 'es-ES' : 'pt-BR';
}
let language = initialLanguage();
const listeners = new Set<() => void>();
export const getLanguage = () => language;
document.documentElement.lang = language;
export function setLanguage(value: Language) {
  language = value;
  document.documentElement.lang = value;
  try { localStorage.setItem('moment-language', value); } catch { /* Keep the in-memory preference. */ }
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function useLanguage() { return useSyncExternalStore(subscribe, getLanguage); }
export function t(text: string, values?: Record<string, string | number>): string {
  const translated = language === 'pt-BR' ? undefined : messages[text.trim()]?.[language === 'en-US' ? 0 : 1];
  const result = translated === undefined ? text : text.replace(text.trim(), () => translated);
  return values ? result.replace(/\{(\w+)\}/g, (match, key: string) => values[key] === undefined ? match : String(values[key])) : result;
}
export function relativeTime(value: string, now = Date.now()) {
  const minutes = Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000));
  const formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto', style: 'short' });
  return minutes < 1 ? formatter.format(0, 'second') : minutes < 60 ? formatter.format(-minutes, 'minute') : minutes < 1440 ? formatter.format(-Math.floor(minutes / 60), 'hour') : formatter.format(-Math.floor(minutes / 1440), 'day');
}
export function dateText(value: string | Date, options?: Intl.DateTimeFormatOptions) { return new Date(value).toLocaleDateString(language, options); }
