import React, { useEffect, useState } from 'react';
import { CalendarClock, Users } from 'lucide-react';
import { DayTimeline } from '../../components/DayTimeline';
import { useDayPlanStore } from '../../store/dayPlanStore';
import { useAgentsStore } from '../../store/agentsStore';
import { todayISO } from '../../lib/today';

// Read-only supervisor view: admin/coordinatrice watch what each agent is doing.
export const PlanningAgents: React.FC = () => {
  const { agents } = useAgentsStore();
  const { blocks, load } = useDayPlanStore();

  const fieldAgents = agents.filter((a) => ['agent_terrain', 'agent_bureau'].includes(a.role));
  const [agentId, setAgentId] = useState('');
  const [date, setDate] = useState(todayISO());

  // Default to the first agent once the list loads.
  useEffect(() => {
    if (!agentId && fieldAgents.length > 0) setAgentId(fieldAgents[0].id);
  }, [fieldAgents, agentId]);

  useEffect(() => {
    if (agentId) load(date, agentId);
  }, [agentId, date, load]);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <CalendarClock size={18} className="text-primary" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Planning des agents</h2>
          <p className="text-sm text-gray-400">Ce que fait chaque agent dans la journée</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {fieldAgents.length === 0 && <option value="">Aucun agent</option>}
            {fieldAgents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {agentId ? (
        <DayTimeline
          blocks={blocks}
          editable={false}
          isToday={date === todayISO()}
          onCreate={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
        />
      ) : (
        <p className="text-sm text-gray-400 py-10 text-center">Sélectionnez un agent.</p>
      )}
    </div>
  );
};
