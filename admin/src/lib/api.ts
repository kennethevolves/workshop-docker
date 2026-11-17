const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string;
  body?: unknown;
  formData?: FormData;
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
      cache: 'no-store',
    });

    if (response.status === 204) {
      return { ok: true, data: undefined as T };
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return { ok: false, status: response.status, message: errorMessage(data) };
    }

    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, message: 'No se pudo conectar con el API' };
  }
}

export async function apiGet<T>(path: string, token?: string): Promise<T | null> {
  const result = await apiFetch<T>(path, { token });
  return result.ok ? result.data : null;
}

function errorMessage(data: unknown): string {
  const message = (data as { message?: unknown } | null)?.message;

  if (Array.isArray(message)) {
    return message.join('. ');
  }
  if (typeof message === 'string') {
    return message;
  }
  return 'Ocurrió un error inesperado';
}
