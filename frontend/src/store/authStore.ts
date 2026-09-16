import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';
import { api, ApiError } from '../lib/api';
import { getToken, setToken, clearToken } from '../lib/token';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loadMe: () => Promise<void>;
}

export const dashboardPathByRole: Record<Role, string> = {
  admin: '/admin',
  coordinatrice: '/coordinatrice',
  agent_bureau: '/agent-bureau',
  agent_terrain: '/agent-terrain',
  client: '/client',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const { token, user } = await api.post<{ token: string; user: User }>('/auth/login', {
            email: email.trim().toLowerCase(),
            password,
          });
          setToken(token);
          set({ user, isAuthenticated: true });
          return { success: true };
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : 'Connexion impossible. Réessayez.';
          return { success: false, error: msg };
        }
      },

      logout: () => {
        clearToken();
        set({ user: null, isAuthenticated: false });
      },

      // Validate the stored token on app start; refresh the user or sign out.
      loadMe: async () => {
        if (!getToken()) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const { user } = await api.get<{ user: User }>('/auth/me');
          set({ user, isAuthenticated: true });
        } catch {
          clearToken();
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'immogest-auth',
    }
  )
);
