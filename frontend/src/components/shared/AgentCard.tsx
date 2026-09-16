import React from 'react';
import { Phone, Building2, Eye, TrendingUp } from 'lucide-react';
import type { Agent } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';

const STATUS_LABELS: Record<Agent['status'], string> = {
  disponible: 'Disponible',
  en_visite: 'En visite',
  bureau: 'Au bureau',
  hors_ligne: 'Hors ligne',
};

const STATUS_BADGE_VARIANTS = {
  disponible: 'disponible' as const,
  en_visite: 'info' as const,
  bureau: 'compromis' as const,
  hors_ligne: 'gray' as const,
};

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
  compact?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, compact = false }) => {
  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <Avatar initials={agent.initials} size="sm" status={agent.status} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{agent.name}</div>
          <div className="text-xs text-gray-400">{STATUS_LABELS[agent.status]}</div>
        </div>
        <Badge variant={STATUS_BADGE_VARIANTS[agent.status]} size="sm" label={STATUS_LABELS[agent.status]} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar initials={agent.initials} size="md" status={agent.status} />
          <div>
            <div className="text-sm font-medium text-gray-900">{agent.name}</div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <Phone size={11} />
              {agent.phone}
            </div>
          </div>
        </div>
        <Badge variant={STATUS_BADGE_VARIANTS[agent.status]} size="sm" label={STATUS_LABELS[agent.status]} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
            <Building2 size={12} />
          </div>
          <div className="text-sm font-semibold text-gray-900">{agent.stats.activeProperties}</div>
          <div className="text-xs text-gray-400">Biens</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
            <Eye size={12} />
          </div>
          <div className="text-sm font-semibold text-gray-900">{agent.stats.visitsThisMonth}</div>
          <div className="text-xs text-gray-400">Visites</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">
            <TrendingUp size={12} />
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {(agent.stats.commission / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-gray-400">DT comm.</div>
        </div>
      </div>
    </div>
  );
};
