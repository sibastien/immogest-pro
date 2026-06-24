import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';

const DEMO_USERS: User[] = [
  { id: 'u-admin', name: 'Ahmed Directeur', initials: 'AD', role: 'admin', email: 'admin@immogest.tn' },
  { id: 'u-coord', name: 'Fatma Zouari', initials: 'FZ', role: 'coordinatrice', agentId: 'agent-004', email: 'coordinatrice@immogest.tn' },
  { id: 'u-bureau', name: 'Slim Ben Amor', initials: 'SB', role: 'agent_bureau', agentId: 'agent-001', email: 'bureau@immogest.tn' },
  { id: 'u-terrain', name: 'Rania Khelil', initials: 'RK', role: 'agent_terrain', agentId: 'agent-002', email: 'terrain@immogest.tn' },
  { id: 'u-client', name: 'Mohamed Karim Belhaj', initials: 'MK', role: 'client', clientId: 'client-001', email: 'client@immogest.tn' },
];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
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
        if (password !== 'demo') {
          return { success: false, error: 'Mot de passe incorrect. Utilisez "demo" pour la démo.' };
        }
        const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          return { success: false, error: 'Compte non trouvé pour cet email.' };
        }
        set({ user: found, isAuthenticated: true });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      switchRole: (role: Role) => {
        const found = DEMO_USERS.find((u) => u.role === role);
        if (found) set({ user: found, isAuthenticated: true });
      },
    }),
    {
      name: 'immogest-auth',
    }
  )
);
