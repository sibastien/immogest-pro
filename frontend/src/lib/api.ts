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

// Multipart upload (files / documents). Uses XMLHttpRequest (not fetch) so we
// can report upload progress via the optional onProgress callback (0-100).
// Does NOT set Content-Type so the browser adds the correct multipart boundary.
function upload<T>(path: string, form: FormData, onProgress?: (percent: number) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE}${path}`);
    const token = getToken();
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 401) clearToken();
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText) as T); }
        catch { resolve(undefined as T); }
        return;
      }
      let msg = `Erreur ${xhr.status}`;
      try { const d = JSON.parse(xhr.responseText); if (d?.error) msg = d.error; } catch { /* non-JSON error */ }
      reject(new ApiError(msg, xhr.status));
    };

    xhr.onerror = () => reject(new ApiError('Erreur réseau pendant l\'envoi.', 0));
    xhr.send(form);
  });
}

export const api = {
  get:  <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  put:  <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  del:  <T>(path: string) => request<T>('DELETE', path),
  upload,
};
