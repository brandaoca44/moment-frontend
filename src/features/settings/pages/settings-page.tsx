import { t, useLanguage } from '@/i18n';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useMe } from '@/features/auth/hooks/use-me';
import { useUpdateMe } from '../hooks/use-update-me';
import { useUpdateAvatar } from '../hooks/use-update-avatar';
import { useUpdatePassword } from '../hooks/use-update-password';
import { useDeleteMe } from '../hooks/use-delete-me';
import { ThemeSelector } from '@/features/feed/components/theme-selector';
import { ProfileBlock } from '@/features/profile/components/profile-block';
import { ContentPreferences } from '@/features/profile/components/content-preference';
import { EmailConfirmation } from '@/features/profile/components/email-confirmation';
import { PositiveMarks } from '@/features/stations/positive-marks';
import { LanguagePicker } from '@/i18n/language-picker';
import { Globe } from 'lucide-react';
import { RecommendationPreferencesPanel } from '@/features/feed/components/recommendation-preferences';

type Section = 'profile' | 'appearance' | 'password' | 'privacy' | 'danger' | 'language';

type SettingsUser =
  | {
      id: string;
      name: string;
      username: string;
      email: string;
      avatar: string | null;
    }
  | undefined;

function IconPalette() {
  useLanguage();
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
  useLanguage();
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function IconLock() {
  useLanguage();
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function IconDanger() {
  useLanguage();
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

const menuItems: Array<{ id: Section; label: string; description: string; icon: ReactElement }> = [
  {
    id: 'profile',
    get label() { return t("Perfil"); },
    get description() { return t("Nome e username"); },
    icon: <IconProfile />,
  },
  {
    id: 'appearance',
    get label() { return t("Aparência"); },
    get description() { return t("Tema e visual"); },
    icon: <IconPalette />,
  },
  { id: 'language', get label() { return t('Idiomas'); }, get description() { return t('Escolha o idioma do Moment.'); }, icon: <Globe size={18} /> },
  {
    id: 'password',
    get label() { return t("Segurança"); },
    get description() { return t("Segurança da conta"); },
    icon: <IconLock />,
  },
  {
    id: 'privacy',
    get label() { return t("Privacidade"); },
    get description() { return t("Bloqueios e conteúdo"); },
    icon: <IconLock />,
  },
  {
    id: 'danger',
    get label() { return t("Conta"); },
    get description() { return t("Ações sensíveis"); },
    icon: <IconDanger />,
  },
];

export function SettingsPage() {
  useLanguage();
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
          font-family: var(--font-ui);
          animation: settingsFadeIn 260ms var(--ease-premium) both;
        }

        .settings-page::before {
          content: '';
          position: fixed;
          top: -180px;
          left: 56%;
          width: 680px;
          max-width: 100vw;
          height: 680px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(var(--accent-rgb, 124, 58, 237), 0.10), transparent 70%);
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
          background: var(--panel-background, var(--surface-glass));
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
            radial-gradient(circle at top right, rgba(var(--accent-soft-rgb, 167, 139, 250), 0.22), transparent 42%),
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

        .settings-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          font-family: var(--font-ui);
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
          background: var(--panel-background, var(--surface-glass));
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-sm);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .settings-menu-item {
          font-family: var(--font-ui);
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
          background: radial-gradient(circle at top left, rgba(var(--accent-soft-rgb, 167, 139, 250), 0.18), transparent 48%);
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
          background: linear-gradient(135deg, rgba(var(--accent-rgb, 124, 58, 237), 0.14), rgba(var(--accent-soft-rgb, 167, 139, 250), 0.08));
          border-color: rgba(var(--accent-soft-rgb, 167, 139, 250), 0.26);
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
          font-size: 15px;
          font-weight: 750;
          line-height: 1.35;
        }

        .settings-menu-label span {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 400;
          line-height: 1.4;
        }

        .settings-section {
          position: relative;
          overflow: hidden;
          padding: 30px;
          border-radius: 28px;
          background: var(--panel-background, var(--surface-glass));
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
          font-family: var(--font-ui);
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

        .settings-avatar-panel {
          display: grid;
          grid-template-columns: 92px minmax(0, 1fr);
          gap: 18px;
          align-items: center;
          padding: 18px;
          margin-bottom: 20px;
          border-radius: 24px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-soft);
          box-shadow: var(--shadow-xs);
        }

        .settings-avatar-preview {
          width: 92px;
          height: 92px;
          border-radius: 30px;
          display: grid;
          place-items: center;
          overflow: hidden;
          color: #fff;
          font-size: 28px;
          font-weight: 950;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, var(--amethyst), var(--amethyst-light));
          border: 4px solid var(--glass-highlight);
          box-shadow: var(--shadow-amethyst);
        }

        .settings-avatar-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .settings-avatar-copy {
          min-width: 0;
        }

        .settings-avatar-title {
          margin: 0;
          color: var(--text);
          font-size: 15px;
          font-weight: 950;
          letter-spacing: -0.01em;
        }

        .settings-avatar-description {
          margin: 6px 0 0;
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.6;
          font-weight: 650;
        }

        .settings-avatar-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .settings-file-input {
          display: none;
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
          font-family: var(--font-ui);
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

        .settings-input.with-at {
          padding-left: 34px;
        }

        .settings-input::placeholder {
          color: var(--text-muted);
          opacity: 0.72;
        }

        .settings-input:focus {
          border-color: var(--amethyst-border);
          box-shadow: 0 0 0 4px rgba(var(--accent-rgb, 124, 58, 237), 0.10), var(--shadow-xs);
          transform: translateY(-1px);
        }

        .settings-input.disabled {
          background: var(--panel-background, var(--surface-glass));
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
          font-family: var(--font-ui);
          font-weight: 950;
          box-shadow: var(--shadow-amethyst);
        }

        .settings-primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 18px 42px rgba(var(--accent-rgb, 124, 58, 237), 0.24);
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
          font-family: var(--font-ui);
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
          font-family: var(--font-ui);
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

          .settings-avatar-panel {
            grid-template-columns: 1fr;
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
                className="settings-avatar-image"
              />
            ) : (
              getInitials(user?.name)
            )}
          </div>

          <div className="settings-hero-content">
            <p className="settings-kicker">{t("Configurações")}</p>
            <h1 className="settings-title">{t("Seu espaço no Moment")}</h1>
            <p className="settings-subtitle">
              {t(" Ajuste sua conta com calma. O Moment foi feito para parecer leve, seguro e confortável. ")}</p>
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
            {activeSection === 'profile' && <><ProfileSection user={user} />{user && <section className="settings-section" style={{ marginTop: 20 }}><PositiveMarks userId={user.id} own settings /></section>}</>}
            {activeSection === 'appearance' && <AppearanceSection />}
            {activeSection === 'language' && <section className="settings-section"><h2>{t('Idiomas')}</h2><p>{t('Escolha o idioma do Moment.')}</p><LanguagePicker /></section>}
            {activeSection === 'password' && <><PasswordSection /><section className="settings-section" style={{ marginTop: 20 }}><EmailConfirmation /></section></>}
            {activeSection === 'privacy' && <section className="settings-section">
              <div className="settings-section-header"><h2 className="settings-section-title">{t("Privacidade e conteúdo")}</h2><p className="settings-section-subtitle">{t("Gerencie quem pode interagir com você e o que aparece nas suas listas.")}</p></div>
              <ProfileBlock />
              <ContentPreferences />
              <RecommendationPreferencesPanel />
            </section>}
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
  useLanguage();
  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">{t("Aparência")}</h2>
        <p className="settings-section-subtitle">
          {t(" Escolha o tema que combina com o seu momento. Cada opção mantém a leitura confortável. ")}</p>
      </div>
      <ThemeSelector />
    </section>
  );
}

function ProfileSection({ user }: { user: SettingsUser }) {
  useLanguage();
  const updateMe = useUpdateMe();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? '');
  const [success, setSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setUsername(user?.username ?? '');
    setAvatarPreview(user?.avatar ?? '');
  }, [user?.name, user?.username, user?.avatar]);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess('');

    const normalizedUsername = username.trim().replace(/^@/, '');

    try {
      await updateMe.mutateAsync({
        name: name.trim(),
        username: normalizedUsername,
      });

      setUsername(normalizedUsername);
      setSuccess(t("Perfil atualizado com sucesso."));
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // tratado pelo isError
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setAvatarError('');
    setSuccess('');

    if (!file.type.startsWith('image/')) {
      setAvatarError(t("Escolha uma imagem válida para o avatar."));
      return;
    }

    const maxSizeInMb = 5;

    if (file.size > maxSizeInMb * 1024 * 1024) {
      setAvatarError(`A imagem precisa ter até ${maxSizeInMb}MB.`);
      return;
    }

    const nextPreview = URL.createObjectURL(file);

    setAvatarPreview((current) => {
      if (current.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }

      return nextPreview;
    });

    try {
      await updateAvatar.mutateAsync(file);
      setSuccess(t("Foto de perfil atualizada com sucesso."));
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      // tratado pelo isError
    }
  }

  const normalizedUsername = username.trim().replace(/^@/, '');
  const hasProfileChanges =
    name.trim() !== (user?.name ?? '') ||
    normalizedUsername !== (user?.username ?? '');

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title">{t("Informações do perfil")}</h2>
        <p className="settings-section-subtitle">
          {t(" Atualize sua presença no Moment com calma. Nome, username e foto devem parecer seus. ")}</p>
      </div>

      <div className="settings-avatar-panel">
        <div className="settings-avatar-preview">
          {avatarPreview ? (
            <img src={avatarPreview} alt={user?.name ?? 'Avatar'} />
          ) : (
            getInitials(user?.name)
          )}
        </div>

        <div className="settings-avatar-copy">
          <p className="settings-avatar-title">{t("Foto de perfil")}</p>
          <p className="settings-avatar-description">
            {t(" Escolha uma imagem limpa e confortável para o seu Moment. ")}</p>

          <div className="settings-avatar-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="settings-file-input"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              className="settings-secondary-button"
              onClick={() => fileInputRef.current?.click()}
              disabled={updateAvatar.isPending}
            >
              {updateAvatar.isPending ? t("Enviando...") : t("Trocar foto")}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <label className="settings-field">
          <span className="settings-label">{t("Nome completo")}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="settings-input"
            placeholder={t("Seu nome")}
            required
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">{t("Username")}</span>
          <div className="settings-at-wrap">
            <span className="settings-at">@</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="settings-input with-at"
              placeholder="seuusername"
              required
            />
          </div>
          <span className="settings-hint">
            {t(" Use apenas letras, números e underscore. ")}</span>
        </label>

        <label className="settings-field">
          <span className="settings-label">{t("E-mail")}</span>
          <input
            value={user?.email ?? ''}
            className="settings-input disabled"
            disabled
          />
          <span className="settings-hint">
            {t(" O e-mail fica protegido e não pode ser alterado por aqui. ")}</span>
        </label>

        {updateMe.isError ? (
          <div className="settings-feedback error">
            {updateMe.error instanceof Error
              ? updateMe.error.message
              : t("Erro ao atualizar perfil.")}
          </div>
        ) : null}

        {updateAvatar.isError ? (
          <div className="settings-feedback error">
            {updateAvatar.error instanceof Error
              ? updateAvatar.error.message
              : t("Erro ao atualizar foto de perfil.")}
          </div>
        ) : null}

        {avatarError ? (
          <div className="settings-feedback error">{avatarError}</div>
        ) : null}

        {success ? (
          <div className="settings-feedback success">{success}</div>
        ) : null}

        <button
          type="submit"
          disabled={updateMe.isPending || !hasProfileChanges}
          className="settings-primary-button"
        >
          {updateMe.isPending ? t("Salvando...") : t("Salvar alterações")}
        </button>
      </form>
    </section>
  );
}

function PasswordSection() {
  useLanguage();
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
      setMatchError(t("As senhas não coincidem."));
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
        <h2 className="settings-section-title">{t("Segurança da conta")}</h2>
        <p className="settings-section-subtitle">
          {t(" Ao alterar a senha, sua sessão será encerrada para manter sua conta segura. ")}</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <label className="settings-field">
          <span className="settings-label">{t("Senha atual")}</span>
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
          <span className="settings-label">{t("Nova senha")}</span>
          <input
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            className="settings-input"
            placeholder={t("Mínimo 8 caracteres")}
            required
          />
        </label>

        <label className="settings-field">
          <span className="settings-label">{t("Confirmar nova senha")}</span>
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
              : t("Erro ao alterar senha.")}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={updatePassword.isPending}
          className="settings-primary-button"
        >
          {updatePassword.isPending ? 'Alterando...' : t("Alterar senha")}
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
  useLanguage();
  const deleteMe = useDeleteMe();
  const [password, setPassword] = useState('');

  return (
    <section className="settings-section">
      <div className="settings-section-header">
        <h2 className="settings-section-title" style={{ color: 'var(--danger)' }}>
          {t(" Encerrar conta ")}</h2>
        <p className="settings-section-subtitle">
          {t(" Esta área existe para proteger você de ações impulsivas. Pense com calma. ")}</p>
      </div>

      <div className="settings-danger-card">
        <p className="settings-danger-title">{t("Deletar minha conta")}</p>
        <p className="settings-danger-text">
          {t(" Todos os seus dados, posts, relações sociais e informações serão removidos permanentemente. Esta ação não pode ser desfeita. ")}</p>

        {!showConfirm ? (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="settings-danger-button"
            style={{ marginTop: 16 }}
          >
            {t(" Deletar minha conta ")}</button>
        ) : (
          <div className="settings-form" style={{ marginTop: 18 }}>
            <label className="settings-field">
              <span className="settings-label">{t("Confirme sua senha")}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="settings-input"
                placeholder={t("Sua senha atual")}
              />
            </label>

            <p className="settings-danger-text" style={{ color: 'var(--danger)' }}>
              {t(" Ao confirmar, sua conta será removida permanentemente. ")}</p>

            <div className="settings-actions">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword('');
                }}
                className="settings-secondary-button"
              >
                {t(" Cancelar ")}</button>

              <button
                type="button"
                onClick={() => deleteMe.mutate({ password })}
                disabled={deleteMe.isPending || password.length < 6}
                className="settings-danger-button"
              >
                {deleteMe.isPending ? 'Deletando...' : t("Confirmar exclusão")}
              </button>
            </div>

            {deleteMe.isError ? (
              <div className="settings-feedback error">
                {deleteMe.error instanceof Error
                  ? deleteMe.error.message
                  : t("Erro ao deletar conta.")}
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
