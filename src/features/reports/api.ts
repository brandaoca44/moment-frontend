import { t } from '@/i18n';
import { api } from '@/lib/api';

export const reasons = { get HATE() { return t("Racismo, discurso de ódio ou discriminação"); }, get HARASSMENT() { return t("Assédio ou intimidação"); }, get VIOLENCE() { return t("Ameaças ou violência"); }, get SEXUAL() { return t("Conteúdo sexual inadequado"); }, get SPAM() { return t("Spam ou golpe"); }, get OTHER() { return t("Outro motivo"); } };
export type TargetType = 'POST' | 'REPLY' | 'FORUM' | 'STATION';
export type Report = {
  id: string; targetType: TargetType; targetId: string; reason: keyof typeof reasons; details: string;
  contentSnapshot: string; imageSnapshot: string | null; status: string; createdAt: string;
  reviewNote: string | null; reviewedAt: string | null;
  current: { content: string; imageUrl?: string | null; moderationStatus: string } | null;
};
export const sendReport = (input: { targetType: TargetType; targetId: string; reason: string; details: string }) => api<{ message: string }>('/reports', { method: 'POST', body: JSON.stringify(input) });
export const getReports = (status: string, cursor?: string, reason?: string) => api<{ data: Report[]; meta: { nextCursor: string | null } }>(`/reports?${new URLSearchParams({ status, ...(cursor ? { cursor } : {}), ...(reason ? { reason } : {}) })}`);
export const reviewReport = (id: string, action: 'DISMISS' | 'HIDE', note: string) => api(`/reports/${encodeURIComponent(id)}/review`, { method: 'POST', body: JSON.stringify({ action, note }) });
