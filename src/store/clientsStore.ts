import { create } from 'zustand';
import type { Client } from '../types';
import { mockClients } from '../data/mockClients';

interface ClientFilters {
  type?: Client['type'];
  status?: Client['status'];
  agentId?: string;
  search?: string;
}

interface ClientsState {
  clients: Client[];
  filters: ClientFilters;
  selectedClient: Client | null;
  setFilters: (filters: Partial<ClientFilters>) => void;
  resetFilters: () => void;
  selectClient: (id: string | null) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  getFilteredClients: () => Client[];
  getClientById: (id: string) => Client | undefined;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: mockClients,
  filters: {},
  selectedClient: null,

  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: {} }),

  selectClient: (id) => {
    const client = id ? get().clients.find((c) => c.id === id) ?? null : null;
    set({ selectedClient: client });
  },

  addClient: (client) =>
    set((state) => ({ clients: [client, ...state.clients] })),

  updateClient: (id, updates) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

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
