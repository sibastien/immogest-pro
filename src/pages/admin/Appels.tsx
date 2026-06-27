import React, { useEffect, useMemo, useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, MessageSquare, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useCallsStore } from '../../store/callsStore';
import { useAgentsStore } from '../../store/agentsStore';

const OUTCOME = {
  joint:       { label: 'Joint',        variant: 'disponible' as const },
  non_repondu: { label: 'Sans réponse', variant: 'urgent' as const },
  rappel:      { label: 'À rappeler',   variant: 'a_relancer' as const },
};

function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }); }
  catch { return d; }
}

export const AdminAppels: React.FC = () => {
  const { calls, load } = useCallsStore();
  const { agents, loadAgents } = useAgentsStore();
  const [agentFilter, setAgentFilter] = useState('');
  const [query, setQuery] = useState('');

  // Refresh on mount so the admin always sees the latest agent activity.
  useEffect(() => { load(); loadAgents(); }, [load, loadAgents]);

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? 'Agent';

  const filtered = useMemo(() => {
    return calls.filter((c) => {
      if (agentFilter && c.agentId !== agentFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return c.clientName.toLowerCase().includes(q) || c.notes.toLowerCase().includes(q);
      }
      return true;
    });
  }, [calls, agentFilter, query]);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Appels des agents</h2>
        <p className="text-sm text-gray-400">
          Suivi de tous les appels enregistrés par l'équipe ({filtered.length})
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client ou un échange…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous les agents</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      {/* Calls */}
      <div className="space-y-2">
        {filtered.map((call) => {
          const o = OUTCOME[call.outcome] ?? OUTCOME.joint;
          const DirIcon = call.type === 'entrant' ? PhoneIncoming : PhoneOutgoing;
          return (
            <Card key={call.id} padding="none">
              <div className="flex items-start gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
                  <DirIcon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{call.clientName}</span>
                    <Badge variant={o.variant} size="sm" label={o.label} />
                    <span className="text-xs text-gray-400">
                      par <span className="font-medium text-gray-600">{agentName(call.agentId)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-1.5">
                    <span>{call.type === 'entrant' ? 'Entrant' : 'Sortant'}</span>
                    {call.phone && <span className="font-mono">{call.phone}</span>}
                    <span>{fmtDate(call.date)} · {call.time}</span>
                  </div>
                  <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded flex gap-1.5">
                    <MessageSquare size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{call.notes}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <Phone size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun appel enregistré pour l'instant</p>
            <p className="text-xs mt-1">Les appels saisis par les agents apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
};
