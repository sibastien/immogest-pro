import { create } from 'zustand';
import type { Agent, Visit, Transaction, CompteRendu, Appointment } from '../types';
import { mockTransactions, mockAppointments } from '../data/mockTransactions';
import { api } from '../lib/api';

interface AgentsState {
  agents: Agent[];
  visits: Visit[];
  transactions: Transaction[];
  comptesRendus: CompteRendu[];
  appointments: Appointment[];
  // API loaders (agents / visits / comptes-rendus are server-backed in Phase 1)
  loadAgents: () => Promise<void>;
  loadVisits: () => Promise<void>;
  loadComptesRendus: () => Promise<void>;
  addAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  getAgentById: (id: string) => Agent | undefined;
  getVisitsByAgent: (agentId: string) => Visit[];
  getPendingCRs: () => (CompteRendu & { visit?: Visit })[];
  addVisit: (visit: Visit) => void;
  addAppointment: (appointment: Appointment) => void;
  submitCR: (cr: CompteRendu) => void;
  validateCR: (crId: string) => void;
  rejectCR: (crId: string, reason: string) => void;
  addTransaction: (tx: Transaction) => void;
}

export const useAgentsStore = create<AgentsState>((set, get) => ({
  agents: [],
  visits: [],
  comptesRendus: [],
  // Not yet migrated (Phase 2) — still seeded from mock data.
  transactions: mockTransactions,
  appointments: mockAppointments,

  loadAgents: async () => {
    try { set({ agents: await api.get<Agent[]>('/users') }); } catch { /* keep cache */ }
  },
  loadVisits: async () => {
    try { set({ visits: await api.get<Visit[]>('/visits') }); } catch { /* keep cache */ }
  },
  loadComptesRendus: async () => {
    try { set({ comptesRendus: await api.get<CompteRendu[]>('/comptes-rendus') }); } catch { /* keep cache */ }
  },

  addAgent: (agent) => {
    set((state) => ({ agents: [...state.agents, agent] }));
    api.post<Agent>('/users', agent)
      .then((saved) => set((state) => ({
        agents: state.agents.map((a) => (a.id === agent.id ? saved : a)),
      })))
      .catch(() => get().loadAgents());
  },

  removeAgent: (id) => {
    set((state) => ({ agents: state.agents.filter((a) => a.id !== id) }));
    api.del(`/users/${id}`).catch(() => get().loadAgents());
  },

  // Status is presence-only UI state (no endpoint in Phase 1).
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
    })),

  getAgentById: (id) => get().agents.find((a) => a.id === id),

  getVisitsByAgent: (agentId) => get().visits.filter((v) => v.agentId === agentId),

  getPendingCRs: () => {
    const { comptesRendus, visits } = get();
    return comptesRendus
      .filter((cr) => cr.status === 'soumis')
      .map((cr) => ({ ...cr, visit: visits.find((v) => v.id === cr.visitId) }));
  },

  addVisit: (visit) => {
    set((state) => ({ visits: [visit, ...state.visits] }));
    api.post<Visit>('/visits', visit)
      .then((saved) => set((state) => ({
        visits: state.visits.map((v) => (v.id === visit.id ? saved : v)),
      })))
      .catch(() => get().loadVisits());
  },

  addAppointment: (appointment) =>
    set((state) => ({ appointments: [appointment, ...state.appointments] })),

  submitCR: (cr) => {
    set((state) => ({
      comptesRendus: [...state.comptesRendus.filter((c) => c.id !== cr.id), cr],
      visits: state.visits.map((v) =>
        v.id === cr.visitId ? { ...v, crSubmitted: true, status: 'effectue' as const } : v
      ),
    }));
    api.post<CompteRendu>('/comptes-rendus', cr).catch(() => { get().loadComptesRendus(); get().loadVisits(); });
  },

  validateCR: (crId) => {
    set((state) => ({
      comptesRendus: state.comptesRendus.map((cr) =>
        cr.id === crId
          ? { ...cr, status: 'valide' as const, validatedAt: new Date().toISOString() }
          : cr
      ),
    }));
    api.put(`/comptes-rendus/${crId}`, { status: 'valide' }).catch(() => get().loadComptesRendus());
  },

  rejectCR: (crId, reason) => {
    let nextNotes = '';
    set((state) => ({
      comptesRendus: state.comptesRendus.map((cr) => {
        if (cr.id !== crId) return cr;
        nextNotes = cr.notes + (reason ? `\n\n[Correction demandée] ${reason}` : '');
        return { ...cr, status: 'correction_demandee' as const, notes: nextNotes };
      }),
    }));
    api.put(`/comptes-rendus/${crId}`, { status: 'correction_demandee', notes: nextNotes })
      .catch(() => get().loadComptesRendus());
  },

  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),
}));
