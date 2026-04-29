import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/use-login';
import momentLogo from '@/assets/moment-logo.svg';
import momentIcon from '@/assets/moment-icon.svg';

const AMETHYST = '#7c3aed';
const AMETHYST_LIGHT = '#a78bfa';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const nextPath =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname || '/';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate(nextPath, { replace: true });
    } catch {
      
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
                Compartilhe momentos.
                <br />
                Crie conexões.
              </h1>
              <p style={brandTextStyle}>
                O Moment é o seu espaço para compartilhar o que importa,
                acompanhar o que acontece e viver uma rede social mais leve.
              </p>
            </div>
          </div>

          <div style={decorativeCardStyle}>
            <img src={momentIcon} alt="" style={{ width: 52, height: 52 }} />
            <span style={decorativeTextStyle}>Moment</span>
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

            <div style={{ marginTop: 24, marginBottom: 28 }}>
              <h2 style={titleStyle}>Bem-vindo de volta!</h2>
              <p style={subtitleStyle}>Faça login para continuar</p>
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={fieldStyle}>
                <label htmlFor="email" style={labelStyle}>
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {login.isError ? (
                <div style={errorStyle}>
                  {login.error instanceof Error
                    ? login.error.message
                    : 'Não foi possível entrar. Tente novamente.'}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={login.isPending}
                style={buttonStyle}
              >
                {login.isPending ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p style={footerTextStyle}>
              Ainda não tem uma conta?{' '}
              <Link to="/register" style={linkStyle}>
                Criar conta
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
  gap: 52,
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
  marginTop: 18,
  maxWidth: 380,
  color: '#5b5570',
  fontSize: 17,
  lineHeight: 1.65,
  fontFamily: "'DM Sans', sans-serif",
};

const decorativeCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 2,
  width: 220,
  height: 130,
  borderRadius: 24,
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(18px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  alignSelf: 'center',
  boxShadow: '0 24px 55px rgba(124, 58, 237, 0.22)',
  transform: 'rotate(-5deg)',
};

const decorativeTextStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: AMETHYST,
  fontFamily: "'Lora', serif",
};

const formPanelStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  padding: 64,
  background: '#ffffff',
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
  gap: 18,
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