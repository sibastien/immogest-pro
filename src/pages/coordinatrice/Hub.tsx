import React from 'react';
import { useAgentsStore } from '../../store/agentsStore';
import { AgentCard } from '../../components/shared/AgentCard';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { Users, ClipboardCheck, CalendarDays, AlertCircle } from 'lucide-react';

export const CoordinatriceHub: React.FC = () => {
  const { agents, visits, appointments, getPendingCRs } = useAgentsStore();

  const pendingCRs = getPendingCRs();
  const todayVisits = visits.filter((v) => v.date === '2024-12-23' && v.status !== 'annule');
  const disponibles = agents.filter((a) => a.status === 'disponible').length;
  const enVisite = agents.filter((a) => a.status === 'en_visite').length;

  const todayAppointments = appointments.filter(
    (a) => a.date === '2024-12-23' && a.status !== 'annule'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Hub Coordinatrice</h2>
        <p className="text-sm text-gray-500">Vue temps réel · Lundi 23 décembre 2024</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Agents disponibles" value={disponibles} icon={Users} color="green" />
        <StatCard label="En visite maintenant" value={enVisite} icon={CalendarDays} color="blue" />
        <StatCard label="Visites aujourd'hui" value={todayVisits.length} icon={CalendarDays} color="purple" />
        <StatCard
          label="C.R. à valider"
          value={pendingCRs.length}
          icon={ClipboardCheck}
          color={pendingCRs.length > 0 ? 'amber' : 'green'}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Agents en temps réel */}
        <Card>
          <CardHeader title="Agents — temps réel" subtitle="Statuts et localisations" />
          <div className="space-y-2">
            {agents
              .filter((a) => ['agent_terrain', 'agent_bureau'].includes(a.role))
              .map((agent) => (
                <AgentCard key={agent.id} agent={agent} compact />
              ))}
          </div>
        </Card>

        {/* C.R. à valider */}
        <Card>
          <CardHeader
            title="Comptes-rendus à valider"
            action={
              pendingCRs.length > 0 ? (
                <Badge variant="urgent" label={`${pendingCRs.length} en attente`} />
              ) : undefined
            }
          />
          {pendingCRs.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-gray-400">
              <ClipboardCheck size={24} className="mb-2 text-success" />
              <p className="text-sm">Tous les C.R. sont validés</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingCRs.map((cr) => {
                const agent = agents.find((a) => a.id === cr.agentId);
                return (
                  <div
                    key={cr.id}
                    className="flex items-start gap-3 p-3 bg-warning-light rounded-lg border border-warning/20"
                  >
                    <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">
                        C.R. — {agent?.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {cr.notes.slice(0, 60)}…
                      </div>
                    </div>
                    <button className="text-xs text-primary font-medium flex-shrink-0 hover:underline">
                      Valider
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Planning du jour */}
      <Card>
        <CardHeader title="Planning du jour" subtitle={`${todayAppointments.length} événements`} />
        <div className="grid grid-cols-3 gap-3">
          {todayAppointments.map((appt) => {
            const agent = agents.find((a) => a.id === appt.agentId);
            return (
              <div key={appt.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-medium text-primary">{appt.time}</span>
                  <Badge
                    variant={appt.status === 'confirme' ? 'disponible' : 'a_relancer'}
                    size="sm"
                    label={appt.status === 'confirme' ? 'Confirmé' : 'En attente'}
                  />
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">{appt.title}</p>
                <p className="text-xs text-gray-400">{agent?.name}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
