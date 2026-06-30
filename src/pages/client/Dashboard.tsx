import React from 'react';
import { FolderOpen, CalendarDays, Building2, Phone } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { PhoneReveal } from '../../components/shared/PhoneReveal';
import { useAuthStore } from '../../store/authStore';
import { useAgentsStore } from '../../store/agentsStore';
import { mockAgents } from '../../data/mockAgents';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { appointments, agents } = useAgentsStore();

  const todayISO = new Date().toISOString().slice(0, 10);

  // The client's dedicated agent (if assigned in the store)
  const myAgent = agents.find((a) => a.id === user?.agentId) ?? mockAgents[0];

  const myAppointments = appointments.filter(
    (a) => a.clientId === user?.clientId && a.status !== 'annule'
  );

  const upcomingAppt = myAppointments
    .filter((a) => a.date >= todayISO)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const docsCount   = 0;
  const visitsCount = myAppointments.filter((a) => a.date < todayISO).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Bonjour, {user?.name?.split(' ').slice(-1)[0]}
        </h2>
        <p className="text-sm text-gray-500">Bienvenue dans votre espace client</p>
      </div>

      {/* Welcome banner */}
      <div className="bg-primary rounded-2xl p-5 text-white">
        <div className="text-xs font-medium opacity-80 mb-1">Votre espace personnel</div>
        <div className="text-lg font-semibold mb-1">Suivez votre projet immobilier</div>
        <p className="text-sm opacity-80">
          Retrouvez ici vos rendez-vous, documents et le suivi de votre dossier en temps réel.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Documents reçus" value={docsCount} icon={FolderOpen} color="blue" />
        <StatCard label="Visites effectuées" value={visitsCount} icon={Building2} color="green" />
        <StatCard label="Prochain RDV" value={upcomingAppt.length > 0 ? upcomingAppt[0].date : '—'} icon={CalendarDays} color="purple" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Prochain RDV */}
        <Card>
          <CardHeader title="Prochains rendez-vous" />
          {upcomingAppt.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun rendez-vous planifié</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppt.slice(0, 3).map((appt) => (
                <div key={appt.id} className="flex items-start gap-3 p-3 bg-primary-light rounded-lg">
                  <CalendarDays size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{appt.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {new Date(appt.date).toLocaleDateString('fr-TN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })} à {appt.time}
                    </div>
                    <Badge
                      variant={appt.status === 'confirme' ? 'disponible' : 'a_relancer'}
                      size="sm"
                      label={appt.status === 'confirme' ? 'Confirmé' : 'En attente'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Mon agent */}
        {myAgent && (
          <Card>
            <CardHeader title="Mon agent" />
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary font-semibold">
                {myAgent.initials}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{myAgent.name}</div>
                <div className="text-xs text-gray-400">Agent immobilier</div>
              </div>
            </div>
            <PhoneReveal
              phone={myAgent.phone}
              name={myAgent.name}
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-primary text-primary text-sm font-medium rounded-lg hover:bg-primary-light transition-colors"
            >
              <Phone size={16} />
              {myAgent.phone}
            </PhoneReveal>
          </Card>
        )}
      </div>
    </div>
  );
};
