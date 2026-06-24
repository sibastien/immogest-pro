import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 08h–17h
const DAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function getWeekDates(base: Date) {
  const day = base.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const mon = new Date(base);
  mon.setDate(base.getDate() + diff);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function fmt(d: Date) {
  return d.toISOString().split('T')[0];
}

const AGENT_COLORS = [
  'bg-primary text-white',
  'bg-purple text-white',
  'bg-success text-white',
  'bg-warning text-white',
  'bg-danger text-white',
];

export const CoordinatricePlanning: React.FC = () => {
  const { agents, visits } = useAgentsStore();
  const { properties }     = usePropertiesStore();

  const [baseDate, setBaseDate] = useState(new Date('2024-12-23'));
  const [filterAgent, setFilterAgent] = useState('');

  const weekDates = getWeekDates(baseDate);
  const terrainAgents = agents.filter((a) => a.role === 'agent_terrain');

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  const visitsInWeek = visits.filter((v) => {
    const inWeek = weekDates.some((d) => fmt(d) === v.date);
    const inAgent = !filterAgent || v.agentId === filterAgent;
    return inWeek && inAgent;
  });

  const agentColorMap = new Map(terrainAgents.map((a, i) => [a.id, AGENT_COLORS[i % AGENT_COLORS.length]]));

  const getVisitsAt = (date: Date, hour: number) =>
    visitsInWeek.filter((v) => v.date === fmt(date) && parseInt(v.time.split(':')[0]) === hour);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Planning des visites</h2>
        <p className="text-sm text-gray-400">Vue semaine — tous les agents terrain</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronLeft size={15} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            {' — '}
            {weekDates[5].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextWeek} className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ChevronRight size={15} className="text-gray-500" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Agent legend + filter */}
          <div className="flex items-center gap-2">
            {terrainAgents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setFilterAgent(filterAgent === agent.id ? '' : agent.id)}
                className={[
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all border',
                  filterAgent === agent.id ? 'border-transparent opacity-100' : filterAgent ? 'opacity-40 border-transparent' : 'border-transparent',
                  agentColorMap.get(agent.id) ?? '',
                ].join(' ')}
              >
                {agent.name.split(' ')[0]}
              </button>
            ))}
            {filterAgent && (
              <button onClick={() => setFilterAgent('')} className="text-xs text-gray-400 hover:text-gray-600">Tous</button>
            )}
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          <div className="py-3 px-3 border-r border-gray-100" />
          {weekDates.map((d, i) => {
            const isToday = fmt(d) === '2024-12-23';
            const count = visitsInWeek.filter((v) => v.date === fmt(d)).length;
            return (
              <div key={i} className={`py-3 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-primary-light' : ''}`}>
                <div className={`text-xs font-medium ${isToday ? 'text-primary' : 'text-gray-500'}`}>{DAYS_SHORT[i]}</div>
                <div className={`text-sm font-bold mt-0.5 ${isToday ? 'text-primary' : 'text-gray-900'}`}>{d.getDate()}</div>
                {count > 0 && (
                  <div className="text-xs text-gray-400 mt-0.5">{count} v.</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        <div className="overflow-y-auto" style={{ maxHeight: 480 }}>
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0 min-h-[56px]">
              <div className="py-2 px-3 border-r border-gray-100 flex-shrink-0">
                <span className="text-xs text-gray-400 font-mono">{String(hour).padStart(2, '0')}h</span>
              </div>
              {weekDates.map((d, di) => {
                const cellVisits = getVisitsAt(d, hour);
                return (
                  <div key={di} className="border-r border-gray-100 last:border-r-0 p-1 space-y-1">
                    {cellVisits.map((visit) => {
                      const agent    = agents.find((a) => a.id === visit.agentId);
                      const property = properties.find((p) => p.id === visit.propertyId);
                      const color    = agentColorMap.get(visit.agentId) ?? 'bg-gray-500 text-white';
                      return (
                        <div key={visit.id} className={`${color} rounded-lg px-2 py-1.5 text-xs leading-4 cursor-default`}>
                          <div className="font-medium truncate">{property?.title?.split(' ').slice(0, 3).join(' ') ?? '—'}</div>
                          <div className="opacity-80 mt-0.5">{visit.time} · {agent?.name.split(' ')[0]}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <Clock size={12} /> Fuseau horaire : Tunis (UTC+1)
        <span className="mx-2">·</span>
        {visitsInWeek.length} visite{visitsInWeek.length !== 1 ? 's' : ''} cette semaine
      </div>
    </div>
  );
};
