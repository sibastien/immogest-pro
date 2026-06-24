import React from 'react';
import { Phone, UserPlus, CheckSquare, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { useClientsStore } from '../../store/clientsStore';
import { useAgentsStore } from '../../store/agentsStore';
import { useAuthStore } from '../../store/authStore';

const TASKS = [
  { id: 1, label: 'Rappeler Sana Trabelsi — visite La Soukra', done: false, urgent: true },
  { id: 2, label: 'Envoyer catalogue à Youssef Dridi', done: false, urgent: false },
  { id: 3, label: 'Créer fiche prospect appel 9h15', done: true, urgent: false },
  { id: 4, label: 'Mettre à jour fiche M. Belhaj', done: false, urgent: false },
  { id: 5, label: 'Confirmer RDV signature Mansouri', done: true, urgent: false },
];

export const AgentBureauDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { clients } = useClientsStore();
  const { appointments } = useAgentsStore();

  const [tasks, setTasks] = React.useState(TASKS);

  const myClients = clients.filter((c) => c.agentId === user?.agentId);
  const activeClients = myClients.filter((c) => c.status === 'actif');
  const toRelance = myClients.filter((c) => c.status === 'a_relancer');

  const todayRdv = appointments.filter(
    (a) => a.date === '2024-12-23' && a.agentId === user?.agentId
  );

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Bonjour, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500">Lundi 23 décembre 2024</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Mes clients actifs" value={activeClients.length} icon={UserPlus} color="blue" />
        <StatCard
          label="À relancer"
          value={toRelance.length}
          icon={AlertTriangle}
          color={toRelance.length > 0 ? 'amber' : 'green'}
        />
        <StatCard label="RDV aujourd'hui" value={todayRdv.length} icon={Calendar} color="purple" />
        <StatCard label="Appels à traiter" value={4} icon={Phone} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Tâches du jour */}
        <Card>
          <CardHeader
            title="Tâches du jour"
            subtitle={`${tasks.filter((t) => t.done).length}/${tasks.length} complétées`}
            action={
              <CheckSquare size={16} className="text-gray-400" />
            }
          />
          <div className="space-y-2">
            {tasks.map((task) => (
              <label
                key={task.id}
                className={[
                  'flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                  task.done ? 'opacity-50' : 'hover:bg-gray-50',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="mt-0.5 accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}
                  >
                    {task.label}
                  </span>
                </div>
                {task.urgent && !task.done && (
                  <Badge variant="urgent" size="sm" label="Urgent" />
                )}
              </label>
            ))}
          </div>
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
              {toRelance.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-2 bg-warning-light rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{client.name}</div>
                    <div className="text-xs text-gray-500">
                      Dernier contact : {new Date(client.lastContact).toLocaleDateString('fr-TN')}
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-xs text-warning font-medium">
                    <Phone size={12} />
                    Appeler
                  </button>
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
              <div
                key={appt.id}
                className="flex items-center gap-4 p-3 bg-primary-light rounded-lg"
              >
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
