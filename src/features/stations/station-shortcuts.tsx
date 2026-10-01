import { t, useLanguage } from '@/i18n';
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { stations } from "./api";
import { useId, useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import './station-shortcuts.css';
export function StationShortcuts({ close }: { close: () => void }) {
  useLanguage();
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const query = useQuery({
    queryKey: ["stations", "shortcuts"],
    queryFn: () => stations("mine"),
  });
  return (
    <div className="station-shortcuts">
      <button type="button" className="station-shortcuts-toggle" aria-expanded={expanded} aria-controls={listId} onClick={() => setExpanded(value => !value)}>
        <Layers size={18} aria-hidden="true" />
        <span><strong>{t("Minhas estações")}</strong><small>{t("Acesso rápido")}</small></span>
        <ChevronDown size={16} aria-hidden="true" className={expanded ? 'expanded' : ''} />
      </button>
      <div id={listId} hidden={!expanded} className="station-shortcuts-list">
      {query.isPending && <p role="status">{t("Carregando…")}</p>}
      {query.isError && <p role="alert">{t("Não foi possível carregar. ")}<button onClick={() => query.refetch()}>{t("Tentar novamente")}</button></p>}
      {query.data?.data.slice(0, 5).map((s) => (
        <Link
          className="station-shortcut-link"
          key={s.id}
          to={`/communities/${s.id}`}
          onClick={close}
        >
          {s.coverUrl ? <img src={s.coverUrl} alt="" loading="lazy" /> : <span className="station-shortcut-placeholder" aria-hidden="true">{s.name.slice(0, 1).toUpperCase()}</span>}
          <span className="station-shortcut-name" title={s.name}>{s.name}</span>
        </Link>
      ))}
      {query.data?.data.length === 0 && <p>{t("As estações de que você participa aparecem aqui.")}</p>}
      <Link className="station-shortcuts-all" to="/communities?tab=mine" onClick={close}>{t("Ver todas as minhas estações →")}</Link>
      </div>
    </div>
  );
}
