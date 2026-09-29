import { useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  return (
    <nav className="station-controls" aria-label="Páginas">
      <button disabled={page <= 1} onClick={() => change(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {pages}
      </span>
      <button disabled={page >= pages} onClick={() => change(page + 1)}>
        Próxima
      </button>
    </nav>
  );
}
function StationForm({ current }: { current?: Station }) {
  const refresh = useRefresh();
  const [name, setName] = useState(current?.name ?? "");
  const [description, setDescription] = useState(current?.description ?? "");
  const [rules, setRules] = useState(
    current?.rules ??
      "Respeite as pessoas, converse com gentileza e siga as regras do Moment.",
  );
  const [category, setCategory] = useState(current?.category ?? categories[0]);
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
          ...(coverUrl ? { coverUrl } : {}),
        },
        current ? "PATCH" : "POST",
      );
    },
    onSuccess: refresh,
  });
  return (
    <details className="station-panel">
      <summary>{current ? "Editar estação" : "Criar uma estação"}</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!send.isPending) send.mutate();
        }}
      >
        <label>
          Nome
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={3}
            maxLength={80}
            required
          />
        </label>
        <label>
          Categoria
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Descrição
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={1000}
            required
          />
        </label>
        <label>
          Regras
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            minLength={10}
            maxLength={1500}
            required
          />
        </label>
        <label>
          Capa opcional — até 5 MB
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <p className="station-muted">
          Criações e alterações passam pela aprovação da equipe do Moment.
        </p>
        <button
          disabled={send.isPending || (file?.size ?? 0) > 5 * 1024 * 1024}
        >
          {send.isPending ? "Enviando..." : "Enviar para aprovação"}
        </button>
        {send.isError && <p role="alert">{send.error.message}</p>}
        {send.isSuccess && <p role="status">{send.data.message}</p>}
      </form>
    </details>
  );
}
function Decision({ path }: { path: string }) {
  const [note, setNote] = useState("");
  const refresh = useRefresh();
  const mutation = useMutation({
    mutationFn: (action: string) => write(path, { action, note }),
    onSuccess: refresh,
  });
  return (
    <div>
      <label>
        Justificativa
        <textarea
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
          Aprovar
        </button>
        <button
          disabled={!note.trim() || mutation.isPending}
          onClick={() => mutation.mutate("HIDE")}
        >
          Retirar / rejeitar
        </button>
      </div>
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </div>
  );
}
export function StationsPage() {
  const [tab, setTab] = useState("discover");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const me = useMe().data?.data.user;
  const list = useQuery({
    queryKey: ["stations", "list", tab, page, category],
    queryFn: () => stations(tab, page, category),
  });
  return (
    <section className="stations-page">
      <h1>Estações</h1>
      <p>
        Encontre sua estação. Compartilhe interesses, ideias e boas conversas.
      </p>
      <div className="station-controls">
        {[
          ["discover", "Descobrir"],
          ["mine", "Minhas estações"],
          ...(me?.canModerate ? [["pending", "Aprovar estações"]] : []),
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={tab === key}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <StationForm />
      {me?.canModerate && <ReviewQueue id="" />}
      <label>
        Interesse
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os interesses</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {list.isPending && <p role="status">Carregando estações...</p>}
      {list.isError && <p role="alert">{list.error.message}</p>}
      {list.data?.data.map((s) => (
        <article key={s.id} className="station-panel">
          {s.coverUrl && (
            <img className="station-cover" src={s.coverUrl} alt="" />
          )}
          <small>
            {s.category} · {s._count?.members} membros
          </small>
          <h2>
            <Link to={`/communities/${s.id}`}>{s.name}</Link>
          </h2>
          <p>{s.description}</p>
          {s.status !== "APPROVED" && (
            <p>Aguardando aprovação ou indisponível.</p>
          )}
          {tab === "pending" && <Decision path={`${s.id}/review`} />}
        </article>
      ))}
      {list.data?.data.length === 0 && <p>Nenhuma estação por aqui ainda.</p>}
      {list.data && (
        <Pages page={page} pages={list.data.meta.pages} change={setPage} />
      )}
    </section>
  );
}
function Composer({ path, topic = false }: { path: string; topic?: boolean }) {
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
      <h2>{topic ? "Abrir um tópico" : "Responder"}</h2>
      {topic && (
        <label>
          Título
          <input
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
        Participar como
        <select
          value={nomad ? "nomad" : "profile"}
          disabled={send.isPending}
          onChange={(e) => {
            setNomad(e.target.value === "nomad");
            setFile(null);
            setFileKey((k) => k + 1);
          }}
        >
          <option value="profile">Meu perfil</option>
          <option value="nomad">Nômade Oculto</option>
        </select>
      </label>
      {nomad && (
        <p className="station-muted">
          Seu perfil não será exibido. A equipe do Moment mantém sua
          identificação para aplicar as regras. Apenas texto; publicação após
          aprovação.
        </p>
      )}
      <label>
        Mensagem
        <textarea
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
          Imagem ou GIF — até 5 MB
          <input
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={send.isPending}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
      {(file?.size ?? 0) > 5 * 1024 * 1024 && (
        <p role="alert">A imagem deve ter até 5 MB.</p>
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
            ? "Enviando..."
            : nomad
              ? "Enviar para aprovação"
              : "Publicar"}
        </button>
      </div>
      {send.isError && <p role="alert">{send.error.message}</p>}
      {send.isSuccess && <p role="status">{send.data.message}</p>}
    </form>
  );
}
function ReviewQueue({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const list = useQuery({
    queryKey: ["stations", id, "queue", page],
    queryFn: () => queue(id, page),
  });
  return (
    <details className="station-panel">
      <summary>Revisar publicações pendentes</summary>
      {list.isPending && <p>Carregando...</p>}
      {list.isError && <p role="alert">{list.error.message}</p>}
      {list.data?.data.map((e) => (
        <details className="station-panel" key={e.id}>
          <summary>
            {e.title} · {e.nomad ? e.alias : e.author?.name}
          </summary>
          <p>{e.content}</p>
          {e.imageUrl && (
            <ExpandableImage
              src={e.imageUrl}
              alt="Imagem aguardando aprovação"
            />
          )}
          {e.requiresPlatform && (
            <p>
              Retido pela moderação do Moment. Somente a equipe da plataforma
              pode liberar.
            </p>
          )}
          <Decision path={`entries/${e.id}/review`} />
        </details>
      ))}
      {list.data?.data.length === 0 && (
        <p>Nenhuma publicação aguardando análise.</p>
      )}
      {list.data && (
        <Pages page={page} pages={list.data.meta.pages} change={setPage} />
      )}
    </details>
  );
}
export function StationPage() {
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
    <section className="stations-page">
      <Link to="/communities">Todas as estações</Link>
      {detail.isPending && <p>Carregando...</p>}
      {detail.isError && <p role="alert">{detail.error.message}</p>}
      {s && (
        <>
          {s.coverUrl && (
            <img className="station-cover" src={s.coverUrl} alt="" />
          )}
          <h1>{s.name}</h1>
          <p>{s.description}</p>
          <p>
            {s.category} · {s.membersCount} membros
          </p>
          <details className="station-panel">
            <summary>Regras da estação</summary>
            <p>{s.rules}</p>
          </details>
          {s.status !== "APPROVED" ? (
            <p role="status">
              Esta estação ainda não está disponível para publicação.
            </p>
          ) : (
            <button
              disabled={membership.isPending || s.banned}
              onClick={() => membership.mutate()}
            >
              {s.banned
                ? "Participação removida"
                : s.joined
                  ? "Sair da estação"
                  : "Entrar na estação"}
            </button>
          )}
          {membership.isError && <p role="alert">{membership.error.message}</p>}
          {s.canManage && (
            <>
              <StationForm current={s} />
              <ReviewQueue id={id} />
            </>
          )}
          {s.status === "APPROVED" && (
            <>
              <div className="station-controls">
                <label>
                  Ordenar tópicos
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="recent">Recentes</option>
                    <option value="activity">Última atividade</option>
                    <option value="unanswered">Sem respostas</option>
                  </select>
                </label>
              </div>
              {list.isPending && <p>Carregando tópicos...</p>}
              {list.isError && <p role="alert">{list.error.message}</p>}
              {list.data?.data.map((t) => (
                <Link
                  className="station-topic"
                  key={t.id}
                  to={`/communities/topics/${t.id}`}
                >
                  <strong>{t.title}</strong>
                  <small>
                    {t._count.entries} respostas · Última atividade:{" "}
                    {new Date(t.lastActivity).toLocaleString("pt-BR")}
                  </small>
                </Link>
              ))}
              {list.data?.data.length === 0 && (
                <p>A conversa começa com o primeiro tópico.</p>
              )}
              {list.data && (
                <Pages
                  page={page}
                  pages={list.data.meta.pages}
                  change={setPage}
                />
              )}
              {s.joined && <Composer path={`${id}/topics`} topic />}
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
  return (
    <article className="station-panel station-entry">
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
          {new Date(entry.createdAt).toLocaleString("pt-BR")}
        </time>
      </header>
      <p>{entry.content}</p>
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
          {entry.liked ? "Descurtir" : "Curtir"}
        </button>
        {!entry.mine && <ReportButton targetType="FORUM" targetId={entry.id} />}
        {(entry.mine || canManage) && (
          <button
            disabled={mutation.isPending}
            onClick={() => {
              if (confirm("Retirar este conteúdo da conversa?"))
                mutation.mutate("remove");
            }}
          >
            Retirar
          </button>
        )}
        {canManage && !entry.mine && (
          <button
            disabled={mutation.isPending}
            onClick={() => {
              if (
                confirm(
                  "Impedir novas participações deste membro nesta estação?",
                )
              )
                mutation.mutate("ban");
            }}
          >
            Remover membro
          </button>
        )}
      </div>
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </article>
  );
}
export function TopicPage() {
  const { topicId = "" } = useParams();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("oldest");
  const query = useQuery({
    queryKey: ["stations", "topic", topicId, sort, page],
    queryFn: () => conversation(topicId, sort, page),
  });
  const t = query.isError ? undefined : query.data?.data;
  return (
    <section className="stations-page">
      {query.isPending && <p>Carregando conversa...</p>}
      {query.isError && (
        <p role="alert">
          {query.error.message}{" "}
          <Link to="/communities">Voltar às estações</Link>
        </p>
      )}
      {t && (
        <>
          <Link to={`/communities/${t.stationId}`}>{t.stationName}</Link>
          <h1>{t.title}</h1>
          {t.root && (
            <EntryCard
              entry={t.root}
              canManage={t.canManage}
              canPost={t.canPost}
              stationId={t.stationId}
            />
          )}
          <h2>Respostas</h2>
          <div className="station-controls">
            <button
              onClick={() => {
                setSort("oldest");
                setPage(1);
              }}
            >
              Primeira resposta
            </button>
            <button
              onClick={() => {
                setSort("oldest");
                setPage(query.data!.meta.pages);
              }}
            >
              Última resposta
            </button>
            <button
              aria-pressed={sort === "liked"}
              onClick={() => {
                setSort("liked");
                setPage(1);
              }}
            >
              Mais curtidas
            </button>
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
          {t.entries.length === 0 && <p>Ainda não há respostas.</p>}
          <Pages
            page={query.data!.meta.page}
            pages={query.data!.meta.pages}
            change={setPage}
          />
          {t.canPost ? (
            <Composer path={`topics/${topicId}/replies`} />
          ) : (
            <p>Entre na estação para participar.</p>
          )}
        </>
      )}
    </section>
  );
}
