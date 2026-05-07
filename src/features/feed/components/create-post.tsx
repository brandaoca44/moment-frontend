import { useState, useRef } from 'react';
import { useMe } from '@/features/auth/hooks/use-me';
import { useCreatePost } from '../hooks/use-create-post';

const MAX_CHARS = 220;

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmpty || isOverLimit || createPost.isPending) return;
    try {
      await createPost.mutateAsync({ content: content.trim() });
      setContent('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch {
      // erro tratado abaixo
    }
  }

  if (!user) return null;

  return (
    <>
      <style>{`
        .create-post-box {
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
          border: none;
          outline: none;
          resize: none;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-soft);
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          padding-top: 8px;
          overflow-y: hidden;
          min-height: 42px;
        }

        .create-post-textarea::placeholder { color: var(--text-muted); }

        .create-post-footer {
          display: flex;
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
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }

        .create-post-counter-total {
          font-size: 12px;
          color: var(--text-muted);
          font-family: 'DM Sans', sans-serif;
        }

        .create-post-error {
          font-size: 13px;
          color: var(--danger);
          font-family: 'DM Sans', sans-serif;
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
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 14px rgba(124,58,237,0.28);
          transition: opacity 0.2s, transform 0.15s;
        }

        .create-post-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className={`create-post-box${focused ? ' focused' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="create-post-row">
            <Avatar name={user.name} avatar={user.avatar} />
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => { setContent(e.target.value); autoResize(); }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Compartilhe um momento..."
              className="create-post-textarea"
              rows={1}
            />
          </div>

          {(focused || content.length > 0) && (
            <div className="create-post-footer">
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

              {createPost.isError && (
                <span className="create-post-error">
                  {createPost.error instanceof Error
                    ? createPost.error.message
                    : 'Erro ao publicar.'}
                </span>
              )}

              <button
                type="submit"
                disabled={isEmpty || isOverLimit || createPost.isPending}
                className="create-post-submit"
              >
                {createPost.isPending ? 'Postando...' : 'Postar'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
