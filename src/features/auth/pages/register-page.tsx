import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/use-register';
import momentLogo from '@/assets/moment-logo.svg';
import momentIcon from '@/assets/moment-icon.svg';

const AMETHYST = '#7c3aed';
const AMETHYST_LIGHT = '#a78bfa';

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await register.mutateAsync(form);
      navigate('/', { replace: true });
    } catch {
      // erro capturado pelo register.isError
    }
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>

        {/* Painel esquerdo — brand */}
        <aside style={brandPanelStyle}>
          <div style={brandContentStyle}>
            <img
              src={momentLogo}
              alt="Moment"
              style={{ width: 240, height: 'auto' }}
            />

            <div>
              <h1 style={brandTitleStyle}>
                Seu jardim digital
                <br />
                começa aqui.
              </h1>
              <p style={brandTextStyle}>
                Crie sua conta e entre em um espaço onde você pode
                ser livre, autêntico e conectado com o que realmente importa.
              </p>
            </div>

            <div style={pillsRowStyle}>
              <span style={pillStyle}>✦ Gratuito para sempre</span>
              <span style={pillStyle}>✦ Sem anúncios invasivos</span>
              <span style={pillStyle}>✦ Você no controle</span>
            </div>
          </div>

          <div style={decorativeCardStyle}>
            <img src={momentIcon} alt="" style={{ width: 52, height: 52 }} />
            <div>
              <p style={decorativeQuoteStyle}>
                "Um espaço só seu."
              </p>
              <p style={decorativeSubStyle}>— Moment</p>
            </div>
          </div>
        </aside>

        {/* Painel direito — formulário */}
        <section style={formPanelStyle}>
          <div style={formBoxStyle}>
            <img
              src={momentIcon}
              alt="Moment"
              style={{ width: 72, height: 72 }}
            />

            <div style={{ marginTop: 24, marginBottom: 32 }}>
              <h2 style={titleStyle}>Criar sua conta</h2>
              <p style={subtitleStyle}>
                Leva menos de um minuto.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={rowStyle}>
                <div style={fieldStyle}>
                  <label htmlFor="name" style={labelStyle}>
                    Nome completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={fieldStyle}>
                  <label htmlFor="username" style={labelStyle}>
                    Username
                  </label>
                  <div style={usernameWrapStyle}>
                    <span style={usernameAtStyle}>@</span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="seuusername"
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
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="password" style={labelStyle}>
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
              </div>

              {register.isError ? (
                <div style={errorStyle}>
                  {register.error instanceof Error
                    ? register.error.message
                    : 'Não foi possível criar a conta. Tente novamente.'}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={register.isPending}
                style={buttonStyle}
              >
                {register.isPending ? 'Criando conta...' : 'Criar conta'}
              </button>

              <p style={termsStyle}>
                Ao criar uma conta você concorda com nossos{' '}
                <a href="#" style={termsLinkStyle}>Termos de uso</a>
                {' '}e{' '}
                <a href="#" style={termsLinkStyle}>Política de privacidade</a>.
              </p>
            </form>

            <p style={footerTextStyle}>
              Já tem uma conta?{' '}
              <Link to="/login" style={linkStyle}>
                Entrar
              </Link>
            </p>
          </div>
        </section>
      </section>

      <footer style={footerStyle}>
        <p style={footerCopyStyle}>
          © {new Date().getFullYear()} Moment. Todos os direitos reservados.
        </p>
        <div style={footerLinksStyle}>
          <a href="#" style={footerLinkStyle}>Termos de uso</a>
          <span style={{ color: '#c4b5fd' }}>·</span>
          <a href="#" style={footerLinkStyle}>Privacidade</a>
          <span style={{ color: '#c4b5fd' }}>·</span>
          <a href="#" style={footerLinkStyle}>Suporte</a>
        </div>
      </footer>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: 24,
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
  minHeight: 660,
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  borderRadius: 28,
  overflow: 'hidden',
  background: '#ffffff',
  boxShadow: '0 28px 80px rgba(76, 29, 149, 0.16)',
  border: '1px solid rgba(124, 58, 237, 0.12)',
};

const brandPanelStyle: React.CSSProperties = {
  position: 'relative',
  padding: 64,
  background:
    'linear-gradient(160deg, rgba(237, 233, 254, 0.95), rgba(196, 181, 253, 0.75))',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  overflow: 'hidden',
};

const brandContentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  display: 'grid',
  gap: 40,
};

const brandTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.18,
  fontWeight: 800,
  letterSpacing: -0.8,
  color: '#312e81',
  fontFamily: "'Lora', serif",
};

const brandTextStyle: React.CSSProperties = {
  marginTop: 16,
  maxWidth: 380,
  color: '#5b5570',
  fontSize: 17,
  lineHeight: 1.65,
  fontFamily: "'DM Sans', sans-serif",
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
  fontWeight: 600,
  color: '#4c1d95',
  fontFamily: "'DM Sans', sans-serif",
  background: 'rgba(255,255,255,0.55)',
  border: '1px solid rgba(124,58,237,0.18)',
  borderRadius: 100,
  padding: '6px 16px',
  width: 'fit-content',
};

const decorativeCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  width: 260,
  height: 110,
  borderRadius: 24,
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(18px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  alignSelf: 'center',
  boxShadow: '0 24px 55px rgba(124, 58, 237, 0.22)',
  transform: 'rotate(-4deg)',
  padding: '0 20px',
};

const decorativeQuoteStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 600,
  color: '#312e81',
  fontFamily: "'Lora', serif",
  fontStyle: 'italic',
};

const decorativeSubStyle: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 12,
  color: AMETHYST,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
};

const formPanelStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  padding: 64,
  background: '#ffffff',
  overflowY: 'auto',
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
  fontFamily: "'Lora', serif",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: '#8a8498',
  fontSize: 16,
  fontFamily: "'DM Sans', sans-serif",
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
  fontFamily: "'DM Sans', sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 52,
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  background: '#fafafa',
  padding: '0 16px',
  fontSize: 15,
  color: '#111827',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'DM Sans', sans-serif",
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
  fontWeight: 700,
  fontFamily: "'DM Sans', sans-serif",
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
  boxShadow: '0 16px 32px rgba(124, 58, 237, 0.28)',
  fontFamily: "'DM Sans', sans-serif",
  marginTop: 4,
};

const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#b91c1c',
  border: '1px solid #fecaca',
  borderRadius: 14,
  padding: 13,
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
};

const termsStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: '#9ca3af',
  textAlign: 'center',
  lineHeight: 1.6,
  fontFamily: "'DM Sans', sans-serif",
};

const termsLinkStyle: React.CSSProperties = {
  color: AMETHYST,
  fontWeight: 600,
  textDecoration: 'none',
};

const footerTextStyle: React.CSSProperties = {
  marginTop: 28,
  textAlign: 'center',
  color: '#7b738c',
  fontSize: 15,
  fontFamily: "'DM Sans', sans-serif",
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
  fontFamily: "'DM Sans', sans-serif",
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
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 500,
};
