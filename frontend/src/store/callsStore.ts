import { create } from 'zustand';
import type { Call } from '../types';
import { api } from '../lib/api';

interface CallsState {
  calls: Call[];
  loaded: boolean;
  load: () => Promise<void>;
  addCall: (call: Call) => void;
  getCallsByAgent: (agentId: string) => Call[];
}

export const useCallsStore = create<CallsState>((set, get) => ({
  calls: [],
  loaded: false,

  // Role-scoped server-side: admin/coordinatrice get all calls, agents get their own.
  load: async () => {
    try {
      const calls = await api.get<Call[]>('/calls');
      set({ calls, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addCall: (call) => {
    set((state) => ({ calls: [call, ...state.calls] }));
    api.post<Call>('/calls', call)
      .then((saved) => set((state) => ({
        calls: state.calls.map((c) => (c.id === call.id ? saved : c)),
      })))
      .catch(() => get().load());
  },

  getCallsByAgent: (agentId) =>
    get()
      .calls.filter((c) => c.agentId === agentId)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
}));
