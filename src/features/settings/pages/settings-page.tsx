import { useState } from 'react';
import { useMe } from '@/features/auth/hooks/use-me';
import { useUpdateMe } from '../hooks/use-update-me';
import { useUpdatePassword } from '../hooks/use-update-password';
import { useDeleteMe } from '../hooks/use-delete-me';
import { ThemeSelector } from '@/features/feed/components/theme-selector';

type Section = 'profile' | 'appearance' | 'password' | 'danger';

type SettingsUser =
  | {
      name: string;
      username: string;
      email: string;
      avatar: string | null;
    }
  | undefined;

function IconPalette() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" />
      <circle cx="17.5" cy="10.5" r="1.5" />
      <circle cx="8.5" cy="7.5" r="1.5" />
      <circle cx="6.5" cy="12.5" r="1.5" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconDanger() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

const menuItems: Array<{ id: Section; label: string; description: string; icon: JSX.Element }> = [
  {
    id: 'profile',
    label: 'Perfil',
    description: 'Nome e username',
    icon: <IconProfile />,
  },
  {
    id: 'appearance',
    label: 'Aparência',
    description: 'Tema e visual',
    icon: <IconPalette />,
  },
  {
    id: 'password',
    label: 'Senha',
    description: 'Segurança da conta',
    icon: <IconLock />,
  },
  {
    id: 'danger',
    label: 'Conta',
    description: 'Ações sensíveis',
    icon: <IconDanger />,
  },
];

export function SettingsPage() {
  const { data: meData } = useMe();
  const user = meData?.data?.user;

  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <>
      <style>{`
        .settings-page {
          position: relative;
          max-width: 820px;
          margin: 0 auto;
          font-family: 'DM Sans', sans-serif;
          animation: settingsFadeIn 260ms var(--ease-premium) both;
        }

        .settings-page::before {
          content: '';
          position: fixed;
          top: -180px;
          left: 56%;
          width: 680px;
          height: 680px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.10), transparent 70%);
          transform: translateX(-50%);
          pointer-events: none;
          z-index: -1;
          filter: blur(42px);
        }

        .settings-hero {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          padding: 30px;
          margin-bottom: 24px;
          background: var(--surface-glass);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-md);
          display: flex;
          align-items: center;
          gap: 20px;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .settings-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at top right, rgba(167, 139, 250, 0.22), transparent 42%),
            linear-gradient(135deg, var(--glass-highlight), transparent 56%);
          pointer-events: none;
        }

        .settings-avatar {
          position: relative;
          z-index: 1;
          width: 74px;
          height: 74px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          overflow: hidden;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          box-shadow: var(--shadow-amethyst);
          border: 4px solid var(--glass-highlight);
          color: #fff;
          font-weight: 950;
          font-size: 24px;
          letter-spacing: -0.04em;
        }

        .settings-hero-content {
          position: relative;
          z-index: 1;
        }

        .settings-kicker {
          margin: 0 0 5px;
          font-size: 12px;
          font-weight: 950;
          color: var(--amethyst);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .settings-title {
          margin: 0;
          font-size: clamp(30px, 5vw, 38px);
          line-height: 1.12;
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          letter-spacing: -0.012em;
          color: var(--text);
        }

        .settings-subtitle {
          margin: 10px 0 0;
          max-width: 560px;
          font-size: 14.5px;
          line-height: 1.65;
          color: var(--text-muted);
          font-weight: 600;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 228px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .settings-menu {
          position: sticky;
          top: 24px;
          padding: 10px;
          border-radius: 26px;
          background: var(--surface-glass);
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .settings-menu-item {
          position: relative;
          overflow: hidden;
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px;
          border-radius: 19px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          color: var(--text-soft);
          text-align: left;
          transition:
            transform 180ms var(--ease-premium),
            background 180ms ease,
            border-color 180ms ease,
            color 180ms ease,
            box-shadow 180ms ease;
        }

        .settings-menu-item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top left, rgba(167, 139, 250, 0.18), transparent 48%);
          opacity: 0;
          pointer-events: none;
          transition: opacity 180ms ease;
        }

        .settings-menu-item:hover {
          transform: translateY(-1px);
          background: var(--surface-elevated);
          color: var(--amethyst);
          border-color: var(--border-soft);
        }

        .settings-menu-item:hover::before,
        .settings-menu-item.active::before {
          opacity: 1;
        }

        .settings-menu-item.active {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.14), rgba(167, 139, 250, 0.08));
          border-color: rgba(167, 139, 250, 0.26);
          color: var(--amethyst);
          box-shadow: var(--shadow-amethyst);
        }

        .settings-menu-item.danger {
          color: var(--danger);
        }

        .settings-menu-icon {
          position: relative;
          z-index: 1;
          width: 38px;
          height: 38px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          background: var(--surface-elevated);
          border: 1px solid var(--border-soft);
          flex-shrink: 0;
        }

        .settings-menu-label {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .settings-menu-label strong {
          font-size: 14px;
          font-weight: 850;
        }

        .settings-menu-label span {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 650;
        }

        .settings-section {
          position: relative;
          overflow: hidden;
          padding: 30px;
          border-radius: 28px;
          background: var(--surface-glass);
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-card);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          animation: sectionIn 220ms var(--ease-premium) both;
        }

        .settings-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--glass-highlight), transparent 52%);
          pointer-events: none;
        }

        .settings-section > * {
          position: relative;
          z-index: 1;
        }

        .settings-section-header {
          margin-bottom: 24px;
        }

        .settings-section-title {
          margin: 0;
          font-size: 23px;
          line-height: 1.22;
          font-family: 'Instrument Serif', serif;
          font-weight: 400;
          letter-spacing: -0.01em;
          color: var(--text);
        }

        .settings-section-subtitle {
          margin: 8px 0 0;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 600;
          line-height: 1.65;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .settings-label {
          font-size: 13px;
          font-weight: 900;
          color: var(--text);
          letter-spacing: -0.01em;
        }

        .settings-input {
          width: 100%;
          height: 52px;
          border-radius: 18px;
          border: 1px solid var(--border-soft);
          background: var(--surface-elevated);
          padding: 0 16px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 650;
          color: var(--text);
          outline: none;
          box-shadow: var(--shadow-xs);
          transition:
            border-color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            transform 180ms var(--ease-premium);
        }

        .settings-input::placeholder {
          color: var(--text-muted);
          opacity: 0.72;
        }

        .settings-input:focus {
          border-color: var(--amethyst-border);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10), var(--shadow-xs);
          transform: translateY(-1px);
        }

        .settings-input.disabled {
          background: var(--surface-glass);
          color: var(--text-muted);
          cursor: not-allowed;
          opacity: 0.85;
        }

        .settings-hint {
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 650;
          line-height: 1.5;
        }

        .settings-at-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .settings-at {
          position: absolute;
          left: 16px;
          color: var(--amethyst);
          font-size: 15px;
          font-weight: 950;
          pointer-events: none;
          z-index: 2;
        }

        .settings-primary-button,
        .settings-secondary-button,
        .settings-danger-button {
          transition:
            transform 180ms var(--ease-premium),
            box-shadow 180ms ease,
            background 180ms ease,
            border-color 180ms ease,
            color 180ms ease,
            opacity 180ms ease;
        }

        .settings-primary-button {
          height: 50px;
          width: fit-content;
          padding: 0 26px;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          color: #fff;
          font-size: 14.5px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 950;
          box-shadow: var(--shadow-amethyst);
        }

        .settings-primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 42px rgba(124, 58, 237, 0.24);
        }

        .settings-primary-button:disabled,
        .settings-danger-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .settings-secondary-button {
          height: 46px;
          padding: 0 20px;
          border-radius: 999px;
          border: 1px solid var(--border-soft);
          background: var(--surface-elevated);
          color: var(--text-soft);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 850;
          cursor: pointer;
          box-shadow: var(--shadow-xs);
        }

        .settings-secondary-button:hover {
          transform: translateY(-1px);
          border-color: var(--amethyst-border);
          color: var(--amethyst);
        }

        .settings-danger-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 22px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          box-shadow: var(--shadow-danger);
        }

        .settings-danger-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.22), transparent 42%);
          pointer-events: none;
        }

        .settings-danger-card > * {
          position: relative;
          z-index: 1;
        }

        .settings-danger-title {
          margin: 0 0 7px;
          font-size: 15px;
          color: var(--danger);
          font-weight: 950;
        }

        .settings-danger-text {
          margin: 0;
          font-size: 14px;
          color: var(--text-soft);
          font-weight: 650;
          line-height: 1.7;
        }

        .settings-danger-button {
          height: 46px;
          width: fit-content;
          padding: 0 20px;
          border-radius: 999px;
          border: 1px solid var(--danger-border);
          background: var(--danger-bg);
          color: var(--danger);
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 950;
          cursor: pointer;
          box-shadow: var(--shadow-xs);
        }

        .settings-danger-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-danger);
        }

        .settings-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .settings-feedback {
          border-radius: 18px;
          padding: 13px 15px;
          font-size: 13.5px;
          font-weight: 800;
          line-height: 1.5;
          box-shadow: var(--shadow-xs);
        }

        .settings-feedback.error {
          background: var(--danger-bg);
          color: var(--danger);
          border: 1px solid var(--danger-border);
        }

        .settings-feedback.success {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid var(--success-border);
        }

        @keyframes settingsFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sectionIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 760px) {
          .settings-hero {
            align-items: flex-start;
            padding: 24px;
            border-radius: 28px;
          }

          .settings-avatar {
            width: 62px;
            height: 62px;
            font-size: 21px;
          }

          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-menu {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .settings-section {
            padding: 24px;
          }
        }

        @media (max-width: 520px) {
          .settings-hero {
            flex-direction: column;
          }

          .settings-menu {
            grid-template-columns: 1fr;
          }

          .settings-primary-button,
          .settings-secondary-button,
          .settings-danger-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="settings-page">
        <header className="settings-hero">
          <div className="settings-avatar">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>

          <div className="settings-hero-content">
            <p className="settings-kicker">Configurações</p>
            <h1 className="settings-title">Seu espaço no Moment</h1>
            <p className="settings-subtitle">
              Ajuste sua conta com calma. O Moment foi feito para parecer leve,
              seguro e confortável.
            </p>
          </div>
        </header>

        <div className="settings-layout">
          <aside className="settings-menu">
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={[
                  'settings-menu-item',
                  activeSection === item.id ? 'active' : '',
                  item.id === 'danger' ? 'danger' : '',
                ].join(' ')}
              >
                <span className="settings-menu-icon">{item.icon}</span>
                <span className="settings-menu-label">
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </span>
              </button>
            ))}
          </aside>

          <main>
            {activeSection === 'profile' && <ProfileSection user={user} />}
            {activeSection === 'appearance' && <AppearanceSection />}
            {activeSection === 'password' && <PasswordSection />}
            {activeSection === 'danger' && (
              <DangerSection
                showConfirm={showDeleteConfirm}
                setShowConfirm={setShowDeleteConfirm}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

function AppearanceSection() {
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Aparência</h2>
        <p className="settings-section-subtitle">
          Escolha o tema que combina com o seu momento. Cada opção mantém a leitura confortável.
        </p>
      </div>
      <ThemeSelector />
    </section>
  );
}

function ProfileSection({ user }: { user: SettingsUser }) {
  const updateMe = useUpdateMe();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    try {
      await updateMe.mutateAsync({ name, username });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // tratado pelo isError
    }
  }

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Informações do perfil</h2>
        <p className="settings-section-subtitle">
          Atualize como as pessoas veem você dentro do Moment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <label className="settings-field">
          <span className="settings-label">Nome completo</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="settings-input"
            placeholder="Seu nome"
            required
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">Username</span>
          <div className="settings-at-wrap">
            <span className="settings-at">@</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="settings-input"
              style={{ paddingLeft: 34 }}
              placeholder="seuusername"
              required
            />
          </div>
          <span className="settings-hint">
            Use apenas letras, números e underscore.
          </span>
        </label>

        <label className="settings-field">
          <span className="settings-label">E-mail</span>
          <input
            value={user?.email ?? ''}
            className="settings-input disabled"
            disabled
          />
          <span className="settings-hint">
            O e-mail fica protegido e não pode ser alterado por aqui.
          </span>
        </label>

        {updateMe.isError ? (
          <div className="settings-feedback error">
            {updateMe.error instanceof Error
              ? updateMe.error.message
              : 'Erro ao atualizar perfil.'}
          </div>
        ) : null}

        {success ? (
          <div className="settings-feedback success">
            Perfil atualizado com sucesso.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={updateMe.isPending}
          className="settings-primary-button"
        >
          {updateMe.isPending ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const updatePassword = useUpdatePassword();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [matchError, setMatchError] = useState('');

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setMatchError('');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMatchError('As senhas não coincidem.');
      return;
    }

    try {
      await updatePassword.mutateAsync({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
    } catch {
      // tratado pelo isError
    }
  }

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">Segurança da conta</h2>
        <p className="settings-section-subtitle">
          Ao alterar a senha, sua sessão será encerrada para manter sua conta segura.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <label className="settings-field">
          <span className="settings-label">Senha atual</span>
          <input
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            className="settings-input"
            placeholder="••••••••"
            required
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">Nova senha</span>
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            className="settings-input"
            placeholder="Mínimo 8 caracteres"
            required
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">Confirmar nova senha</span>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            className="settings-input"
            placeholder="••••••••"
            required
          />
          {matchError ? (
            <span className="settings-hint" style={{ color: 'var(--danger)' }}>
              {matchError}
            </span>
          ) : null}
        </label>

        {updatePassword.isError ? (
          <div className="settings-feedback error">
            {updatePassword.error instanceof Error
              ? updatePassword.error.message
              : 'Erro ao alterar senha.'}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={updatePassword.isPending}
          className="settings-primary-button"
        >
          {updatePassword.isPending ? 'Alterando...' : 'Alterar senha'}
        </button>
      </form>
    </section>
  );
}

function DangerSection({
  showConfirm,
  setShowConfirm,
}: {
  showConfirm: boolean;
  setShowConfirm: (value: boolean) => void;
}) {
  const deleteMe = useDeleteMe();
  const [password, setPassword] = useState('');

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title" style={{ color: 'var(--danger)' }}>
          Encerrar conta
        </h2>
        <p className="settings-section-subtitle">
          Esta área existe para proteger você de ações impulsivas. Pense com calma.
        </p>
      </div>

      <div className="settings-danger-card">
        <p className="settings-danger-title">Deletar minha conta</p>
        <p className="settings-danger-text">
          Todos os seus dados, posts, relações sociais e informações serão removidos
          permanentemente. Esta ação não pode ser desfeita.
        </p>

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="settings-danger-button"
            style={{ marginTop: 16 }}
          >
            Deletar minha conta
          </button>
        ) : (
          <div className="settings-form" style={{ marginTop: 18 }}>
            <label className="settings-field">
              <span className="settings-label">Confirme sua senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="settings-input"
                placeholder="Sua senha atual"
              />
            </label>

            <p className="settings-danger-text" style={{ color: 'var(--danger)' }}>
              Ao confirmar, sua conta será removida permanentemente.
            </p>

            <div className="settings-actions">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword('');
                }}
                className="settings-secondary-button"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => deleteMe.mutate({ password })}
                disabled={deleteMe.isPending || password.length < 6}
                className="settings-danger-button"
              >
                {deleteMe.isPending ? 'Deletando...' : 'Confirmar exclusão'}
              </button>
            </div>

            {deleteMe.isError ? (
              <div className="settings-feedback error">
                {deleteMe.error instanceof Error
                  ? deleteMe.error.message
                  : 'Erro ao deletar conta.'}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function getInitials(name?: string) {
  if (!name) return '?';

  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
