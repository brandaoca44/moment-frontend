import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useMe } from '@/features/auth/hooks/use-me';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { languages, isLanguage, setLanguage, t, useLanguage, type Language } from './index';
import './language.css';

export function LanguageSync() {
  const user = useMe().data?.data.user;
  const syncedUser = useRef<string | null>(null);
  useEffect(() => {
    if (!user) { syncedUser.current = null; return; }
    if (syncedUser.current === user.id) return;
    syncedUser.current = user.id;
    if (isLanguage(user.language)) setLanguage(user.language);
  }, [user]);
  return null;
}

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const language = useLanguage();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const user = useMe().data?.data.user;
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  async function choose(value: Language) {
    if (pending) return;
    setPending(true); setError('');
    try {
      if (user) {
        await api('/auth/language', { method: 'PATCH', body: JSON.stringify({ language: value }) });
        await client.invalidateQueries({ queryKey: ['auth', 'me'] });
      }
      setLanguage(value); setOpen(false);
    } catch { setError(t('Não foi possível salvar o idioma. Tente novamente.')); }
    finally { setPending(false); }
  }
  return <div ref={root} className={compact ? 'language-picker language-compact' : 'language-picker'} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); root.current?.querySelector('button')?.focus(); } }}>
    {compact && <button className="language-globe" type="button" aria-label={t('Idiomas')} aria-expanded={open} onClick={() => setOpen(value => !value)}><Globe size={20} /><span>{language.split('-')[0].toUpperCase()}</span></button>}
    {(!compact || open) && <div className="language-options" role="group" aria-label={t('Idiomas')}>
      {languages.map(item => <button type="button" key={item.code} lang={item.code} aria-pressed={item.code === language} disabled={pending} onClick={() => void choose(item.code)}><span>{item.name}</span>{item.code === language && <Check size={16} aria-hidden="true" />}</button>)}
    </div>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
