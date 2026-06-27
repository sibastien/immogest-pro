import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Role } from '../types';
import { useAgentsStore } from './agentsStore';

// Single administrator account. Credentials are randomly generated — there are
// no public "demo" logins. The admin manages every other login (agents,
// coordinatrice, clients) from the Settings page via access codes.
const ADMIN_EMAIL = 'admin.vwxkwa@beeimob.tn';
const ADMIN_PASSWORD = 'A9KLk5zmfH&%Th';

const ADMIN_USER: User = {
  id: 'u-admin',
  name: 'Administrateur',
  initials: 'AD',
  role: 'admin',
  email: ADMIN_EMAIL,
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
        const normalizedEmail = email.trim().toLowerCase();

        // 1) Administrator account
        if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
          if (password !== ADMIN_PASSWORD) {
            return { success: false, error: 'Identifiants administrateur incorrects.' };
          }
          set({ user: ADMIN_USER, isAuthenticated: true });
          return { success: true };
        }

        // 2) Agents added by the admin: log in with their access code.
        //    The access code is stored uppercase, so compare case-insensitively
        //    to accept it whatever the casing the user types.
        const agent = useAgentsStore
          .getState()
          .agents.find((a) => a.email.toLowerCase() === normalizedEmail);
        if (agent) {
          if (
            !agent.accessCode ||
            password.trim().toUpperCase() !== agent.accessCode.toUpperCase()
          ) {
            return { success: false, error: "Code d'accès incorrect." };
          }
          const user: User = {
            id: `u-${agent.id}`,
            name: agent.name,
            initials: agent.initials,
            role: agent.role,
            email: agent.email,
            ...(agent.role === 'client' ? { clientId: agent.id } : { agentId: agent.id }),
          };
          set({ user, isAuthenticated: true });
          return { success: true };
        }

        return { success: false, error: 'Compte non trouvé pour cet email.' };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'immogest-auth',
    }
  )
);
