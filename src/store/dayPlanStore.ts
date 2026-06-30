import { create } from 'zustand';
import type { DayBlock } from '../types';
import { api } from '../lib/api';

interface DayPlanState {
  blocks: DayBlock[];
  loading: boolean;
  load: (date: string, agentId?: string) => Promise<void>;
  addBlock: (block: DayBlock) => void;
  updateBlock: (id: string, patch: Partial<Pick<DayBlock, 'label' | 'color' | 'start' | 'end'>>) => void;
  removeBlock: (id: string) => void;
}

export const useDayPlanStore = create<DayPlanState>((set, get) => ({
  blocks: [],
  loading: false,

  load: async (date, agentId) => {
    set({ loading: true });
    const qs = new URLSearchParams({ date });
    if (agentId) qs.set('agentId', agentId);
    try {
      const blocks = await api.get<DayBlock[]>(`/day-blocks?${qs.toString()}`);
      set({ blocks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addBlock: (block) => {
    set((s) => ({ blocks: [...s.blocks, block] }));
    api.post<DayBlock>('/day-blocks', block)
      .then((saved) => set((s) => ({ blocks: s.blocks.map((b) => (b.id === block.id ? saved : b)) })))
      .catch(() => set((s) => ({ blocks: s.blocks.filter((b) => b.id !== block.id) })));
  },

  updateBlock: (id, patch) => {
    set((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
    api.put<DayBlock>(`/day-blocks/${id}`, patch).catch(() => { /* keep optimistic */ });
  },

  removeBlock: (id) => {
    const prev = get().blocks;
    set({ blocks: prev.filter((b) => b.id !== id) });
    api.del(`/day-blocks/${id}`).catch(() => set({ blocks: prev }));
  },
}));
