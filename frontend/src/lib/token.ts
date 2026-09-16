// JWT storage, shared by the auth store and the API client (avoids a circular import).
const KEY = 'immogest-token';

export function getToken(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function setToken(token: string): void {
  try { localStorage.setItem(KEY, token); } catch { /* ignore */ }
}

export function clearToken(): void {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
