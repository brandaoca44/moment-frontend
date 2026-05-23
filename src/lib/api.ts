const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    return res.ok;
  } catch {
    return false;
  }
}

function resolveHeaders(options?: RequestInit) {
  const isFormData = options?.body instanceof FormData;

  return {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options?.headers,
  };
}

async function parseResponseError(res: Response) {
  const contentType = res.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return 'Erro na requisição';
  }

  try {
    const data = await res.json();
    return data?.message || 'Erro na requisição';
  } catch {
    return 'Erro na requisição';
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
    if (!isRefreshing) {
      isRefreshing = true;
      const success = await refreshToken();
      isRefreshing = false;

      if (!success) {
        pendingRequests = [];
        throw new Error('SESSION_EXPIRED');
      }

      pendingRequests.forEach((callback) => callback());
      pendingRequests = [];

      return api<T>(url, options, false);
    }

    return new Promise((resolve, reject) => {
      pendingRequests.push(() => {
        api<T>(url, options, false).then(resolve).catch(reject);
      });
    });
  }

  if (res.status === 401 && !_retry) {
    throw new Error('SESSION_EXPIRED');
  }

  if (res.status === 204) {
    return null as T;
  }

  const contentType = res.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    if (!res.ok) {
      throw new Error(await parseResponseError(res));
    }

    throw new Error('Resposta inválida do servidor');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || 'Erro na requisição');
  }

  return data;
}
