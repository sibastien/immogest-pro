import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, Visit, Transaction, CompteRendu, Appointment } from '../types';
import { mockAgents } from '../data/mockAgents';
import { mockVisits, mockTransactions, mockComptesRendus, mockAppointments } from '../data/mockTransactions';

interface AgentsState {
  agents: Agent[];
  visits: Visit[];
  transactions: Transaction[];
  comptesRendus: CompteRendu[];
  appointments: Appointment[];
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

export const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
  agents: mockAgents,
  visits: mockVisits,
  transactions: mockTransactions,
  comptesRendus: mockComptesRendus,
  appointments: mockAppointments,

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  removeAgent: (id) =>
    set((state) => ({ agents: state.agents.filter((a) => a.id !== id) })),

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

  addVisit: (visit) =>
    set((state) => ({ visits: [visit, ...state.visits] })),

  addAppointment: (appointment) =>
    set((state) => ({ appointments: [appointment, ...state.appointments] })),

  submitCR: (cr) =>
    set((state) => ({
      comptesRendus: [...state.comptesRendus.filter((c) => c.id !== cr.id), cr],
      visits: state.visits.map((v) =>
        v.id === cr.visitId ? { ...v, crSubmitted: true, status: 'effectue' as const } : v
      ),
    })),

  validateCR: (crId) =>
    set((state) => ({
      comptesRendus: state.comptesRendus.map((cr) =>
        cr.id === crId
          ? { ...cr, status: 'valide' as const, validatedAt: new Date().toISOString() }
          : cr
      ),
    })),

  rejectCR: (crId, reason) =>
    set((state) => ({
      comptesRendus: state.comptesRendus.map((cr) =>
        cr.id === crId
          ? { ...cr, status: 'correction_demandee' as const, notes: cr.notes + (reason ? `\n\n[Correction demandée] ${reason}` : '') }
          : cr
      ),
    })),

  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),
    }),
    {
      name: 'immogest-agents',
      // Only persist the managed agents list; mock visits/transactions
      // stay sourced from their seed data on each load.
      partialize: (state) => ({ agents: state.agents }),
    }
  )
);
