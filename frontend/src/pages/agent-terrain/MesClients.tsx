import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Phone, CalendarPlus, Search, Users, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { PhoneReveal } from '../../components/shared/PhoneReveal';
import { PropertyMatches } from '../../components/PropertyMatches';
import { useClientsStore } from '../../store/clientsStore';
import type { Client } from '../../types';

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
  const { clients } = useClientsStore();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);

  // Contacts are shared across the whole team.
  const myClients = clients
    .filter((c) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Contacts</h2>
          <p className="text-sm text-gray-400">{myClients.length} fiche{myClients.length !== 1 ? 's' : ''} · partagées</p>
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
            <div
              onClick={() => setSelected(client)}
              className="flex items-start justify-between gap-2 mb-2 cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
                <p className="text-xs text-gray-400 font-mono">{client.phone}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge variant={STATUS_BADGE[client.status]} size="sm" label={TYPE_LABELS[client.type] ?? client.type} />
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
            <div className="flex gap-2">
              <PhoneReveal
                phone={client.phone}
                name={client.name}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                <Phone size={13} /> Appeler
              </PhoneReveal>
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

      {/* Detail drawer with matching biens */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Fiche client"
        subtitle={selected?.name}
        width="md"
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
                <div className="text-xs text-gray-400 font-mono">{selected.phone}</div>
              </div>
              <Badge variant={STATUS_BADGE[selected.status]} size="sm" label={TYPE_LABELS[selected.type] ?? selected.type} />
            </div>

            <div className="flex gap-2">
              <PhoneReveal
                phone={selected.phone}
                name={selected.name}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90"
              >
                <Phone size={13} /> Appeler
              </PhoneReveal>
              <button
                onClick={() => { const id = selected.id; setSelected(null); navigate(`/agent-terrain/planifier?client=${id}`); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                <CalendarPlus size={13} /> Planifier
              </button>
            </div>

            {selected.budget && (
              <div className="text-xs text-gray-600">
                <span className="text-gray-400">Budget : </span>
                {selected.budget.min.toLocaleString('fr-TN')} — {selected.budget.max.toLocaleString('fr-TN')} DT
              </div>
            )}
            {selected.search && (
              <div className="text-xs text-gray-600 leading-5 bg-gray-50 rounded-lg p-2.5">{selected.search}</div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <PropertyMatches client={selected} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
