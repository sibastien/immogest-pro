import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, UserPlus, Calendar, AlertTriangle, PhoneOff } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { useClientsStore } from '../../store/clientsStore';
import { useCallsStore } from '../../store/callsStore';
import { useAgentsStore } from '../../store/agentsStore';
import { useAuthStore } from '../../store/authStore';
import { todayISO, todayLabelFr } from '../../lib/today';

export const AgentBureauDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { clients } = useClientsStore();
  const { calls } = useCallsStore();
  const { appointments } = useAgentsStore();

  // Contacts and calls are shared across the team.
  const activeClients = clients.filter((c) => c.status === 'actif');
  const toRelance = clients.filter((c) => c.status === 'a_relancer');
  const rappels = calls.filter((c) => c.outcome === 'rappel');
  const todayRdv = appointments.filter((a) => a.date === todayISO() && a.agentId === user?.agentId);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Bonjour, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500">{todayLabelFr()}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Clients actifs" value={activeClients.length} icon={UserPlus} color="blue" />
        <StatCard
          label="À relancer"
          value={toRelance.length}
          icon={AlertTriangle}
          color={toRelance.length > 0 ? 'amber' : 'green'}
        />
        <StatCard label="RDV aujourd'hui" value={todayRdv.length} icon={Calendar} color="purple" />
        <StatCard label="Appels à rappeler" value={rappels.length} icon={Phone} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Appels à rappeler */}
        <Card>
          <CardHeader
            title="Appels à rappeler"
            subtitle={`${rappels.length} en attente`}
            action={<PhoneOff size={16} className="text-gray-400" />}
          />
          {rappels.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun rappel en attente</p>
          ) : (
            <div className="space-y-2">
              {rappels.slice(0, 6).map((call) => (
                <div key={call.id} className="flex items-center gap-3 p-2 bg-warning-light rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{call.clientName}</div>
                    <div className="text-xs text-gray-500 truncate">{call.notes}</div>
                  </div>
                  <button
                    onClick={() => navigate('/agent-bureau/appels')}
                    className="flex items-center gap-1 text-xs text-warning font-medium flex-shrink-0"
                  >
                    <Phone size={12} /> Rappeler
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Prospects à relancer */}
        <Card>
          <CardHeader
            title="À relancer"
            action={
              toRelance.length > 0 ? (
                <Badge variant="a_relancer" label={`${toRelance.length} prospects`} />
              ) : undefined
            }
          />
          {toRelance.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Aucun prospect à relancer</p>
          ) : (
            <div className="space-y-2">
              {toRelance.slice(0, 6).map((client) => (
                <div
                  key={client.id}
                  onClick={() => navigate(`/agent-bureau/prospects`)}
                  className="flex items-center gap-3 p-2 bg-gray-50 hover:bg-warning-light rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{client.name}</div>
                    <div className="text-xs text-gray-500">
                      Dernier contact : {new Date(client.lastContact).toLocaleDateString('fr-TN')}
                    </div>
                  </div>
                  <Phone size={12} className="text-warning flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* RDV du jour */}
      {todayRdv.length > 0 && (
        <Card>
          <CardHeader title="Mes rendez-vous aujourd'hui" />
          <div className="space-y-2">
            {todayRdv.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-3 bg-primary-light rounded-lg">
                <span className="text-sm font-mono font-medium text-primary w-12">{appt.time}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{appt.title}</div>
                </div>
                <Badge
                  variant={appt.status === 'confirme' ? 'disponible' : 'a_relancer'}
                  size="sm"
                  label={appt.status === 'confirme' ? 'Confirmé' : 'En attente'}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
