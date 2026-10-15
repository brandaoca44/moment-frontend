import { t, useLanguage } from '@/i18n';
import '../components/auth-layout.css';
import './register-page.css';
import '@/features/legal/legal.css';
import { POLICY_VERSION } from '@/features/legal/policies';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/use-register';
import momentLogo from '@/assets/moment-logo.svg';
import momentIcon from '@/assets/moment-icon.svg';

const AMETHYST = '#7c3aed';
const AMETHYST_LIGHT = '#a78bfa';

export function RegisterPage() {
  useLanguage();
  const navigate = useNavigate();
  const register = useRegister();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    birthDate: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await register.mutateAsync({ ...form, acceptedTerms, termsVersion: POLICY_VERSION });
      navigate('/', { replace: true });
    } catch {
      // erro capturado pelo register.isError
    }
  }

  return (
    <main className="auth-page register-page" style={pageStyle}>
      <section className="auth-card" style={cardStyle}>

        {/* Painel esquerdo — brand */}
        <aside className="auth-brand" style={brandPanelStyle}>
          <div style={brandContentStyle}>
            <img
              src={momentLogo}
              alt="Moment"
              style={{ width: 194, height: 'auto' }}
            />

            <div>
              <h1 style={brandTitleStyle}>
                {t('Boas conexões.')}<br />
                {t('Novos momentos.')}</h1>
              <p style={brandTextStyle}>
                {t('Compartilhe suas histórias, descubra interesses e encontre pessoas com quem você se identifica.')}</p>
            </div>

            <div style={pillsRowStyle}>
              <span style={pillStyle}>{t('Comece com o plano Free')}</span>
              <span style={pillStyle}>{t('Encontre sua comunidade')}</span>
              <span style={pillStyle}>{t('Escolha o que compartilhar')}</span>
            </div>
          </div>

          <div style={decorativeCardStyle} aria-hidden="true">
            <img src={momentIcon} alt="" style={{ width: 52, height: 52 }} />
            <div>
              <p style={decorativeQuoteStyle}>
                {t('Seu momento começa com você.')}</p>
              <p style={decorativeSubStyle}>— Moment</p>
            </div>
          </div>
        </aside>

        {/* Painel direito — formulário */}
        <section className="auth-form-panel" style={formPanelStyle}>
          <div style={formBoxStyle}>
            <img
              src={momentIcon}
              alt="Moment"
              style={{ width: 44, height: 44 }}
            />

            <div style={{ marginTop: 16, marginBottom: 24 }}>
              <h2 style={titleStyle}>{t('Faça parte do Moment')}</h2>
              <p style={subtitleStyle}>
                {t('Crie seu perfil e encontre seu espaço.')}</p>
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={rowStyle}>
                <div style={fieldStyle}>
                  <label htmlFor="name" style={labelStyle}>
                    {t(" Nome de exibição ")}</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t("Seu nome")}
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="username" style={labelStyle}>
                    {t('Nome de usuário')}</label>
                  <div style={usernameWrapStyle}>
                    <span style={usernameAtStyle}>@</span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder={t('seuusuario')}
                      autoComplete="username"
                      value={form.username}
                      onChange={handleChange}
                      style={usernameInputStyle}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={fieldStyle}>
                <label htmlFor="email" style={labelStyle}>
                  {t(" E-mail ")}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('voce@exemplo.com')}
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="password" style={labelStyle}>
                  {t(" Senha ")}</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t("Mínimo 8 caracteres")}
                  autoComplete="new-password"
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="birthDate" style={labelStyle}>{t("Data de nascimento (não aparece no perfil)")}</label>
                <input id="birthDate" name="birthDate" type="date" autoComplete="bday" value={form.birthDate} onChange={handleChange} style={inputStyle} required max={new Date().toISOString().slice(0, 10)} aria-describedby="register-age-note" />
                <small id="register-age-note" className="register-age-note">{t('Nesta fase, o cadastro está disponível apenas para maiores de 18 anos. Sua data de nascimento não é pública.')}</small>
              </div>
              <label className="policy-checkbox"><input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} required /><span>{t("Li e aceito os ")}<Link to="/terms" target="_blank" rel="noopener noreferrer">{t("Termos de Uso")}</Link> {t(" e li o aviso de ")}<Link to="/privacy" target="_blank" rel="noopener noreferrer">{t("Privacidade")}</Link>.</span></label>
              {register.isError ? (
                <div style={errorStyle}>
                  {register.error instanceof Error
                    ? register.error.message
                    : t("Não foi possível criar a conta. Tente novamente.")}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={register.isPending || !acceptedTerms}
                style={buttonStyle}
              >
                {register.isPending ? t("Criando conta...") : t("Criar conta")}
              </button>

            </form>

            <p style={footerTextStyle}>
              {t(" Já tem uma conta?")}{' '}
              <Link to="/login" style={linkStyle}>
                {t(" Entrar ")}</Link>
            </p>
          </div>
        </section>
      </section>

      <footer style={footerStyle}>
        <p style={footerCopyStyle}>
          © {new Date().getFullYear()} {t(" Moment. Todos os direitos reservados. ")}</p>
        <div style={footerLinksStyle}>
          <Link to="/terms" style={footerLinkStyle}>{t("Termos de uso")}</Link>
          <span style={{ color: '#c4b5fd' }}>·</span>
          <Link to="/privacy" style={footerLinkStyle}>{t("Privacidade")}</Link>
          <span style={{ color: '#c4b5fd' }}>·</span>
          <Link to="/support" style={footerLinkStyle}>{t("Suporte")}</Link>
        </div>
      </footer>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: 'var(--auth-page-padding)',
  display: 'grid',
  placeItems: 'center',
  background:
    'radial-gradient(circle at top left, #ede9fe 0, transparent 32%), linear-gradient(135deg, #faf7ff, #ffffff)',
  color: '#111827',
  boxSizing: 'border-box',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 1080,
  minHeight: 'var(--auth-card-height)',
  display: 'grid',
  gridTemplateColumns: 'var(--auth-columns)',
  borderRadius: 28,
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 18px 60px rgba(76, 29, 149, 0.08)',
  border: '1px solid rgba(124, 58, 237, 0.12)',
};

const brandPanelStyle: React.CSSProperties = {
  position: 'relative',
  padding: 'var(--auth-panel-padding)',
  background:
    'radial-gradient(ellipse at 0% 0%, #f5f0ff, transparent 65%), radial-gradient(ellipse at 100% 100%, #ded2fa, transparent 70%), linear-gradient(145deg, #eee7fd, #f5f0fc)',
  display: 'var(--auth-brand-display)',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflow: 'hidden',
};

const brandContentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  display: 'grid',
  gap: 30,
};

const brandTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.18,
  fontWeight: 600,
  letterSpacing: -0.8,
  color: '#40324f',
  fontFamily: "var(--font-ui)",
};

const brandTextStyle: React.CSSProperties = {
  marginTop: 16,
  maxWidth: 380,
  color: '#5b5570',
  fontSize: 15,
  lineHeight: 1.65,
  fontFamily: "var(--font-ui)",
};

const pillsRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  fontWeight: 400,
  color: '#4c1d95',
  fontFamily: "var(--font-ui)",
  background: 'rgba(255,255,255,0.55)',
  border: '1px solid rgba(124,58,237,0.18)',
  borderRadius: 12,
  padding: '6px 16px',
  width: 'fit-content',
};

const decorativeCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  maxWidth: 280,
  borderRadius: 24,
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(18px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  alignSelf: 'center',
  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.06)',
  padding: '18px 20px',
  marginTop: 40,
};

const decorativeQuoteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 600,
  color: '#312e81',
  fontFamily: "var(--font-ui)",
  fontStyle: 'italic',
};

const decorativeSubStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 12,
  color: AMETHYST,
  fontFamily: "var(--font-ui)",
  fontWeight: 600,
};

const formPanelStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  padding: 'var(--auth-panel-padding)',
  background: 'radial-gradient(ellipse at 100% 0%, #f0e9fd, transparent 65%), radial-gradient(ellipse at 0% 100%, #f1eafa, transparent 65%), linear-gradient(155deg, #fffefd, #fbf8ff)',
};

const formBoxStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 430,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 30,
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: -0.6,
  color: '#1f2937',
  fontFamily: "var(--font-ui)",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: '#8a8498',
  fontSize: 16,
  fontFamily: "var(--font-ui)",
};

const formStyle: React.CSSProperties = {
  display: 'grid',
  gap: 16,
};

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 14,
};

const fieldStyle: React.CSSProperties = {
  display: 'grid',
  gap: 8,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#374151',
  fontFamily: "var(--font-ui)",
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 46,
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  background: 'rgba(255,255,255,0.78)',
  padding: '0 16px',
  fontSize: 15,
  color: '#111827',
  boxSizing: 'border-box',
  fontFamily: "var(--font-ui)",
};

const usernameWrapStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const usernameAtStyle: React.CSSProperties = {
  position: 'absolute',
  left: 14,
  fontSize: 15,
  color: AMETHYST,
  fontWeight: 600,
  fontFamily: "var(--font-ui)",
  pointerEvents: 'none',
};

const usernameInputStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: 30,
};

const buttonStyle: React.CSSProperties = {
  height: 52,
  borderRadius: 14,
  border: 'none',
  background: `linear-gradient(135deg, ${AMETHYST}, ${AMETHYST_LIGHT})`,
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(124, 58, 237, 0.14)',
  fontFamily: "var(--font-ui)",
  marginTop: 4,
};

const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  borderRadius: 14,
  padding: 13,
  fontSize: 14,
  fontFamily: "var(--font-ui)",
};

const footerTextStyle: React.CSSProperties = {
  marginTop: 28,
  textAlign: 'center',
  color: '#7b738c',
  fontSize: 15,
  fontFamily: "var(--font-ui)",
};

const linkStyle: React.CSSProperties = {
  color: AMETHYST,
  fontWeight: 700,
  textDecoration: 'none',
};

const footerStyle: React.CSSProperties = {
  marginTop: 24,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
};

const footerCopyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: '#a78bfa',
  fontFamily: "var(--font-ui)",
};

const footerLinksStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
};

const footerLinkStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#7c3aed',
  textDecoration: 'none',
  fontFamily: "var(--font-ui)",
  fontWeight: 500,
};
