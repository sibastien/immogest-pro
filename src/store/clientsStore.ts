import { create } from 'zustand';
import type { Client } from '../types';
import { api } from '../lib/api';

interface ClientFilters {
  type?: Client['type'];
  status?: Client['status'];
  agentId?: string;
  search?: string;
}

interface ClientsState {
  clients: Client[];
  loaded: boolean;
  filters: ClientFilters;
  selectedClient: Client | null;
  load: () => Promise<void>;
  setFilters: (filters: Partial<ClientFilters>) => void;
  resetFilters: () => void;
  selectClient: (id: string | null) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  getFilteredClients: () => Client[];
  getClientById: (id: string) => Client | undefined;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  loaded: false,
  filters: {},
  selectedClient: null,

  load: async () => {
    try {
      const clients = await api.get<Client[]>('/clients');
      set({ clients, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: {} }),

  selectClient: (id) => {
    const client = id ? get().clients.find((c) => c.id === id) ?? null : null;
    set({ selectedClient: client });
  },

  // Optimistic: update the cache immediately, then persist to the API.
  addClient: (client) => {
    set((state) => ({ clients: [client, ...state.clients] }));
    api.post<Client>('/clients', client)
      .then((saved) => set((state) => ({
        clients: state.clients.map((c) => (c.id === client.id ? saved : c)),
      })))
      .catch(() => get().load());
  },

  updateClient: (id, updates) => {
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
    api.put<Client>(`/clients/${id}`, updates).catch(() => get().load());
  },

  getFilteredClients: () => {
    const { clients, filters } = get();
    return clients.filter((c) => {
      if (filters.type && c.type !== filters.type) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.agentId && c.agentId !== filters.agentId) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  },

  getClientById: (id) => get().clients.find((c) => c.id === id),
}));
