import { api } from "@/lib/api";
export const categories = [
  "Culinária",
  "Games",
  "Arte",
  "Bem-estar",
  "Tecnologia",
  "Cotidiano",
  "Política",
  "Leitura",
  "Decoração",
  "Moda e Estilos",
  "Música",
  "Cinema e Séries",
  "Esportes",
  "Viagens",
  "Natureza e Animais",
  "Outros",
];
export type Station = {
  theme?: string;
  id: string;
  name: string;
  description: string;
  category: string;
  rules: string;
  coverUrl?: string | null;
  ownerId: string;
  status: string;
  joined?: boolean;
  banned?: boolean;
  canManage?: boolean;
  membersCount?: number;
  _count?: { members: number };
};
export type Entry = {
  removed?: boolean;
  id: string;
  topicId: string;
  content: string;
  imageUrl: string | null;
  root: boolean;
  nomad: boolean;
  alias: string | null;
  author: { id: string; name: string; username: string } | null;
  mine: boolean;
  createdAt: string;
  liked: boolean;
  likesCount: number;
  moderationStatus: string;
  title?: string;
  requiresPlatform?: boolean;
};
export type Topic = {
  creator?: string;
  id: string;
  title: string;
  lastActivity: string;
  _count: { entries: number };
};
export type Page<T> = { data: T[]; meta: { pages: number; total?: number } };
export type Conversation = {
  data: {
    id: string;
    title: string;
    stationId: string;
    stationName: string;
    stationTheme?: string;
    canManage: boolean;
    canPost: boolean;
    root: Entry | null;
    entries: Entry[];
  };
  meta: { pages: number; total: number; page: number };
};
export type EntryInput = {
  content: string;
  nomad: boolean;
  imageUrl?: string;
  title?: string;
};
export const stations = (tab: string, page = 1, category = "", search = "") =>
  api<Page<Station>>(
    `/stations?${new URLSearchParams({ tab, page: String(page), ...(category ? { category } : {}), ...(search ? { search } : {}) })}`,
  );
export const station = (id: string) =>
  api<{ data: Station }>(`/stations/${encodeURIComponent(id)}`);
export const topics = (id: string, sort: string, page: number) =>
  api<Page<Topic>>(
    `/stations/${encodeURIComponent(id)}/topics?${new URLSearchParams({ sort, page: String(page) })}`,
  );
export const conversation = (id: string, sort: string, page: number) =>
  api<Conversation>(
    `/stations/topics/${encodeURIComponent(id)}?${new URLSearchParams({ sort, page: String(page) })}`,
  );
export const queue = (id: string, page: number) =>
  api<Page<Entry>>(
    `/stations/${id ? `${encodeURIComponent(id)}/queue` : "review/entries"}?page=${page}`,
  );
export const write = <T = { message: string }>(
  path: string,
  body?: unknown,
  method = "POST",
) =>
  api<T>(`/stations/${path}`, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
