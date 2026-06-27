import { getToken, clearToken } from './token';

const BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token rejected — drop it so the app falls back to the login screen.
    clearToken();
  }

  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch { /* non-JSON error */ }
    throw new ApiError(msg, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Multipart upload (files / documents). Does NOT set Content-Type so the
// browser adds the correct multipart boundary.
async function upload<T>(path: string, form: FormData): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: form });
  if (res.status === 401) clearToken();
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try { const d = await res.json(); if (d?.error) msg = d.error; } catch { /* noop */ }
    throw new ApiError(msg, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:  <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put:  <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del:  <T>(path: string) => request<T>('DELETE', path),
  upload,
};
