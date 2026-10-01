import { t, useLanguage } from '@/i18n';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import momentIcon from '@/assets/moment-icon.svg';
import './recovery.css';

export function RecoveryLayout({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  useLanguage();
  return (
    <main className="recovery-page">
      <section className="recovery-card" aria-labelledby="recovery-title">
        <img src={momentIcon} alt="Moment" width="64" height="64" />
        <h1 id="recovery-title">{title}</h1>
        <p className="recovery-description">{description}</p>
        {children}
        <Link className="recovery-back" to="/login">{t("Voltar para entrar")}</Link>
      </section>
    </main>
  );
}
