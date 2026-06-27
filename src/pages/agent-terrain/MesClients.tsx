import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, CalendarPlus, Search, Users } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useClientsStore } from '../../store/clientsStore';
import { useAuthStore } from '../../store/authStore';

const TYPE_LABELS: Record<string, string> = {
  acheteur: 'Acheteur',
  locataire: 'Locataire',
  proprietaire: 'Propriétaire',
};

const STATUS_BADGE = {
  actif: 'disponible' as const,
  a_relancer: 'a_relancer' as const,
  compromis: 'info' as const,
  cloture: 'gray' as const,
};

export const AgentTerrainClients: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clients } = useClientsStore();
  const [query, setQuery] = useState('');

  const myClients = clients
    .filter((c) => c.agentId === user?.agentId)
    .filter((c) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Mes clients</h2>
          <p className="text-sm text-gray-400">{myClients.length} fiche{myClients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/agent-terrain/nouvelle-fiche')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
        >
          <UserPlus size={15} /> Fiche
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un client…"
          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {myClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                <p className="text-xs text-gray-400 font-mono">{client.phone}</p>
              </div>
              <Badge variant={STATUS_BADGE[client.status]} size="sm" label={TYPE_LABELS[client.type] ?? client.type} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/agent-terrain/appels?client=${client.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                <Phone size={13} /> Appeler
              </button>
              <button
                onClick={() => navigate(`/agent-terrain/planifier?client=${client.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                <CalendarPlus size={13} /> Planifier
              </button>
            </div>
          </div>
        ))}

        {myClients.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <Users size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Aucune fiche client</p>
            <button
              onClick={() => navigate('/agent-terrain/nouvelle-fiche')}
              className="mt-3 text-xs text-primary font-medium"
            >
              + Créer une fiche
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
