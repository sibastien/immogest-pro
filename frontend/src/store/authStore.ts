import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role, Tenant } from '../types';
import { api, ApiError } from '../lib/api';
import { getToken, setToken, clearToken } from '../lib/token';

interface RegisterData {
  agencyName: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, agencySlug?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loadMe: () => Promise<void>;
  setTenant: (tenant: Tenant | null) => void;
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
      tenant: null,
      isAuthenticated: false,

      login: async (email: string, password: string, agencySlug?: string) => {
        try {
          const { token, user, tenant } = await api.post<{ token: string; user: User; tenant: Tenant }>('/auth/login', {
            email: email.trim().toLowerCase(),
            password,
            agencySlug: agencySlug ? agencySlug.trim() : undefined,
          });
          setToken(token);
          set({ user, tenant: tenant || null, isAuthenticated: true });
          return { success: true };
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : 'Connexion impossible. Réessayez.';
          return { success: false, error: msg };
        }
      },

      register: async (data: RegisterData) => {
        try {
          const { token, user, tenant } = await api.post<{ token: string; user: User; tenant: Tenant }>('/auth/register', {
            agencyName: data.agencyName.trim(),
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            password: data.password,
            phone: data.phone?.trim(),
          });
          setToken(token);
          set({ user, tenant: tenant || null, isAuthenticated: true });
          return { success: true };
        } catch (e) {
          const msg = e instanceof ApiError ? e.message : 'Création du compte impossible. Réessayez.';
          return { success: false, error: msg };
        }
      },

      logout: () => {
        clearToken();
        set({ user: null, tenant: null, isAuthenticated: false });
      },

      loadMe: async () => {
        if (!getToken()) {
          set({ user: null, tenant: null, isAuthenticated: false });
          return;
        }
        try {
          const { user, tenant } = await api.get<{ user: User; tenant: Tenant }>('/auth/me');
          set({ user, tenant: tenant || null, isAuthenticated: true });
        } catch {
          clearToken();
          set({ user: null, tenant: null, isAuthenticated: false });
        }
      },

      setTenant: (tenant) => set({ tenant }),
    }),
    {
      name: 'immogest-auth',
    }
  )
);
