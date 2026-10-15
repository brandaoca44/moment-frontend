import { t } from '@/i18n';
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) { super(message); this.name = 'ApiError'; this.status = status; }
}
let refreshing: Promise<'ok' | 'expired' | 'unavailable'> | null = null;

async function refreshToken(): Promise<'ok' | 'expired' | 'unavailable'> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      headers: { 'X-Moment-Client': 'web' },
      signal: AbortSignal.timeout(10000),
    });

    return res.ok ? 'ok' : res.status === 401 ? 'expired' : 'unavailable';
  } catch {
    return 'unavailable';
  }
}

function resolveHeaders(options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;

  const headers = new Headers(options?.headers);
  if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('X-Moment-Client', 'web');
  return headers;
}

async function parseResponseError(res: Response) {
  const contentType = res.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return t("Erro na requisição");
  }

  try {
    const data = await res.json();
    return data?.message || t("Erro na requisição");
  } catch {
    return t("Erro na requisição");
  }
}

export async function api<T = unknown>(
  url: string,
  options?: RequestInit,
  _retry = true,
): Promise<T> {
  if (!url.startsWith('/') || url.startsWith('//')) throw new Error(t('Erro na requisição'));
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    referrerPolicy: 'no-referrer',
    headers: resolveHeaders(options),
  });

  if (res.status === 401 && _retry) {
    if (!refreshing) refreshing = refreshToken().finally(() => { refreshing = null; });
    const refreshed = await refreshing;
    if (refreshed === 'expired') {
      window.dispatchEvent(new Event('moment:session-ended'));
      throw new ApiError(t('Sua sessão expirou. Entre novamente.'), 401);
    }
    if (refreshed !== 'ok') throw new ApiError(t('Não foi possível renovar a sessão. Tente novamente.'), 503);
    return api<T>(url, options, false);
  }

  if (res.status === 401 && !_retry) {
    window.dispatchEvent(new Event('moment:session-ended'));
    throw new ApiError(t('Sua sessão expirou. Entre novamente.'), 401);
  }

  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    if (!res.ok) {
      throw new ApiError(await parseResponseError(res), res.status);
    }

    throw new Error(t("Resposta inválida do servidor"));
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(t(typeof data?.message === 'string' ? data.message : t("Erro na requisição")), res.status);
  }

  return data;
}
