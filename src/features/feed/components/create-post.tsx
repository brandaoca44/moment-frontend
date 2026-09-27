import { useEffect, useState, useRef } from 'react';
import { uploadPostImage } from '../api/feed';
import { useMe } from '@/features/auth/hooks/use-me';
import { useCreatePost } from '../hooks/use-create-post';

const MAX_CHARS = 220;
const EMOJIS = ['😀', '😂', '😍', '🥹', '😎', '🤔', '🎉', '✨', '❤️', '👍', '🙌', '🔥'];

function Avatar({ name, avatar }: { name: string; avatar: string | null }) {
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
  const { data: meData } = useMe();
  const createPost = useCreatePost();
  const [content, setContent] = useState('');
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

  useEffect(() => {
    if (!showEmojiPicker) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !emojiRef.current?.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowEmojiPicker(false);
        emojiRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    if (!image) { setPreview(''); return; }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  function selectImage(file?: File) {
    if (!file || sendingRef.current) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Escolha uma imagem JPG, PNG, WebP ou GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024 || file.size === 0) {
      setError('Escolha uma imagem válida de até 5 MB.');
      return;
    }
    setImage(file);
    setUploadedUrl(undefined);
    setError('');
  }

  const user = meData?.data?.user;
  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0;

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
    try {
      let imageUrl = uploadedUrl;
      if (image && !imageUrl) {
        setUploading(true);
        imageUrl = await uploadPostImage(image);
        setUploadedUrl(imageUrl);
        setUploading(false);
      }
      await createPost.mutateAsync({ content: content.trim(), ...(imageUrl ? { imageUrl } : {}) });
      setContent('');
      setImage(null);
      setUploadedUrl(undefined);
      setShowEmojiPicker(false);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível publicar. Tente novamente.');
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
          padding: 18px 20px;
          margin-bottom: 20px;
          transition: box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
        }

        .create-post-box.focused {
          box-shadow: 0 0 0 2px var(--amethyst-border);
        }

        .create-post-row { display: flex; gap: 14px; align-items: flex-start; }

        .create-post-textarea {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          resize: none;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-soft);
          background: transparent;
          font-family: 'Inter', sans-serif;
          padding-top: 8px;
          overflow-y: hidden;
          min-height: 42px;
        }

        .create-post-textarea::placeholder { color: var(--text-muted); }

        .create-post-footer {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        .create-post-counter-wrap { display: flex; align-items: baseline; gap: 2px; }

        .create-post-counter {
          font-size: 14px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          transition: color 0.2s;
        }

        .create-post-counter-total {
          font-size: 12px;
          color: var(--text-muted);
          font-family: 'Inter', sans-serif;
        }

        .create-post-error {
          font-size: 13px;
          color: var(--danger);
          font-family: 'Inter', sans-serif;
        }

        .create-post-submit {
          height: 38px;
          padding: 0 20px;
          border-radius: 100px;
          border: none;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 4px 14px rgba(124,58,237,0.28);
          transition: opacity 0.2s, transform 0.15s;
        }

        .create-post-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .create-post-emoji-wrap { margin-right: auto; }
        .create-post-emoji-button {
          height: 34px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface-soft);
          color: var(--text-soft);
          cursor: pointer;
          font-size: 18px;
        }
        .create-post-emoji-picker {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 0;
          z-index: 4;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 4px;
          width: 220px;
          max-width: 100%;
          padding: 8px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          box-shadow: var(--shadow-card);
        }
        .create-post-emoji-picker button {
          border: 0;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          font-size: 20px;
          line-height: 1.5;
        }
        .create-post-emoji-picker button:hover { background: var(--amethyst-bg); }
        .create-post-preview { margin-top: 12px; }
        .create-post-preview img { display: block; max-width: 100%; max-height: 300px; border-radius: 12px; object-fit: contain; }
        .create-post-image-help { font-size: 12px; color: var(--text-muted); }
        .create-post-error { overflow-wrap: anywhere; }
        @media (max-width: 520px) {
          .create-post-box { padding: 16px 12px; border-radius: 16px; }
          .create-post-row { gap: 10px; }
          .create-post-footer { gap: 8px; }
          .create-post-submit { max-width: 100%; height: auto; min-height: 38px; padding: 8px 14px; }
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
              placeholder="Compartilhe um momento..."
              className="create-post-textarea"
              rows={1}
            />
          </div>

          {preview && (
            <div className="create-post-preview">
              <img src={preview} alt="Prévia da imagem selecionada" />
              <button type="button" disabled={sending} onClick={() => { setImage(null); setUploadedUrl(undefined); setError(''); }}>Remover imagem</button>
            </div>
          )}
          <p className="create-post-image-help">Imagem ou GIF • até 5 MB</p>
          {error && <p className="create-post-error" role="alert">{error}</p>}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden disabled={sending} onChange={(event) => { selectImage(event.target.files?.[0]); event.target.value = ''; }} />
          {(
            <div className="create-post-footer">
              <button type="button" className="create-post-emoji-button" disabled={sending} onClick={() => fileRef.current?.click()} aria-label={image ? 'Trocar imagem' : 'Adicionar imagem'} title={image ? 'Trocar imagem' : 'Adicionar imagem'}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1" /><path d="m3 17 5-5 4 4 4-6 5 7" /></svg>
              </button>
              <div ref={emojiRef} className="create-post-emoji-wrap">
                <button
                  type="button"
                  className="create-post-emoji-button"
                  disabled={sending}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowEmojiPicker((open) => !open)}
                  aria-label="Adicionar emoji"
                  aria-expanded={showEmojiPicker}
                >
                  🙂
                </button>
                {showEmojiPicker && (
                  <div className="create-post-emoji-picker" role="group" aria-label="Emojis">
                    {EMOJIS.map((emoji) => (
                      <button key={emoji} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => insertEmoji(emoji)}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
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
                {uploading ? 'Enviando imagem...' : sending ? 'Postando...' : 'Postar'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
