import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ExpandableImage } from "@/components/ui/expandable-image";

type Pending = {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
};
function PendingCard({ item, type }: { item: Pending; type: string }) {
  const client = useQueryClient();
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const review = useMutation({
    mutationFn: (action: string) =>
      api(`/reports/pending-content/${encodeURIComponent(item.id)}/review`, {
        method: "POST",
        body: JSON.stringify({ type, action, note }),
      }),
    onSuccess: async () => {
      await Promise.all(
        [
          "pending-content",
          "feed",
          "user-posts",
          "post",
          "replies",
          "explore",
          "notifications",
        ].map((key) => client.invalidateQueries({ queryKey: [key] })),
      );
    },
  });
  return (
    <details
      className="report-card"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        {type === "POST" ? "Momento" : "Resposta"} ·{" "}
        {new Date(item.createdAt).toLocaleString("pt-BR")}
      </summary>
      {open && (
        <div className="report-expanded">
          <p className="report-content">{item.content}</p>
          {item.imageUrl && (
            <ExpandableImage
              src={item.imageUrl}
              alt="Imagem para revisão"
              className="report-image"
            />
          )}
          <p>
            Verifique contexto, nudez, assédio, campanha política, destino
            comercial e possíveis dados pessoais antes de aprovar. Um domínio
            conhecido não garante um vendedor confiável.
          </p>
          <label>
            Justificativa
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
            />
          </label>
          <div className="report-controls">
            <button
              disabled={review.isPending || !note.trim()}
              onClick={() => review.mutate("APPROVE")}
            >
              Aprovar publicação
            </button>
            <button
              disabled={review.isPending || !note.trim()}
              onClick={() => review.mutate("HIDE")}
            >
              Rejeitar publicação
            </button>
          </div>
          {review.isError && <p role="alert">{review.error.message}</p>}
        </div>
      )}
    </details>
  );
}
export function PendingContent() {
  const [type, setType] = useState("POST");
  const query = useInfiniteQuery({
    queryKey: ["pending-content", type],
    queryFn: ({ pageParam }) =>
      api<{ data: Pending[]; meta: { nextCursor: string | null } }>(
        `/reports/pending-content?${new URLSearchParams({ type, ...(pageParam ? { cursor: pageParam } : {}) })}`,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.meta.nextCursor ?? undefined,
  });
  return (
    <details className="report-card">
      <summary>Publicações aguardando moderação</summary>
      <div className="report-expanded">
        <p>
          Esta fila inclui retenções automáticas e falhas temporárias da
          moderação. Publicações das Estações ficam na fila de revisão das
          Estações.
        </p>
        <label>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="POST">Momentos</option>
            <option value="REPLY">Respostas</option>
          </select>
        </label>
        {query.isPending && <p role="status">Carregando...</p>}
        {query.isError && (
          <p role="alert">
            {query.error.message}{" "}
            <button onClick={() => query.refetch()}>Tentar novamente</button>
          </p>
        )}
        {query.data?.pages
          .flatMap((page) => page.data)
          .map((item) => (
            <PendingCard key={`${type}-${item.id}`} item={item} type={type} />
          ))}
        {query.data?.pages[0].data.length === 0 && (
          <p>Nenhuma publicação aguardando revisão.</p>
        )}
        {query.hasNextPage && (
          <button
            disabled={query.isFetchingNextPage}
            onClick={() => query.fetchNextPage()}
          >
            Carregar mais
          </button>
        )}
      </div>
    </details>
  );
}
