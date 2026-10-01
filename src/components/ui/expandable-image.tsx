import { t, useLanguage } from '@/i18n';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './expandable-image.css';

type Props = { src: string; alt: string; className?: string };

function ImageViewer({ src, alt, onClose }: Props & { onClose: () => void }) {
  useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      className="moment-image-viewer"
      aria-label={t("Imagem ampliada")}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <button type="button" autoFocus className="moment-image-close" onClick={onClose} aria-label={t("Fechar imagem")}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
      <img className="moment-image-full" src={src} alt={alt} />
    </dialog>,
    document.body,
  );
}

export function ExpandableImage({ src, alt, className }: Props) {
  useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  function close() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }

  return <>
    <button ref={triggerRef} type="button" className="moment-image-trigger" aria-label={t("Abrir imagem em tela cheia")} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <img src={src} alt={alt} className={className} loading="lazy" />
    </button>
    {open && <ImageViewer src={src} alt={alt} onClose={close} />}
  </>;
}
