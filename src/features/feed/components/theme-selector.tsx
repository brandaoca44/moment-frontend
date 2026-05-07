import { useTheme, themes, type Theme, type ThemeId } from '@/contexts/theme-context';

function ThemePreview({ item }: { item: Theme }) {
  const c = item.colors;

  return (
    <span className="theme-preview" style={{ background: c.bg, borderColor: c.border }}>
      <span className="theme-preview-sidebar" style={{ background: c.surface }} />
      <span className="theme-preview-main">
        <span className="theme-preview-pill" style={{ background: c.amethyst }} />
        <span className="theme-preview-card" style={{ background: c.surface, borderColor: c.border }}>
          <span style={{ background: c.textSoft }} />
          <span style={{ background: c.textMuted }} />
        </span>
      </span>
    </span>
  );
}

export function ThemeSelector({ standalone = false }: { standalone?: boolean }) {
  const { themeId, setTheme } = useTheme();

  const inner = (
    <>
      <style>{`
        .theme-selector {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .theme-option {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-height: 142px;
          padding: 12px;
          border-radius: 22px;
          border: 1px solid var(--border-soft);
          background: var(--surface-elevated);
          color: var(--text);
          cursor: pointer;
          text-align: left;
          overflow: hidden;
          box-shadow: var(--shadow-xs);
          transition:
            transform 190ms var(--ease-premium),
            border-color 190ms ease,
            background 190ms ease,
            box-shadow 190ms ease;
        }

        .theme-option::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(167, 139, 250, 0.16), transparent 42%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 190ms ease;
        }

        .theme-option:hover {
          transform: translateY(-2px);
          border-color: var(--amethyst-border);
          box-shadow: var(--shadow-sm);
        }

        .theme-option:hover::before,
        .theme-option.active::before {
          opacity: 1;
        }

        .theme-option.active {
          border-color: var(--amethyst);
          box-shadow: var(--shadow-amethyst);
        }

        .theme-preview {
          position: relative;
          display: grid;
          grid-template-columns: 26px 1fr;
          height: 72px;
          border-radius: 17px;
          border: 1px solid;
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .theme-preview-sidebar {
          opacity: 0.82;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .theme-preview-main {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 10px;
        }

        .theme-preview-pill {
          width: 46px;
          height: 8px;
          border-radius: 999px;
        }

        .theme-preview-card {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          flex: 1;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid;
        }

        .theme-preview-card span {
          display: block;
          height: 5px;
          border-radius: 999px;
          opacity: 0.72;
        }

        .theme-preview-card span:first-child {
          width: 70%;
        }

        .theme-preview-card span:last-child {
          width: 46%;
          opacity: 0.5;
        }

        .theme-option-footer {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .theme-option-name {
          display: block;
          font-size: 14px;
          font-weight: 900;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .theme-option-desc {
          display: block;
          margin-top: 2px;
          font-size: 12px;
          line-height: 1.35;
          color: var(--text-muted);
          font-weight: 650;
        }

        .theme-check {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          box-shadow: var(--shadow-amethyst);
          opacity: 0;
          transform: scale(0.82);
          transition: all 180ms var(--ease-premium);
          flex-shrink: 0;
        }

        .theme-option.active .theme-check {
          opacity: 1;
          transform: scale(1);
        }

        .theme-selector-shell {
          border-radius: 24px;
          padding: 16px;
          border: 1px solid var(--border-soft);
          background: var(--surface-glass);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(20px);
        }

        .theme-selector-title {
          margin: 0 0 12px;
          font-size: 12px;
          font-weight: 900;
          color: var(--amethyst);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'DM Sans', sans-serif;
        }

        @media (max-width: 560px) {
          .theme-selector {
            grid-template-columns: 1fr;
          }

          .theme-option {
            min-height: auto;
          }
        }
      `}</style>

      {standalone ? <p className="theme-selector-title">Mude o tema</p> : null}

      <div className="theme-selector">
        {Object.values(themes).map((item) => {
          const active = themeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTheme(item.id as ThemeId)}
              title={item.description}
              className={`theme-option${active ? ' active' : ''}`}
              aria-pressed={active}
            >
              <ThemePreview item={item} />

              <span className="theme-option-footer">
                <span>
                  <span className="theme-option-name">{item.name}</span>
                  <span className="theme-option-desc">{item.description}</span>
                </span>
                <span className="theme-check">✓</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  if (!standalone) return <div>{inner}</div>;

  return <div className="theme-selector-shell">{inner}</div>;
}
