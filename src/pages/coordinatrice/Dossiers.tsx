import React, { useState } from 'react';
import {
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  ChevronRight, Search, Calendar, User,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { Badge } from '../../components/ui/Badge';
import type { Transaction } from '../../types';

type Stage = Transaction['stage'];

const STAGE_ORDER: Stage[] = ['prospection', 'visite', 'offre', 'compromis', 'acte', 'cloture'];

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string; variant: 'info' | 'disponible' | 'a_relancer' | 'sous_compromis' | 'loue' | 'vendu' }> = {
  prospection: { label: 'Prospection', color: 'text-gray-600',   bg: 'bg-gray-100',         variant: 'info' },
  visite:      { label: 'Visite',      color: 'text-primary',    bg: 'bg-primary-light',    variant: 'info' },
  offre:       { label: 'Offre',       color: 'text-warning',    bg: 'bg-warning-light',    variant: 'a_relancer' },
  compromis:   { label: 'Compromis',   color: 'text-purple',     bg: 'bg-purple-light',     variant: 'sous_compromis' },
  acte:        { label: 'Acte',        color: 'text-success',    bg: 'bg-success-light',    variant: 'disponible' },
  cloture:     { label: 'Clôturé',     color: 'text-gray-400',   bg: 'bg-gray-100',         variant: 'vendu' },
};

const TYPE_LABEL: Record<string, string> = {
  villa:       'Villa',
  appartement: 'Appartement',
  maison:      'Maison',
  commercial:  'Local commercial',
  terrain:     'Terrain',
};

export const CoordinatriceDossiers: React.FC = () => {
  const { transactions, agents } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const { clients } = useClientsStore();

  const [search, setSearch]         = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | ''>('');
  const [expanded, setExpanded]     = useState<string | null>(null);

  const active = transactions.filter((t) => t.stage !== 'cloture');

  const filtered = active.filter((t) => {
    if (stageFilter && t.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const prop   = properties.find((p) => p.id === t.propertyId);
      const client = clients.find((c) => c.id === t.clientId);
      return (
        t.ref.toLowerCase().includes(q) ||
        prop?.title.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPIs
  const totalAmount = active.reduce((s, t) => s + t.amount, 0);
  const totalCom    = active.reduce((s, t) => s + t.commission, 0);
  const stageCounts = STAGE_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = active.filter((t) => t.stage === s).length;
    return acc;
  }, {});

  const fmt = (n: number) => new Intl.NumberFormat('fr-TN').format(n);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dossiers actifs</h2>
        <p className="text-sm text-gray-400">{active.length} dossiers en cours · {fmt(totalAmount)} DT de valeur</p>
      </div>

      {/* Stage pipeline bar */}
      <div className="grid grid-cols-5 gap-2">
        {STAGE_ORDER.filter((s) => s !== 'cloture').map((s) => {
          const cfg = STAGE_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStageFilter(stageFilter === s ? '' : s)}
              className={[
                'rounded-xl p-3 border-2 text-left transition-all',
                stageFilter === s
                  ? `border-current ${cfg.bg} ${cfg.color}`
                  : 'border-transparent bg-white hover:bg-gray-50',
              ].join(' ')}
            >
              <div className={`text-xl font-bold ${cfg.color}`}>{stageCounts[s] ?? 0}</div>
              <div className="text-xs text-gray-500 mt-0.5">{cfg.label}</div>
            </button>
          );
        })}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <KpiBox icon={TrendingUp} label="Valeur portefeuille" value={`${fmt(totalAmount)} DT`} color="text-primary" bg="bg-primary-light" />
        <KpiBox icon={CheckCircle2} label="Commissions estimées" value={`${fmt(totalCom)} DT`} color="text-success" bg="bg-success-light" />
        <KpiBox icon={Clock} label="Dossiers actifs" value={active.length.toString()} color="text-warning" bg="bg-warning-light" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Réf., bien, client…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {stageFilter && (
          <button
            onClick={() => setStageFilter('')}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary-light text-primary text-sm rounded-lg hover:bg-primary/20 transition-colors"
          >
            <AlertCircle size={13} /> {STAGE_CONFIG[stageFilter].label} ✕
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Dossier list */}
      <div className="space-y-2">
        {filtered.map((tx) => {
          const prop   = properties.find((p) => p.id === tx.propertyId);
          const client = clients.find((c) => c.id === tx.clientId);
          const agent  = agents.find((a) => a.id === tx.agentId);
          const cfg    = STAGE_CONFIG[tx.stage];
          const isOpen = expanded === tx.id;

          // Progress bar: index / (stages-1)
          const idx = STAGE_ORDER.indexOf(tx.stage);
          const progress = Math.round((idx / (STAGE_ORDER.length - 1)) * 100);

          return (
            <div key={tx.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Main row */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : tx.id)}
              >
                {/* Stage indicator */}
                <div className={`w-2 h-10 rounded-full flex-shrink-0 ${cfg.bg.replace('bg-', 'bg-').replace('-light', '')} ${cfg.color.replace('text-', 'bg-')}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-gray-400">{tx.ref}</span>
                    <Badge variant={cfg.variant} size="sm" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {prop?.title ?? 'Bien inconnu'}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1"><User size={10} /> {client?.name ?? '—'}</span>
                    <span>{tx.transaction === 'location' ? 'Location' : 'Vente'} · {TYPE_LABEL[tx.type] ?? 'Autre'}</span>
                  </div>
                </div>

                {/* Amount + progress */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-gray-900">{fmt(tx.amount)} DT</div>
                  <div className="text-xs text-success">{fmt(tx.commission)} DT com.</div>
                  <div className="mt-1.5 w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <ChevronRight size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`} />
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 grid grid-cols-2 gap-4">
                  {/* Stage pipeline */}
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Étape du dossier</div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {STAGE_ORDER.map((s, i) => {
                        const curr = STAGE_ORDER.indexOf(tx.stage);
                        const isCurr = i === curr;
                        const isPast = i < curr;
                        return (
                          <React.Fragment key={s}>
                            <span className={[
                              'text-xs px-2 py-0.5 rounded-full border',
                              isCurr ? `${STAGE_CONFIG[s].bg} ${STAGE_CONFIG[s].color} border-current font-medium` :
                              isPast ? 'bg-gray-100 text-gray-400 border-transparent' :
                              'bg-white text-gray-300 border-gray-100',
                            ].join(' ')}>
                              {STAGE_CONFIG[s].label}
                            </span>
                            {i < STAGE_ORDER.length - 1 && <span className="text-gray-200 text-xs">›</span>}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={11} className="text-gray-400" />
                      <span className="font-medium">Agent :</span>
                      {agent?.name ?? '—'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={11} className="text-gray-400" />
                      <span className="font-medium">Créé le :</span>
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    {tx.notes && (
                      <div className="mt-2 p-2 bg-white rounded-lg border border-gray-100 italic text-gray-500">
                        {tx.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <AlertCircle size={28} className="mb-2 opacity-30" />
            <p className="text-sm">Aucun dossier trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KpiBox: React.FC<{
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: string;
  color: string;
  bg: string;
}> = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`${bg} rounded-xl p-4 flex items-center gap-3`}>
    <div className={`w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={18} />
    </div>
    <div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  </div>
);
