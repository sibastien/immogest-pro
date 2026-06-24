import React, { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Activity } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

// Mock coordinates relative to Tunis area (as % of map viewport)
const AGENT_POSITIONS: Record<string, { x: number; y: number; zone: string }> = {
  'agent-001': { x: 28, y: 22, zone: 'La Marsa' },
  'agent-002': { x: 72, y: 35, zone: 'Les Berges du Lac' },
  'agent-003': { x: 45, y: 55, zone: 'Centre-ville' },
  'agent-004': { x: 62, y: 68, zone: 'Ennasr' },
  'agent-005': { x: 30, y: 72, zone: 'Menzah 9' },
};

const STATUS_BADGE = {
  disponible: 'disponible' as const,
  en_visite:  'info' as const,
  bureau:     'a_relancer' as const,
  hors_ligne: 'gray' as const,
};

const STATUS_LABEL = {
  disponible: 'Disponible',
  en_visite:  'En visite',
  bureau:     'Au bureau',
  hors_ligne: 'Hors ligne',
};

const STATUS_DOT = {
  disponible: 'bg-success',
  en_visite:  'bg-primary animate-pulse',
  bureau:     'bg-warning',
  hors_ligne: 'bg-gray-400',
};

export const CoordinatriceCarteAgents: React.FC = () => {
  const { agents, visits, updateAgentStatus } = useAgentsStore();
  const [selected, setSelected] = useState<string | null>(null);

  const terrainAgents = agents.filter((a) => a.role === 'agent_terrain' || a.role === 'agent_bureau');

  const today      = '2024-12-23';
  const todayVisits = visits.filter((v) => v.date === today);

  const selectedAgent = selected ? agents.find((a) => a.id === selected) : null;
  const agentVisits   = selected ? todayVisits.filter((v) => v.agentId === selected) : [];

  const counts = {
    disponible: terrainAgents.filter((a) => a.status === 'disponible').length,
    en_visite:  terrainAgents.filter((a) => a.status === 'en_visite').length,
    bureau:     terrainAgents.filter((a) => a.status === 'bureau').length,
    hors_ligne: terrainAgents.filter((a) => a.status === 'hors_ligne').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Carte agents</h2>
          <p className="text-sm text-gray-400">{terrainAgents.length} agents · {counts.en_visite} en visite actuellement</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[k as keyof typeof STATUS_DOT]}`} />
              {v} ({counts[k as keyof typeof counts]})
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Map */}
        <div className="col-span-2">
          <div className="relative bg-[#e8f0e8] rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 480 }}>
            {/* Stylized map background */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 300">
              {/* Roads */}
              <line x1="0" y1="150" x2="400" y2="150" stroke="#94a3b8" strokeWidth="2" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="#94a3b8" strokeWidth="2" />
              <line x1="0" y1="80" x2="400" y2="200" stroke="#94a3b8" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="300" y2="300" stroke="#94a3b8" strokeWidth="1" />
              {/* Blocks */}
              <rect x="50" y="50" width="60" height="40" rx="4" fill="#cbd5e1" />
              <rect x="150" y="100" width="80" height="50" rx="4" fill="#cbd5e1" />
              <rect x="280" y="60" width="70" height="55" rx="4" fill="#cbd5e1" />
              <rect x="30" y="180" width="90" height="60" rx="4" fill="#cbd5e1" />
              <rect x="240" y="190" width="100" height="70" rx="4" fill="#cbd5e1" />
              {/* Water (Lac) */}
              <ellipse cx="310" cy="120" rx="55" ry="35" fill="#bfdbfe" opacity="0.6" />
              <text x="310" y="124" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="600">Lac de Tunis</text>
              {/* Sea */}
              <path d="M 0 0 L 80 0 L 40 60 Z" fill="#bfdbfe" opacity="0.4" />
            </svg>

            {/* Tunis label */}
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Navigation size={12} className="text-primary" />
                Grand Tunis
              </div>
            </div>

            {/* Agent pins */}
            {terrainAgents.map((agent) => {
              const pos = AGENT_POSITIONS[agent.id] ?? { x: 50, y: 50, zone: '—' };
              const isSelected = selected === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => setSelected(isSelected ? null : agent.id)}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group"
                >
                  {/* Pulse ring for en_visite */}
                  {agent.status === 'en_visite' && (
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping scale-150" />
                  )}

                  {/* Avatar pin */}
                  <div className={[
                    'relative w-10 h-10 rounded-full border-3 flex items-center justify-center text-xs font-bold text-white transition-all shadow-lg',
                    isSelected ? 'scale-125 border-white' : 'hover:scale-110 border-white/70',
                    agent.status === 'disponible'  ? 'bg-success' :
                    agent.status === 'en_visite'   ? 'bg-primary' :
                    agent.status === 'bureau'      ? 'bg-warning' : 'bg-gray-400',
                  ].join(' ')} style={{ borderWidth: 3 }}>
                    {agent.initials}
                  </div>

                  {/* Tooltip */}
                  <div className={[
                    'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap transition-all pointer-events-none',
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                  ].join(' ')}>
                    <div className="font-medium">{agent.name.split(' ')[0]}</div>
                    <div className="text-gray-400">{pos.zone}</div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                </button>
              );
            })}

            {/* Scale */}
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-500">
              ~ 15 km
            </div>
          </div>
        </div>

        {/* Agent list + detail */}
        <div className="space-y-3">
          {selectedAgent ? (
            // Detail panel
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Avatar initials={selectedAgent.initials} size="md" status={selectedAgent.status} />
                <div>
                  <div className="text-sm font-semibold text-gray-900">{selectedAgent.name}</div>
                  <Badge variant={STATUS_BADGE[selectedAgent.status]} size="sm" label={STATUS_LABEL[selectedAgent.status]} dot />
                </div>
                <button onClick={() => setSelected(null)} className="ml-auto text-xs text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-2 text-xs text-gray-600 mb-4">
                <div className="flex items-center gap-2"><Phone size={12} className="text-gray-400" /> {selectedAgent.phone}</div>
                <div className="flex items-center gap-2"><MapPin size={12} className="text-gray-400" /> {AGENT_POSITIONS[selectedAgent.id]?.zone ?? '—'}</div>
                <div className="flex items-center gap-2"><Activity size={12} className="text-gray-400" /> {agentVisits.length} visite{agentVisits.length !== 1 ? 's' : ''} aujourd'hui</div>
              </div>

              {/* Change status */}
              <div className="border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-400 mb-2">Modifier le statut</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => updateAgentStatus(selectedAgent.id, k as typeof selectedAgent.status)}
                      className={[
                        'py-1.5 text-xs rounded-lg border transition-colors',
                        selectedAgent.status === k
                          ? 'border-primary bg-primary text-white font-medium'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Today's visits */}
              {agentVisits.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
                  <div className="text-xs text-gray-400">Visites du jour</div>
                  {agentVisits.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 text-xs">
                      <Clock size={11} className="text-gray-400" />
                      <span className="font-mono text-primary">{v.time}</span>
                      <Badge variant={v.status === 'effectue' ? 'disponible' : 'info'} size="sm" dot />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            // Agent list
            <>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Agents terrain</div>
              {terrainAgents.map((agent) => {
                const pos = AGENT_POSITIONS[agent.id];
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelected(agent.id)}
                    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:bg-primary-light/30 transition-all text-left"
                  >
                    <Avatar initials={agent.initials} size="sm" status={agent.status} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900">{agent.name.split(' ')[0]}</div>
                      <div className="text-xs text-gray-400">{pos?.zone ?? '—'}</div>
                    </div>
                    <Badge variant={STATUS_BADGE[agent.status]} size="sm" dot />
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
