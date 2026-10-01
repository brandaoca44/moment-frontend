import { t, useLanguage } from '@/i18n';
import { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { uploadPostImage } from '../api/feed';
import { useMe } from '@/features/auth/hooks/use-me';
import { useCreatePost } from '../hooks/use-create-post';
import { ReportButton } from '@/features/reports/report-button';

const MAX_CHARS = 220;
const EmojiPickerDialog = lazy(() => import('@/components/ui/emoji-picker-dialog'));

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
  useLanguage();
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 42,
      height: 42,
      borderRadius: '50%',
      background: avatar ? 'transparent' : 'linear-gradient(135deg, var(--amethyst), var(--amethyst-light))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      border: '2px solid var(--amethyst-border)',
    }}>
      {avatar ? (
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <span style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{initials}</span>
      )}
    </div>
  );
}

export function CreatePost() {
  useLanguage();
  const { data: meData } = useMe();
  const createPost = useCreatePost();
  const [content, setContent] = useState('');
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [focused, setFocused] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState<string>();
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');


  useEffect(() => {
    if (!image) { setPreview(''); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function selectImage(file?: File) {
    if (!file || sendingRef.current) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError(t("Escolha uma imagem JPG, PNG, WebP ou GIF."));
      return;
    }
    if (file.size > 5 * 1024 * 1024 || file.size === 0) {
      setError(t("Escolha uma imagem válida de até 5 MB."));
      return;
    }
    setImage(file);
    setUploadedUrl(undefined);
    setError('');
  }

  const user = meData?.data?.user;
  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0 && !image;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const nextContent = `${content.slice(0, start)}${emoji}${content.slice(end)}`;
    if (nextContent.length > MAX_CHARS) { setShowEmojiPicker(false); setError(t("Este emoji ultrapassa o limite de 220 caracteres.")); requestAnimationFrame(() => textarea.focus()); return; }
    setError('');
    setContent(nextContent);
    setShowEmojiPicker(false);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + emoji.length;
      textarea.setSelectionRange(cursor, cursor);
      autoResize();
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmpty || isOverLimit || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError('');
    setNotice('');
    try {
      let imageUrl = uploadedUrl;
      if (image && !imageUrl) {
        setUploading(true);
        imageUrl = await uploadPostImage(image);
        setUploadedUrl(imageUrl);
        setUploading(false);
      }
      const result = await createPost.mutateAsync({ content: content.trim(), commentsEnabled, ...(imageUrl ? { imageUrl } : {}) });
      if (result.data?.moderationStatus === 'PENDING_REVIEW') setNotice(t("Seu momento foi enviado e está aguardando moderação."));
      setContent('');
      setCommentsEnabled(true);
      setImage(null);
      setUploadedUrl(undefined);
      setShowEmojiPicker(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Não foi possível publicar. Tente novamente."));
    } finally {
      sendingRef.current = false;
      setSending(false);
      setUploading(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        .create-post-box {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 20px 20px 10px;
          margin-bottom: 20px;
          transition: box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }

        .create-post-box.focused {
          border-color: var(--amethyst-border);
          box-shadow: 0 0 0 1px var(--amethyst-border);
        }

        .create-post-row { display: flex; gap: 14px; align-items: flex-start; }

        .create-post-box .create-post-textarea {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          resize: none;
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-soft);
          background: transparent;
          font-family: var(--font-ui);
          padding: 8px 0 12px;
          border-radius: 0;
          box-shadow: none;
          overflow-y: hidden;
          min-height: 112px;
        }
        .create-post-box .create-post-textarea:focus { outline: none; border: none; box-shadow: none; }

        .create-post-textarea::placeholder { color: var(--text-muted); }

        .create-post-footer {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
          margin-top: 4px;
          padding-top: 4px;
        }

        .create-post-counter-wrap { display: flex; align-items: baseline; gap: 2px; }

        .create-post-counter {
          font-size: 12px;
          font-weight: 400;
          font-family: var(--font-ui);
          transition: color 0.2s;
        }

        .create-post-counter-total {
          font-size: 12px;
          color: var(--text-muted);
          font-family: var(--font-ui);
        }

        .create-post-error {
          font-size: 13px;
          color: var(--danger);
          font-family: var(--font-ui);
        }

        .create-post-submit {
          min-height: 36px;
          padding: 8px 16px;
          border-radius: 100px;
          border: none;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-ui);
          box-shadow: none;
          transition: opacity 0.2s, transform 0.15s;
        }

        .create-post-submit:disabled {
          background: var(--surface-soft);
          color: var(--text-muted);
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .create-post-emoji-wrap { margin-right: auto; }
        .create-post-box .create-post-emoji-button,
        .create-post-box .content-menu-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 18px;
          box-shadow: none;
          flex-shrink: 0;
        }
        .create-post-box .create-post-emoji-button:hover { background: var(--surface-soft); }
        .create-post-box button:focus-visible { outline: 2px solid var(--amethyst); outline-offset: 2px; }
        .create-post-box button:hover { transform: none; }
        .create-post-counter-wrap { margin-right: 6px; }
        .create-post-preview { position: relative; width: fit-content; max-width: 100%; margin-top: 12px; }
        .create-post-preview img { display: block; max-width: 100%; max-height: 300px; border-radius: 12px; object-fit: contain; }
        .create-post-remove-image { position: absolute; top: 8px; right: 8px; display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 1px solid #ffffff40; border-radius: 50%; background: #151515b3; color: white; backdrop-filter: blur(8px); cursor: pointer; box-shadow: 0 2px 8px #0002; }
        .create-post-remove-image:hover { background: #151515df; }
        .create-post-image-help { font-size: 12px; color: var(--text-muted); }
        .create-post-error { overflow-wrap: anywhere; }
        @media (max-width: 520px) {
          .create-post-box { padding: 16px 12px 8px; border-radius: 18px; }
          .create-post-row { gap: 10px; }
          .create-post-footer { gap: 2px; }
          .create-post-submit { max-width: 100%; padding: 8px 14px; }
        }
        @media (pointer: coarse) {
          .create-post-remove-image { width: 44px; height: 44px; }
          .create-post-box .create-post-emoji-button, .create-post-box .content-menu-trigger { width: 44px; height: 44px; }
          .create-post-submit { min-height: 44px; }
        }
      `}</style>

      <div className={`create-post-box${focused ? ' focused' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="create-post-row">
            <Avatar name={user.name} avatar={user.avatar} />
            <textarea
              ref={textareaRef}
              value={content}
              disabled={sending}
              onChange={(e) => { setContent(e.target.value); autoResize(); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t("Compartilhe um momento...")}
              aria-label={t("Compartilhe um momento")}
              className="create-post-textarea"
              rows={3}
            />
          </div>

          {preview && (
            <div className="create-post-preview">
              <img src={preview} alt={t("Prévia da imagem selecionada")} />
              <button type="button" className="create-post-remove-image" aria-label={t("Remover imagem")} title={t("Remover imagem")} disabled={sending} onClick={() => { setImage(null); setUploadedUrl(undefined); setError(''); }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
            </div>
          )}
          {!commentsEnabled && <p className="create-post-image-help" role="status">{t("Comentários desativados para este momento.")}</p>}
          {error && <p className="create-post-error" role="alert">{error}</p>}
          {notice && <p className="create-post-image-help" role="status">{notice}</p>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={sending} onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ''; }} />
          {(
            <div className="create-post-footer">
              <ReportButton targetType="POST" targetId="" canReport={false} menuActions={[{ label: t("Permitir comentários"), checked: commentsEnabled, disabled: sending, onSelect: () => setCommentsEnabled(value => !value) }]} />
              <button type="button" className="create-post-emoji-button" disabled={sending} onClick={() => fileRef.current?.click()} aria-label={image ? t("Trocar imagem ou GIF, até 5 MB") : t("Adicionar imagem ou GIF, até 5 MB")} title={t("Imagem ou GIF • até 5 MB")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-6 5 7" /></svg>
              </button>
              <div ref={emojiRef} className="create-post-emoji-wrap">
                <button
                  type="button"
                  className="create-post-emoji-button"
                  disabled={sending}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  aria-label={t("Adicionar emoji")}
                  aria-expanded={showEmojiPicker}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M8 14s1 3 4 3 4-3 4-3" /><path d="M8 9h.01M16 9h.01" strokeWidth="3" /></svg>
                </button>
                {showEmojiPicker && <Suspense fallback={<span role="status">{t("Carregando emojis…")}</span>}><EmojiPickerDialog onSelect={insertEmoji} onClose={() => { setShowEmojiPicker(false); requestAnimationFrame(() => emojiRef.current?.querySelector('button')?.focus()); }} /></Suspense>}
              </div>
              <div className="create-post-counter-wrap">
                <span
                  className="create-post-counter"
                  style={{
                    color: isOverLimit ? 'var(--danger)' : remaining < 30 ? '#f59e0b' : 'var(--text-muted)',
                  }}
                >
                  {remaining}
                </span>
                <span className="create-post-counter-total">/ {MAX_CHARS}</span>
              </div>

              <button
                type="submit"
                disabled={isEmpty || isOverLimit || sending}
                className="create-post-submit"
              >
                {uploading ? t("Enviando imagem...") : sending ? t("Postando...") : t("Postar")}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
