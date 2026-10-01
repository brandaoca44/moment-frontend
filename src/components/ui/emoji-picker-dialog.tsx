import { t, useLanguage } from '@/i18n';
import { useEffect, useId, useRef, type ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker, { EmojiStyle, SuggestionMode, Theme } from 'emoji-picker-react';
import portuguese from 'emoji-picker-react/dist/data/emojis-pt.json';
import english from 'emoji-picker-react/dist/data/emojis-en.json';
import spanish from 'emoji-picker-react/dist/data/emojis-es.json';
import { useTheme } from '@/contexts/theme-context';
import './emoji-picker.css';

export default function EmojiPickerDialog({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const language = useLanguage();
  const emojiData = language === 'en-US' ? english : language === 'es-ES' ? spanish : portuguese;
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { themeId } = useTheme();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  return createPortal(<dialog ref={dialog} className="moment-emoji-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose(); } }}>
    <header><h2 id={titleId}>{t("Emojis")}</h2><button type="button" onClick={onClose} aria-label={t("Fechar emojis")}>×</button></header>
    <EmojiPicker key={language} emojiData={emojiData as ComponentProps<typeof EmojiPicker>['emojiData']} emojiStyle={EmojiStyle.TWITTER} theme={themeId === 'light' ? Theme.LIGHT : Theme.DARK}
      width="100%" height="min(420px, calc(100dvh - 140px))" lazyLoadEmojis autoFocusSearch={false}
      searchPlaceholder={t('Buscar emoji')} searchClearButtonLabel={t('Limpar busca')} suggestedEmojisMode={SuggestionMode.RECENT}
      previewConfig={{ showPreview: false }} onEmojiClick={data => onSelect(data.emoji)} />
    <footer className="emoji-credits"><a href="https://github.com/twitter/twemoji" target="_blank" rel="noreferrer">Twemoji</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></footer>
  </dialog>, document.body);
}
