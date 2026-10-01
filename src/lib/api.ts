import { t } from '@/i18n';
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

let refreshing: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-Moment-Client': 'web' },
      signal: AbortSignal.timeout(10000),
    });

    return res.ok;
  } catch {
    return false;
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
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: resolveHeaders(options),
  });

  if (res.status === 401 && _retry) {
    if (!refreshing) refreshing = refreshToken().finally(() => { refreshing = null; });
    if (!await refreshing) throw new Error(t('Sua sessão expirou. Entre novamente.'));
    return api<T>(url, options, false);
  }

  if (res.status === 401 && !_retry) {
    throw new Error(t('Sua sessão expirou. Entre novamente.'));
  }

  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    if (!res.ok) {
      throw new Error(await parseResponseError(res));
    }

    throw new Error(t("Resposta inválida do servidor"));
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(t(typeof data?.message === 'string' ? data.message : t("Erro na requisição")));
  }

  return data;
}
