import { getLanguage } from '@/i18n';
import { t as translate, useLanguage } from '@/i18n';
import { EmojiText } from '@/components/ui/emoji-text';
import { useState } from "react";
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
          {translate(" Nome, descrição, regras e capa passam pela aprovação da equipe. A troca de cor é imediata. ")}</p>
        <button
          disabled={send.isPending || (file?.size ?? 0) > 5 * 1024 * 1024}
        >
          {send.isPending ? translate("Enviando...") : translate("Enviar para aprovação")}
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
        {translate(" Justificativa ")}<textarea
          maxLength={1000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
      <div className="station-controls">
        <button
          disabled={!note.trim() || mutation.isPending}
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
function Composer({ path, topic = false }: { path: string; topic?: boolean }) {
  useLanguage();
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
        ...(topic ? { title } : {}),
        ...(imageUrl ? { imageUrl } : {}),
      };
      return write(path, input);
    },
    onSuccess: async () => {
      setContent("");
      setTitle("");
      setFile(null);
      setFileKey((k) => k + 1);
      await refresh();
    },
  });
  return (
    <form
      className="station-panel"
      onSubmit={(e) => {
        e.preventDefault();
        if (!send.isPending && content.trim() && content.length <= limit)
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
      <label>
        {translate(" Participar como ")}<select
          value={nomad ? "nomad" : "profile"}
          disabled={send.isPending}
          onChange={(e) => {
            setNomad(e.target.value === "nomad");
            setFile(null);
            setFileKey((k) => k + 1);
          }}
        >
          <option value="profile">{translate("Meu perfil")}</option>
          <option value="nomad">{translate("Nômade Oculto")}</option>
        </select>
      </label>
      {nomad && (
        <p className="station-muted">
          {translate(" Seu perfil não será exibido. A equipe do Moment mantém sua identificação para aplicar as regras. Apenas texto; publicação após aprovação. ")}</p>
      )}
      <label>
        {translate(" Mensagem ")}<textarea
          required
          maxLength={limit}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={send.isPending}
        />
      </label>
      <small>
        {content.length}/{limit}
      </small>
      {!nomad && (
        <label>
          {translate(" Imagem ou GIF — até 5 MB ")}<input
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={send.isPending}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
      {(file?.size ?? 0) > 5 * 1024 * 1024 && (
        <p role="alert">{translate("A imagem deve ter até 5 MB.")}</p>
      )}
      <div className="station-controls">
        <button
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
              : "Publicar"}
        </button>
      </div>
      {send.isError && <p role="alert">{translate(send.error.message)}</p>}
      {send.isSuccess && <p role="status">{translate(send.data.message)}</p>}
    </form>
  );
}
function ReviewQueue({ id }: { id: string }) {
  useLanguage();
  return (
    <StationDialog label={translate("Revisar publicações")}>
      <ReviewQueueContent id={id} />
    </StationDialog>
  );
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
      <Link to="/communities">{translate("Todas as estações")}</Link>
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
          <div className="station-toolbar">
            <StationDialog label={translate("Regras")} title={translate("Regras da estação")}>
              <p>{s.rules}</p>
            </StationDialog>
            {s.canManage && (
              <>
                <StationForm current={s} />
                <ReviewQueue id={id} />
              </>
            )}
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
                    <Composer path={`${id}/topics`} topic />
                  </StationDialog>
                )}
              </div>
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
}: {
  entry: Entry;
  canManage: boolean;
  canPost: boolean;
  stationId: string;
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
      <article className="station-panel">
        <p><EmojiText text={entry.content} /></p>
      </article>
    );
  return (
    <article
      className={`station-panel station-entry${entry.root ? " station-entry-root" : ""}`}
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
      <p><EmojiText text={entry.content} /></p>
      {entry.imageUrl && (
        <ExpandableImage src={entry.imageUrl} alt="Imagem da conversa" />
      )}
      <div className="station-controls">
        <button
          className="forum-like"
          aria-pressed={entry.liked}
          disabled={mutation.isPending || !canPost}
          onClick={() => mutation.mutate("like")}
        >
          {entry.liked ? "♥" : "♡"} {entry.likesCount} ·{" "}
          {entry.liked ? translate("Descurtir") : translate("Curtir")}
        </button>
        {!entry.mine && <ReportButton targetType="FORUM" targetId={entry.id} authorId={entry.author?.id} />}
        {(entry.mine || canManage) && (
          <button
            disabled={mutation.isPending}
            onClick={() => {
              if (confirm(translate("Retirar este conteúdo da conversa?")))
                mutation.mutate("remove");
            }}
          >
            {translate(" Retirar ")}</button>
        )}
        {canManage && !entry.mine && (
          <button
            disabled={mutation.isPending}
            onClick={() => {
              if (
                confirm(
                  translate("Impedir novas participações deste membro nesta estação?"),
                )
              )
                mutation.mutate("ban");
            }}
          >
            {translate(" Remover membro ")}</button>
        )}
      </div>
      {mutation.isError && <p role="alert">{translate(mutation.error.message)}</p>}
    </article>
  );
}
export function TopicPage() {
  useLanguage();
  const { topicId = "" } = useParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("oldest");
  const query = useQuery({
    queryKey: ["stations", "topic", topicId, sort, page],
    queryFn: () => conversation(topicId, sort, page),
  });
  const t = query.isError ? undefined : query.data?.data;
  return (
    <section className="stations-page" data-station-theme={t?.stationTheme}>
      {query.isPending && <p>{translate("Carregando conversa...")}</p>}
      {query.isError && (
        <p role="alert">
          {translate(query.error.message)}{" "}
          <Link to="/communities">{translate("Voltar às estações")}</Link>
        </p>
      )}
      {t && (
        <>
          <Link to={`/communities/${t.stationId}`}>{t.stationName}</Link>
          <span className="station-topic-label">{translate("Tópico")}</span>
          <h1>{t.title}</h1>
          {t.root && (
            <EntryCard
              entry={t.root}
              canManage={t.canManage}
              canPost={t.canPost}
              stationId={t.stationId}
            />
          )}
          <h2>{translate("Respostas")}</h2>
          <div className="station-controls">
            <button
              onClick={() => {
                setSort("oldest");
                setPage(1);
              }}
            >
              {translate(" Primeira resposta ")}</button>
            <button
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
          {t.entries.map((e) => (
            <EntryCard
              key={e.id}
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
            change={setPage}
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
