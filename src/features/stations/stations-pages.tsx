import { getLanguage } from '@/i18n';
import { api } from '@/lib/api';
import { t as translate, useLanguage } from '@/i18n';
import { EmojiText } from '@/components/ui/emoji-text';
import { useRef, useState } from "react";
import { ChevronLeft, ImagePlus, X, ScrollText, SlidersHorizontal, Inbox, LogOut, Plus } from 'lucide-react';
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/features/auth/hooks/use-me";
import { uploadPostImage } from "@/features/feed/api/feed";
import { ExpandableImage } from "@/components/ui/expandable-image";
import { ReportButton } from "@/features/reports/report-button";
import {
  categories,
  conversation,
  queue,
  station,
  stations,
  topics,
  write,
  type Entry,
  type EntryInput,
  type Station,
} from "./api";
import "./stations.css";
import { StationDialog } from "./station-dialog";

function useRefresh() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ["stations"] });
}
function Pages({
  page,
  pages,
  change,
}: {
  page: number;
  pages: number;
  change: (p: number) => void;
}) {
  useLanguage();
  return (
    <nav className="station-controls" aria-label={translate("Páginas")}>
      <button disabled={page <= 1} onClick={() => change(page - 1)}>
        {translate(" Anterior ")}</button>
      <span>
        {translate(" Página ")}{page} {translate(" de ")}{pages}
      </span>
      <button disabled={page >= pages} onClick={() => change(page + 1)}>
        {translate(" Próxima ")}</button>
    </nav>
  );
}
function StationForm({ current }: { current?: Station }) {
  useLanguage();
  const refresh = useRefresh();
  const [name, setName] = useState(current?.name ?? "");
  const [description, setDescription] = useState(current?.description ?? "");
  const [rules, setRules] = useState(
    current?.rules ??
      translate("Respeite as pessoas, converse com gentileza e siga as regras do Moment."),
  );
  const [category, setCategory] = useState(current?.category ?? categories[0]);
  const [theme, setTheme] = useState(current?.theme ?? "amethyst");
  const [file, setFile] = useState<File | null>(null);
  const send = useMutation({
    mutationFn: async () => {
      const coverUrl = file ? await uploadPostImage(file) : undefined;
      return write(
        current ? current.id : "",
        {
          name,
          description,
          rules,
          category,
          theme,
          ...(coverUrl ? { coverUrl } : {}),
        },
        current ? "PATCH" : "POST",
      );
    },
    onSuccess: refresh,
  });
  return (
    <StationDialog
      label={current ? translate("Editar estação") : translate("Criar estação")}
      icon={current ? <SlidersHorizontal size={16} aria-hidden="true" /> : undefined}
      busy={send.isPending}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!send.isPending) send.mutate();
        }}
      >
        <label>
          {translate(" Nome ")}<input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={80}
            required
          />
        </label>
        <label>
          {translate(" Categoria ")}<select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{translate(c)}</option>
            ))}
          </select>
        </label>
        <label>
          {translate(" Cor da estação ")}<select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="amethyst">{translate("Ametista")}</option>
            <option value="ocean">{translate("Oceano")}</option>
            <option value="forest">{translate("Floresta")}</option>
            <option value="sunset">{translate("Pôr do sol")}</option>
            <option value="rose">{translate("Rosa")}</option>
          </select>
        </label>
        <div className="station-theme-preview" data-station-theme={theme}>
          {translate(" Prévia da cor da estação ")}</div>
        <label>
          {translate(" Descrição ")}<textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={1000}
            required
          />
        </label>
        <label>
          {translate(" Regras ")}<textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            minLength={10}
            maxLength={1500}
            required
          />
        </label>
        <label>
          {translate(" Capa opcional — até 5 MB ")}<input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="station-muted">
          {translate("Estações são publicadas após a checagem de conteúdo. Casos sinalizados aguardam a equipe do Moment.")}</p>
        <button
          disabled={send.isPending || (file?.size ?? 0) > 5 * 1024 * 1024}
        >
          {send.isPending ? translate("Enviando...") : translate("Salvar estação")}
        </button>
        {send.isError && <p role="alert">{translate(send.error.message)}</p>}
        {send.isSuccess && <p role="status">{translate(send.data.message)}</p>}
      </form>
    </StationDialog>
  );
}
function Decision({ path }: { path: string }) {
  useLanguage();
  const [note, setNote] = useState("");
  const refresh = useRefresh();
  const mutation = useMutation({
    mutationFn: (action: string) => write(path, { action, note }),
    onSuccess: refresh,
  });
  return (
    <div>
      <label>
        {translate("Justificativa (opcional para aprovar)")}<textarea
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <div className="station-controls">
        <button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("APPROVE")}
        >
          {translate(" Aprovar ")}</button>
        <button
          disabled={!note.trim() || mutation.isPending}
          onClick={() => mutation.mutate("HIDE")}
        >
          {translate(" Retirar / rejeitar ")}</button>
      </div>
      {mutation.isError && <p role="alert">{translate(mutation.error.message)}</p>}
    </div>
  );
}
export function StationsPage() {
  useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const tab = requestedTab === 'mine' || requestedTab === 'pending' ? requestedTab : 'discover';
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const me = useMe().data?.data.user;
  const list = useQuery({
    queryKey: ["stations", "list", tab, page, category, search],
    queryFn: () => stations(tab, page, category, search),
  });
  return (
    <section className="stations-page">
      <header className="station-directory-header">
        <div>
          <h1>{translate("Estações")}</h1>
          <p className="station-muted">
            {translate(" Encontre pessoas que compartilham seus interesses. ")}</p>
        </div>
        <StationForm />
      </header>
      <StationReviewInbox />
      <div className="station-controls">
        {[
          ["discover", translate("Descobrir")],
          ["mine", translate("Minhas estações")],
          ...(me?.canModerate ? [["pending", translate("Aprovar estações")]] : []),
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            onClick={() => {
              setSearchParams(previous => { const next = new URLSearchParams(previous); next.set('tab', key); return next; });
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        className="station-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(searchInput.trim());
          setPage(1);
        }}
      >
        <input
          aria-label={translate("Buscar estação pelo nome")}
          placeholder={translate("Buscar uma estação…")}
          type="search"
          maxLength={80}
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            if (!e.target.value) {
              setSearch("");
              setPage(1);
            }
          }}
        />
        <button type="submit">{translate("Buscar")}</button>
      </form>
      <div className="station-toolbar">
        <StationDialog
          label={translate(category) || translate("Todos os interesses")}
          title={translate("Filtrar por interesse")}
        >
          <div className="station-category-options">
            {["", ...categories].map((c) => (
              <button
                type="button"
                key={c}
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                  setPage(1);
                }}
              >
                {c || "Todos"}
              </button>
            ))}
          </div>
        </StationDialog>
        {category && (
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
          >
            {translate(" Limpar filtro ")}</button>
        )}
        {me?.canModerate && <ReviewQueue id="" />}
      </div>
      {list.isPending && <p role="status">{translate("Carregando estações...")}</p>}
      {list.isError && <p role="alert">{translate(list.error.message)}</p>}
      <div className="station-gallery">
        {list.data?.data.map((s) => (
          <article
            className="station-tile"
            key={s.id}
            data-station-theme={s.theme}
          >
            <Link to={`/communities/${s.id}`} className="station-tile-link">
              <div className="station-tile-image">
                {s.coverUrl ? (
                  <img src={s.coverUrl} alt="" loading="lazy" />
                ) : (
                  <span aria-hidden="true">
                    {s.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <h2>{s.name}</h2>
              <p>
                {translate(s.category)} · {s._count?.members ?? 0} {translate(" membros ")}</p>
              {s.status !== "APPROVED" && (
                <small>{translate("Pendente ou indisponível")}</small>
              )}
            </Link>
            {tab === "pending" && (
              <StationDialog label={translate("Analisar estação")} title={s.name}>
                <p>{s.description}</p>
                <h3>{translate("Regras propostas")}</h3>
                <p>{s.rules}</p>
                <Decision path={`${s.id}/review`} />
              </StationDialog>
            )}
          </article>
        ))}
      </div>
      {list.data?.data.length === 0 && <p>{translate("Nenhuma estação por aqui ainda.")}</p>}
      {list.data && (
        <Pages page={page} pages={list.data.meta.pages} change={setPage} />
      )}
    </section>
  );
}
function Composer({ path, topic = false, onCreated, replyToId }: { path: string; topic?: boolean; onCreated?: (message: string) => void; replyToId?: string }) {
  useLanguage();
  const fileInput = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [nomad, setNomad] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const refresh = useRefresh();
  const limit = nomad ? 220 : 440;
  const send = useMutation({
    mutationFn: async () => {
      const imageUrl = !nomad && file ? await uploadPostImage(file) : undefined;
      const input: EntryInput = {
        content: content.trim(),
        nomad,
        ...(replyToId ? { replyToId } : {}),
        ...(topic ? { title } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      };
      return write(path, input);
    },
    onSuccess: async (result) => {
      setContent("");
      setTitle("");
      setFile(null);
      setFileKey((k) => k + 1);
      onCreated?.(result.message);
      await refresh();
    },
  });
  return (
    <form
      className="station-panel station-composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (!send.isPending && content.trim() && content.length <= limit && (file?.size ?? 0) <= 5 * 1024 * 1024)
          send.mutate();
      }}
    >
      <h2>{topic ? translate("Abrir um tópico") : translate("Responder")}</h2>
      {topic && (
        <label>
          {translate(" Título ")}<input
            required
            minLength={3}
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={send.isPending}
          />
        </label>
      )}
      <div className="station-composer-identity" role="group" aria-label={translate('Participar como')}>
        {[false, true].map(value => <button key={String(value)} type="button" aria-pressed={nomad === value} disabled={send.isPending} onClick={() => { setNomad(value); if (value) { setFile(null); setFileKey(k => k + 1); } }}>{translate(value ? 'Nômade Oculto' : 'Meu perfil')}</button>)}
      </div>
      {nomad && (
        <p className="station-muted">
          {translate(" Seu perfil não será exibido. A equipe do Moment mantém sua identificação para aplicar as regras. Apenas texto; publicação após aprovação. ")}</p>
      )}
      <label className="station-composer-message">
        <span className="station-composer-sr">{translate("Mensagem")}</span><textarea
          placeholder={translate('Escreva sua mensagem…')}
          required
          maxLength={limit}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={send.isPending}
        />
      </label>
      <div className="station-composer-toolbar">
      {!nomad && (
        <>
          <button className="station-composer-attach" type="button" disabled={send.isPending} onClick={() => fileInput.current?.click()} title={translate('Imagem ou GIF — até 5 MB')} aria-label={translate('Imagem ou GIF — até 5 MB')}><ImagePlus size={20} aria-hidden="true" /></button><input
            ref={fileInput}
            hidden
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={send.isPending}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </>
      )}
        <small className="station-composer-count">{content.length}/{limit}</small>
        <button
          className="station-composer-submit"
          disabled={
            send.isPending ||
            !content.trim() ||
            content.length > limit ||
            (file?.size ?? 0) > 5 * 1024 * 1024
          }
        >
          {send.isPending
            ? translate("Enviando...")
            : nomad
              ? translate("Enviar para aprovação")
              : translate("Publicar")}
        </button>
      </div>
      {file && <div className="station-composer-file"><span>{file.name}</span><button type="button" disabled={send.isPending} aria-label={translate('Remover imagem')} onClick={() => { setFile(null); setFileKey(k => k + 1); }}><X size={16} aria-hidden="true" /></button></div>}
      {(file?.size ?? 0) > 5 * 1024 * 1024 && <p role="alert">{translate("A imagem deve ter até 5 MB.")}</p>}
      {send.isError && <p role="alert">{translate(send.error.message)}</p>}
      {send.isSuccess && <p role="status">{translate(send.data.message)}</p>}
    </form>
  );
}
function ReviewQueue({ id, defaultOpen = false, showCount = true }: { id: string; defaultOpen?: boolean; showCount?: boolean }) {
  useLanguage();
  const pending = useQuery({ queryKey: ['stations', id, 'queue', 1], queryFn: () => queue(id, 1), enabled: showCount, refetchInterval: showCount ? 30000 : false, refetchIntervalInBackground: false });
  return (
    <StationDialog icon={<Inbox size={16} aria-hidden="true" />} defaultOpen={defaultOpen} label={showCount ? `${translate("Revisar publicações")} · ${pending.data?.meta.total ?? '…'} · ${translate('Nômades: {count}', { count: pending.data?.meta.nomads ?? 0 })}` : translate('Revisar publicações')}>
      <ReviewQueueContent id={id} />
    </StationDialog>
  );
}
export function StationReviewInbox({ moderator = false }: { moderator?: boolean }) {
  useLanguage();
  const [page, setPage] = useState(1);
  const inbox = useQuery({ queryKey: ['stations', 'review-inbox', moderator, page],
    queryFn: () => api<{ data: { id: string; nomad: boolean; title: string; stationId: string; stationName: string; requiresPlatform: boolean }[]; meta: { total: number; nomads: number; pages: number } }>(`/stations/review/inbox?tab=${moderator ? 'pending' : 'mine'}&page=${page}`),
    refetchInterval: 30000, refetchIntervalInBackground: false,
  });
  return <details className="station-review-inbox">
    <summary><span>{translate(moderator ? 'Publicações das Estações para analisar' : 'Aprovações nas suas Estações')}</span><span className="station-review-count" aria-live="polite">{inbox.data?.meta.total ?? '…'} · {translate('Nômades: {count}', { count: inbox.data?.meta.nomads ?? 0 })}</span></summary>
    <div className="station-review-inbox-body">
      <p>{translate('Publicações aguardando decisão. O contador atualiza automaticamente a cada 30 segundos.')}</p>
      {inbox.isPending && <p>{translate('Carregando...')}</p>}
      {inbox.isError && <p role="alert">{translate('Não foi possível carregar.')} <button onClick={() => inbox.refetch()}>{translate('Tentar novamente')}</button></p>}
      {inbox.data && <p>{translate('Publicações de Nômades: {count}', { count: inbox.data.meta.nomads })}</p>}
      {inbox.data?.data.map(item => <div className="station-review-inbox-item" key={item.id}>
        <div><strong>{item.stationName}</strong><p>{item.title}</p><small>{translate(item.nomad ? 'Um Nômade enviou uma publicação para aprovação.' : 'Uma publicação aguarda aprovação.')}</small>
        {item.requiresPlatform && <p>{translate('Aguardando a equipe do Moment.')}</p>}</div>
        <ReviewQueue id={item.stationId} showCount={false} />
      </div>)}
      {inbox.data?.meta.total === 0 && <p>{translate('Nenhuma publicação aguardando análise.')}</p>}
      {inbox.data && inbox.data.meta.pages > 1 && <Pages page={page} pages={inbox.data.meta.pages} change={setPage} />}
    </div>
  </details>;
}
function ReviewQueueContent({ id }: { id: string }) {
  useLanguage();
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: ["stations", id, "queue", page],
    queryFn: () => queue(id, page),
  });
  return (
    <div>
      {list.isPending && <p>{translate("Carregando...")}</p>}
      {list.isError && <p role="alert">{translate(list.error.message)}</p>}
      {list.data?.data.map((e) => (
        <article className="station-review-row" key={e.id}>
          <p>
            {e.title} · {e.nomad ? e.alias : e.author?.name}
          </p>
          <StationDialog
            label={translate("Analisar publicação")}
            title={e.title ?? translate("Publicação pendente")}
          >
            <p>{e.content}</p>
            {e.imageUrl && (
              <ExpandableImage
                src={e.imageUrl}
                alt="Imagem aguardando aprovação"
              />
            )}
            {e.requiresPlatform && (
              <p>
                {translate(" Retido pela moderação do Moment. Somente a equipe da plataforma pode liberar. ")}</p>
            )}
            <Decision path={`entries/${e.id}/review`} />
          </StationDialog>
        </article>
      ))}
      {list.data?.data.length === 0 && (
        <p>{translate("Nenhuma publicação aguardando análise.")}</p>
      )}
      {list.data && (
        <Pages page={page} pages={list.data.meta.pages} change={setPage} />
      )}
    </div>
  );
}
export function StationPage() {
  useLanguage();
  const [stationSearch] = useSearchParams();
  const viewer = useMe().data?.data.user;
  const [createdMessage, setCreatedMessage] = useState("");
  const { id = "" } = useParams();
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);
  const refresh = useRefresh();
  const detail = useQuery({
    queryKey: ["stations", id],
    queryFn: () => station(id),
  });
  const s = detail.isError ? undefined : detail.data?.data;
  const list = useQuery({
    queryKey: ["stations", id, "topics", sort, page],
    queryFn: () => topics(id, sort, page),
    enabled: s?.status === "APPROVED",
  });
  const membership = useMutation({
    mutationFn: () =>
      write(`${id}/membership`, undefined, s?.joined ? "DELETE" : "PUT"),
    onSuccess: refresh,
  });
  return (
    <section className="stations-page" data-station-theme={s?.theme}>
      <Link className="station-back-link" to="/communities"><ChevronLeft size={17} aria-hidden="true" />{translate("Todas as estações")}</Link>
      {detail.isPending && <p>{translate("Carregando...")}</p>}
      {detail.isError && <p role="alert">{translate(detail.error.message)}</p>}
      {s && (
        <>
          {s.coverUrl && (
            <img className="station-cover" src={s.coverUrl} alt="" />
          )}
          <h1>{s.name}</h1>
          <p>{s.description}</p>
          <p>
            {translate(s.category)} · {s.membersCount} {translate(" membros ")}</p>
          <div className="station-toolbar station-management-actions">
            <StationDialog icon={<ScrollText size={16} aria-hidden="true" />} label={translate("Regras")} title={translate("Regras da estação")}>
              <p>{s.rules}</p>
            </StationDialog>
            {s.canManage && (
              <>
                <StationForm current={s} />
                <ReviewQueue key={`${id}-${stationSearch.get('review')}`} id={id} defaultOpen={stationSearch.get('review') === '1'} />
              </>
            )}
            {s.status === 'APPROVED' && viewer?.id !== s.ownerId && <ReportButton targetType="STATION" targetId={id} />}
            {s.status !== "APPROVED" ? (
              <p role="status">
                {translate(" Esta estação ainda não está disponível para publicação. ")}</p>
            ) : (
              <button
                className={s.joined ? "station-leave" : "station-join"}
                disabled={membership.isPending || s.banned}
                onClick={() => {
                  if (!s.joined || confirm(translate("Sair desta estação?")))
                    membership.mutate();
                }}
              >
                {s.joined ? <LogOut size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {s.banned
                  ? translate("Participação removida")
                  : s.joined
                    ? translate("Sair da estação")
                    : translate("Entrar na estação")}
              </button>
            )}
            {membership.isError && (
              <p role="alert">{translate(membership.error.message)}</p>
            )}
          </div>
          {s.status === "APPROVED" && (
            <>
              <div className="station-controls">
                <h2 className="station-topics-heading">{translate("Tópicos")}</h2>
                {s.joined && (
                  <StationDialog label={translate("Novo tópico")}>
                    {(close) => <Composer path={`${id}/topics`} topic onCreated={(message) => { setCreatedMessage(message); setPage(1); setSort('recent'); close(); }} />}
                  </StationDialog>
                )}
              </div>
              {createdMessage && <p role="status">{translate(createdMessage)}</p>}
              <div className="station-sort" aria-label={translate("Ordenar tópicos")}>
                {[
                  ["recent", "Recentes"],
                  ["activity", translate("Última atividade")],
                  ["unanswered", translate("Sem respostas")],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={sort === value}
                    onClick={() => {
                      setSort(value);
                      setPage(1);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {list.isPending && <p>{translate("Carregando tópicos...")}</p>}
              {list.isError && <p role="alert">{translate(list.error.message)}</p>}
              {list.data?.data.map((t) => (
                <Link
                  className="station-topic"
                  key={t.id}
                  to={`/communities/topics/${t.id}`}
                >
                  <span className="station-topic-label">
                    {translate(" Tópico · Abrir conversa → ")}</span>
                  <strong>{t.title}</strong>
                  <span className="station-muted">
                    {translate(" Criado por ")}{t.creator ?? "Membro"}
                  </span>
                  <br />
                  <small>
                    {t._count.entries} {translate(" respostas · Última atividade:")}{" "}
                    {new Date(t.lastActivity).toLocaleString(getLanguage())}
                  </small>
                </Link>
              ))}
              {list.data?.data.length === 0 && (
                <p>{translate("A conversa começa com o primeiro tópico.")}</p>
              )}
              {list.data && (
                <Pages
                  page={page}
                  pages={list.data.meta.pages}
                  change={setPage}
                />
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
function EntryCard({
  entry,
  canManage,
  canPost,
  stationId,
  alternate = false,
  onReply,
  children,
}: {
  entry: Entry;
  canManage: boolean;
  canPost: boolean;
  stationId: string;
  alternate?: boolean;
  onReply?: (entry: Entry) => void;
  children?: React.ReactNode;
}) {
  useLanguage();
  const refresh = useRefresh();
  const mutation = useMutation({
    mutationFn: (action: string) =>
      action === "like"
        ? write(
            `entries/${entry.id}/like`,
            undefined,
            entry.liked ? "DELETE" : "PUT",
          )
        : action === "remove"
          ? write(`entries/${entry.id}`, undefined, "DELETE")
          : write(`${stationId}/ban/${entry.id}`),
    onSuccess: refresh,
  });
  if (entry.removed)
    return (
      <article className={`station-panel station-entry${alternate ? ' station-entry-alternate' : ''}`}>
        <p><EmojiText text={entry.content} /></p>
      </article>
    );
  return (
    <article
      className={`station-panel station-entry${entry.root ? " station-entry-root" : ""}${alternate ? ' station-entry-alternate' : ''}`}
    >
      {entry.root && (
        <span className="station-topic-label">{translate("Publicação inicial")}</span>
      )}
      <header>
        {entry.nomad ? (
          <strong>{entry.alias}</strong>
        ) : (
          <Link
            to={`/profile/${encodeURIComponent(entry.author?.username ?? "")}`}
          >
            {entry.author?.name}
          </Link>
        )}
        <time dateTime={entry.createdAt}>
          {new Date(entry.createdAt).toLocaleString(getLanguage())}
        </time>
      </header>
      {entry.replyToName && <div className="forum-reply-context">{translate('Respondendo a {name}', { name: entry.replyToName })}</div>}
      <p><EmojiText text={entry.content} /></p>
      {entry.imageUrl && (
        <ExpandableImage src={entry.imageUrl} alt="Imagem da conversa" />
      )}
      <div className="station-entry-actions">
        <button
          className="forum-like"
          aria-pressed={entry.liked}
          disabled={mutation.isPending || !canPost}
          onClick={() => mutation.mutate("like")}
        >
          {entry.liked ? "♥" : "♡"} {entry.likesCount} ·{" "}
          {entry.liked ? translate("Descurtir") : translate("Curtir")}
        </button>
        {canPost && onReply && <button className="forum-reply-button" onClick={() => onReply(entry)}>{translate('Responder')}</button>}
        <ReportButton targetType="FORUM" targetId={entry.id} authorId={entry.author?.id} canReport={!entry.mine}
          menuActions={[
            ...(entry.mine || canManage ? [{ label: translate("Retirar"), disabled: mutation.isPending, onSelect: () => {
              if (confirm(translate("Retirar este conteúdo da conversa?"))) mutation.mutate("remove");
            } }] : []),
            ...(entry.canBan ? [{ label: translate("Remover membro"), disabled: mutation.isPending, onSelect: () => {
              if (confirm(translate("Impedir novas participações deste membro nesta estação?"))) mutation.mutate("ban");
            } }] : []),
          ]} />
      </div>
      {mutation.isError && <p role="alert">{translate(mutation.error.message)}</p>}
      {children}
    </article>
  );
}
function ReplyThread({ entry, canManage, canPost, stationId, alternate, initiallyOpen = false }: {
  entry: Entry; canManage: boolean; canPost: boolean; stationId: string; alternate: boolean; initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Entry | null>(null);
  const [notice, setNotice] = useState('');
  const thread = useQuery({
    queryKey: ['stations', 'thread', entry.topicId, entry.id, page],
    queryFn: () => conversation(entry.topicId, 'oldest', page, entry.id),
    enabled: open && !entry.removed,
  });
  function reply(value: Entry) { setTarget(value); setOpen(true); setNotice(''); }
  const count = thread.data?.meta.total ?? entry.repliesCount ?? 0;
  return <EntryCard entry={entry} canManage={canManage} canPost={canPost} stationId={stationId} alternate={alternate} onReply={reply}>
    {!entry.removed && (count > 0 || open) && <button className="forum-thread-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
      <ChevronLeft size={15} aria-hidden="true" style={{ transform: open ? 'rotate(90deg)' : 'rotate(-90deg)' }} />
      {open ? translate('Recolher respostas') : translate('Ver {count} respostas', { count })}
    </button>}
    {open && !entry.removed && <div className="forum-thread">
      {thread.isPending && <p role="status">{translate('Carregando...')}</p>}
      {thread.isError && <p role="alert">{translate(thread.error.message)} <button onClick={() => thread.refetch()}>{translate('Tentar novamente')}</button></p>}
      {!thread.isError && thread.data?.data.entries.map((child, index) => <EntryCard key={child.id} entry={child} canManage={canManage} canPost={canPost} stationId={stationId} alternate={index % 2 === 0} onReply={reply} />)}
      {thread.data && thread.data.meta.pages > 1 && <Pages page={thread.data.meta.page} pages={thread.data.meta.pages} change={setPage} />}
      {target && canPost && <div className="forum-inline-composer">
        <div className="forum-reply-context"><span>{translate('Respondendo a {name}', { name: target.nomad ? target.alias ?? translate('Nômade Oculto') : `@${target.author?.username ?? ''}` })}</span><button aria-label={translate('Cancelar')} onClick={() => setTarget(null)}><X size={16} /></button></div>
        <Composer key={target.id} path={`topics/${entry.topicId}/replies`} replyToId={target.id} onCreated={(message) => { setTarget(null); setNotice(message); }} />
      </div>}
      {notice && <p role="status">{translate(notice)}</p>}
    </div>}
  </EntryCard>;
}
export function TopicPage() {
  useLanguage();
  const { topicId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("oldest");
  const query = useQuery({
    queryKey: ["stations", "topic", topicId, sort, page, params.get('thread')],
    queryFn: () => conversation(topicId, sort, page, undefined, params.get('thread') ?? undefined),
  });
  const t = query.isError ? undefined : query.data?.data;
  return (
    <section className="stations-page station-conversation" data-station-theme={t?.stationTheme}>
      {query.isPending && <p>{translate("Carregando conversa...")}</p>}
      {query.isError && (
        <p role="alert">
          {translate(query.error.message)}{" "}
          <Link to="/communities">{translate("Voltar às estações")}</Link>
        </p>
      )}
      {t && (
        <>
          <header className="topic-heading">
            <Link className="topic-station-link" to={`/communities/${t.stationId}`}><span aria-hidden="true">‹</span>{t.stationName}</Link>
            <div className="topic-heading-title"><span className="topic-kind">{translate("Tópico")}</span><h1>{t.title}</h1></div>
          </header>
          {t.root && (
            <EntryCard
              entry={t.root}
              canManage={t.canManage}
              canPost={t.canPost}
              stationId={t.stationId}
            />
          )}
          <h2>{translate("Respostas")}</h2>
          <div className="station-sort topic-reply-sort" role="group" aria-label={translate("Respostas")}>
            <button
              aria-pressed={sort === "oldest" && page === 1}
              onClick={() => {
                setSort("oldest");
                setPage(1);
              }}
            >
              {translate(" Primeira resposta ")}</button>
            <button
              aria-pressed={sort === "oldest" && page === query.data!.meta.pages && page > 1}
              onClick={() => {
                setSort("oldest");
                setPage(query.data!.meta.pages);
              }}
            >
              {translate(" Última resposta ")}</button>
            <button
              aria-pressed={sort === "liked"}
              onClick={() => {
                setSort("liked");
                setPage(1);
              }}
            >
              {translate(" Mais curtidas ")}</button>
          </div>
          {t.entries.map((e, index) => (
            <ReplyThread
              key={e.id}
              initiallyOpen={params.get('thread') === e.id}
              alternate={index % 2 === 0}
              entry={e}
              canManage={t.canManage}
              canPost={t.canPost}
              stationId={t.stationId}
            />
          ))}
          {t.entries.length === 0 && <p>{translate("Ainda não há respostas.")}</p>}
          <Pages
            page={query.data!.meta.page}
            pages={query.data!.meta.pages}
            change={(next) => { setParams(previous => { previous.delete('thread'); return previous; }, { replace: true }); setPage(next); }}
          />
          {t.canPost ? (
            <Composer path={`topics/${topicId}/replies`} />
          ) : (
            !t.root?.removed && <p>{translate("Entre na estação para participar.")}</p>
          )}
        </>
      )}
    </section>
  );
}
