import React from 'react';
import { useAgentsStore } from '../../store/agentsStore';
import { AgentCard } from '../../components/shared/AgentCard';
import { StatCard } from '../../components/ui/StatCard';
import { Users, Eye, TrendingUp, Award } from 'lucide-react';

export const AdminTeam: React.FC = () => {
  const { agents } = useAgentsStore();

  const totalVisits = agents.reduce((sum, a) => sum + a.stats.visitsThisMonth, 0);
  const totalCommission = agents.reduce((sum, a) => sum + a.stats.commission, 0);
  const totalTransactions = agents.reduce((sum, a) => sum + a.stats.transactions, 0);
  const activeAgents = agents.filter((a) => a.status !== 'hors_ligne').length;

  const terrain = agents.filter((a) => a.role === 'agent_terrain');
  const bureau = agents.filter((a) => a.role === 'agent_bureau');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Équipe</h2>
        <p className="text-sm text-gray-500">{agents.length} membres · {activeAgents} connectés</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Agents actifs" value={activeAgents} icon={Users} color="blue" />
        <StatCard label="Visites ce mois" value={totalVisits} icon={Eye} color="purple" />
        <StatCard label="Transactions" value={totalTransactions} icon={TrendingUp} color="green" />
        <StatCard
          label="Commissions totales"
          value={`${(totalCommission / 1000).toFixed(1)}K DT`}
          icon={Award}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Agents terrain</h3>
          <div className="space-y-3">
            {terrain.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Agents bureau</h3>
          <div className="space-y-3">
            {bureau.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
