import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { t, useLanguage } from '@/i18n';
import './publication-rules.css';

export function PublicationRules({kind}:{kind:'jobs'|'vitrine'}) {
  useLanguage();
  return <details className="publication-rules"><summary><ShieldCheck size={14} aria-hidden="true"/>{t('Regras e segurança da publicação')}</summary><p>{t(kind==='jobs'
    ? 'Publique apenas vagas reais, remotas ou híbridas, de empresas que você representa. Golpes, vagas inexistentes e links falsos podem levar ao bloqueio do perfil e à perda de acesso à ferramenta após análise, mesmo no Premium.'
    : 'Compartilhe ofertas verdadeiras e links diretos de lojas aprovadas. Golpes, links falsos e informações enganosas podem levar ao bloqueio do perfil e à perda de acesso à ferramenta após análise, mesmo no Premium.')}</p><Link to="/terms" target="_blank" rel="noopener noreferrer">{t('Consultar regras completas')}</Link></details>;
}
