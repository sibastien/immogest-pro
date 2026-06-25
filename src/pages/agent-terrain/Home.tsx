import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { useAgentsStore } from '../../store/agentsStore';
import { useAuthStore } from '../../store/authStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { todayISO, todayLabelFr } from '../../lib/today';

const STATUS_LABELS = {
  planifie: 'Planifié',
  confirme: 'Confirmé',
  en_cours: 'En cours',
  effectue: 'Effectué',
  annule: 'Annulé',
};

const STATUS_BADGE = {
  planifie: 'a_relancer' as const,
  confirme: 'disponible' as const,
  en_cours: 'info' as const,
  effectue: 'gray' as const,
  annule: 'gray' as const,
};

export const AgentTerrainHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { visits } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const { clients } = useClientsStore();

  const myVisits = visits
    .filter((v) => v.agentId === user?.agentId && v.date === todayISO())
    .sort((a, b) => a.time.localeCompare(b.time));

  const done = myVisits.filter((v) => v.status === 'effectue').length;

  return (
    <div className="p-4 space-y-5">
      {/* Greeting */}
      <div className="pt-2">
        <h2 className="text-base font-semibold text-gray-900">
          Bonjour, {user?.name?.split(' ')[0]} !
        </h2>
        <p className="text-sm text-gray-400">{todayLabelFr()}</p>
      </div>

      {/* Progress */}
      <div className="bg-primary rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium opacity-90">Visites aujourd'hui</span>
          <span className="text-2xl font-semibold">{done}/{myVisits.length}</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all"
            style={{ width: myVisits.length > 0 ? `${(done / myVisits.length) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-xs opacity-70 mt-2">
          {myVisits.length - done} visite{myVisits.length - done !== 1 ? 's' : ''} restante{myVisits.length - done !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Visit list */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Mes visites</h3>
        <div className="space-y-3">
          {myVisits.map((visit) => {
            const property = properties.find((p) => p.id === visit.propertyId);
            const client = clients.find((c) => c.id === visit.clientId);
            const isPast = visit.status === 'effectue';

            return (
              <div
                key={visit.id}
                onClick={() => navigate(`/agent-terrain/visites/${visit.id}`)}
                className={[
                  'bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer active:bg-gray-50 transition-colors',
                  isPast ? 'border-gray-100 opacity-60' : 'border-gray-200',
                ].join(' ')}
              >
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                  {isPast ? (
                    <CheckCircle2 size={18} className="text-success" />
                  ) : (
                    <Clock size={18} className="text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono font-medium text-primary">{visit.time}</span>
                    <Badge variant={STATUS_BADGE[visit.status]} size="sm" label={STATUS_LABELS[visit.status]} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate mb-0.5">
                    {property?.title ?? 'Bien inconnu'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    <span>{property?.location}</span>
                    {client && (
                      <>
                        <span className="mx-1">·</span>
                        <span>{client.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-2" />
              </div>
            );
          })}

          {myVisits.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <MapPin size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune visite planifiée aujourd'hui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
