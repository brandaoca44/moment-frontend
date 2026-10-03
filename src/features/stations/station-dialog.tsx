import { t, useLanguage } from '@/i18n';
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function StationDialog({
  label,
  title = label,
  children,
  busy = false,
  defaultOpen = false,
  icon,
}: {
  label: string;
  title?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
  busy?: boolean;
  defaultOpen?: boolean;
  icon?: ReactNode;
}) {
  useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    const element = dialog.current;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previous;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        ref={trigger}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {icon}
        <span>{label}</span>
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="station-dialog"
            aria-labelledby={titleId}
            onCancel={(e) => {
              e.preventDefault();
              if (!busy) setOpen(false);
            }}
          >
            <div className="stations-page station-dialog-content">
              <header className="station-dialog-header">
                <h2 id={titleId}>{title}</h2>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                  aria-label={`${t("Fechar")} ${title}`}
                >
                  {t(" Fechar ")}</button>
              </header>
              {typeof children === 'function' ? children(() => setOpen(false)) : children}
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
