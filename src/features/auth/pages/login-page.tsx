import { t, useLanguage } from '@/i18n';
import { LanguagePicker } from '@/i18n/language-picker';
import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Heart, Leaf, LockKeyhole, Mail, Users } from 'lucide-react';
import { useLogin } from '../hooks/use-login';
import momentIcon from '@/assets/moment-icon.svg';
import '../components/login.css';

export function LoginPage() {
  useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
  const nextPath = from?.startsWith('/') && !from.startsWith('//') ? from : '/';
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { await login.mutateAsync({ email, password }); navigate(nextPath, { replace: true }); } catch { /* Display mutation error below. */ }
  }
  function openForm() { setFormOpen(true); requestAnimationFrame(() => heading.current?.focus()); }
  return <main className={`moment-login${formOpen ? ' is-signing-in' : ''}`}>
    <header className="login-topbar">
      <Link to="/login" className="login-wordmark" aria-label="Moment"><img src={momentIcon} alt="" /></Link>
      <div className="login-top-actions"><span>{t('Ainda não tem uma conta?')}</span><Link className="login-create-small" to="/register">{t('Criar conta')}</Link></div>
      <LanguagePicker compact />
    </header>
    <section className="login-scene" aria-label={t('Conheça o Moment')}>
      <div className="login-introduction">
        <img className="login-mobile-mark" src={momentIcon} alt="" />
        <h1>Moment</h1><p>{t('Um lugar para compartilhar a vida, sem tanto ruído.')}</p>
        <ul className="login-values"><li><Leaf aria-hidden="true" />{t('Momentos reais')}</li><li><Heart aria-hidden="true" />{t('Mais gentileza')}</li><li><Users aria-hidden="true" />{t('Conexões de verdade')}</li></ul>
      </div>
      <div className="login-welcome-actions"><Link className="login-primary" to="/register">{t('Criar conta')}</Link><button className="login-outline" onClick={openForm}>{t('Entrar')}</button></div>
    </section>
    <section className="login-form-side" aria-labelledby="login-title">
      <button className="login-back" onClick={() => setFormOpen(false)}><ArrowLeft size={18} />{t('Voltar')}</button>
      <div className="login-panel">
        <img className="login-panel-mark" src={momentIcon} alt="" /><span className="login-mobile-brand">Moment</span>
        <h2 id="login-title" ref={heading} tabIndex={-1}>{t('Bem-vindo de volta!')}</h2><p className="login-subtitle">{t('Entre para continuar seus momentos.')}</p>
        <form onSubmit={handleSubmit}>
          <label className="login-field"><span className="login-sr-only">{t('E-mail')}</span><Mail size={21} aria-hidden="true" /><input type="email" placeholder={t('Endereço de e-mail')} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={login.isPending} /></label>
          <label className="login-field"><span className="login-sr-only">{t('Senha')}</span><LockKeyhole size={21} aria-hidden="true" /><input type={visible ? 'text' : 'password'} placeholder={t('Senha')} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required disabled={login.isPending} /><button type="button" aria-label={t(visible ? 'Ocultar senha' : 'Mostrar senha')} aria-pressed={visible} onClick={() => setVisible(v => !v)}>{visible ? <Eye size={20} /> : <EyeOff size={20} />}</button></label>
          <Link className="login-forgot" to="/forgot-password">{t('Esqueci minha senha')}</Link>
          {login.isError && <p className="login-error" role="alert">{login.error instanceof Error ? login.error.message : t('Não foi possível entrar. Tente novamente.')}</p>}
          <button className="login-primary" type="submit" disabled={login.isPending}>{t(login.isPending ? 'Entrando...' : 'Entrar')}</button>
        </form>
        <p className="login-signup">{t('Ainda não tem uma conta?')} <Link to="/register">{t('Criar conta')}</Link></p>
      </div>
      <footer className="login-legal"><Link to="/terms">{t('Termos de uso')}</Link><Link to="/privacy">{t('Privacidade')}</Link><Link to="/support">{t('Suporte')}</Link><small>© {new Date().getFullYear()} Moment</small></footer>
    </section>
  </main>;
}
