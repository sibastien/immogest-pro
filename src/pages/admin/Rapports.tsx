import React, { useState } from 'react';
import {
  TrendingUp, TrendingDown, BarChart3, Users, Building2, Target,
  Award, CalendarRange,
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import type { PropertyType } from '../../types';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const TYPE_COLORS: Record<PropertyType, string> = {
  vente_residentielle:    '#185FA5',
  location_residentielle: '#534AB7',
  commercial:             '#3B6D11',
  terrain:                '#854F0B',
};
const TYPE_LABELS: Record<PropertyType, string> = {
  vente_residentielle:    'Vente résidentielle',
  location_residentielle: 'Location',
  commercial:             'Commercial',
  terrain:                'Terrain',
};

export const AdminRapports: React.FC = () => {
  const { transactions, agents } = useAgentsStore();
  const { properties } = usePropertiesStore();
  const { clients } = useClientsStore();

  const [period, setPeriod] = useState<'6m' | '12m'>('12m');
  const months = period === '6m' ? 6 : 12;

  // Monthly revenue derived from closed transactions (current year)
  const monthlyCA = Array<number>(12).fill(0);
  transactions
    .filter((t) => t.stage === 'cloture')
    .forEach((t) => {
      const m = new Date(t.createdAt).getMonth();
      if (m >= 0 && m < 12) monthlyCA[m] += t.amount;
    });
  const monthlyCom = monthlyCA.map((v) => Math.round(v * 0.025));

  const monthData = MONTHS.slice(12 - months);
  const caData    = monthlyCA.slice(12 - months);
  const comData   = monthlyCom.slice(12 - months);

  // Aggregated KPIs
  const totalCA       = caData.reduce((a, b) => a + b, 0);
  const totalCom      = comData.reduce((a, b) => a + b, 0);
  const prevCA        = monthlyCA.slice(0, 12 - months).reduce((a, b) => a + b, 0);
  const caGrowth      = prevCA > 0 ? Math.round(((totalCA - prevCA) / prevCA) * 100) : 0;
  const hasRevenue    = totalCA > 0;

  const closedTx      = transactions.filter((t) => t.stage === 'cloture').length;
  const activeTx      = transactions.filter((t) => t.stage !== 'cloture').length;
  const availProps    = properties.filter((p) => p.status === 'disponible').length;
  const activeClients = clients.filter((c) => c.status === 'actif' || c.status === 'compromis').length;

  // Type breakdown
  const byType = Object.keys(TYPE_LABELS) as PropertyType[];
  const typeCounts = byType.map((t) => ({
    type: t,
    count: transactions.filter((tx) => tx.type === t).length,
    amount: transactions.filter((tx) => tx.type === t).reduce((s, tx) => s + tx.amount, 0),
  }));
  const totalTypeTx = typeCounts.reduce((s, t) => s + t.count, 0) || 1;

  // Agent leaderboard
  const agentStats = agents.map((a) => {
    const txs = transactions.filter((t) => t.agentId === a.id);
    return {
      ...a,
      txCount: txs.length,
      totalCA: txs.reduce((s, t) => s + t.amount, 0),
      commission: txs.reduce((s, t) => s + t.commission, 0),
    };
  }).sort((a, b) => b.totalCA - a.totalCA);

  const maxCA  = Math.max(...caData, 1);
  const fmt    = (n: number) => new Intl.NumberFormat('fr-TN').format(n);
  const fmtK   = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}k` : n.toString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Rapports & statistiques</h2>
          <p className="text-sm text-gray-400">Tableau de bord analytique — ImmoGest Pro</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(['6m', '12m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'px-4 py-1.5 text-xs font-medium rounded-md transition-all',
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {p === '6m' ? '6 mois' : '12 mois'}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp} label="CA total" value={`${fmt(totalCA)} DT`}
          delta={caGrowth} color="text-primary" bg="bg-primary-light"
        />
        <KpiCard
          icon={Award} label="Commissions" value={`${fmt(totalCom)} DT`}
          color="text-success" bg="bg-success-light"
        />
        <KpiCard
          icon={Target} label="Dossiers clôturés" value={closedTx.toString()}
          sub={`${activeTx} en cours`} color="text-purple" bg="bg-purple-light"
        />
        <KpiCard
          icon={Users} label="Clients actifs" value={activeClients.toString()}
          sub={`${availProps} biens disponibles`} color="text-warning" bg="bg-warning-light"
        />
      </div>

      {/* CA Chart + Type breakdown */}
      <div className="grid grid-cols-3 gap-5">
        {/* Bar chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold text-gray-900">Chiffre d'affaires mensuel</div>
              <div className="text-xs text-gray-400 mt-0.5">CA et commissions en DT</div>
            </div>
            <BarChart3 size={18} className="text-gray-300" />
          </div>

          {hasRevenue ? (
            <>
              {/* Bars */}
              <div className="flex items-end gap-2" style={{ height: 140 }}>
                {caData.map((ca, i) => {
                  const caH   = Math.round((ca / maxCA) * 120);
                  const comH  = Math.round((comData[i] / maxCA) * 120);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                      <div className="flex items-end gap-0.5 justify-center w-full">
                        <div
                          className="w-4 bg-primary rounded-t-sm opacity-80 group-hover:opacity-100 transition-all"
                          style={{ height: caH }}
                          title={`CA: ${fmt(ca)} DT`}
                        />
                        <div
                          className="w-2 bg-success rounded-t-sm opacity-60 group-hover:opacity-100 transition-all"
                          style={{ height: comH }}
                          title={`Com: ${fmt(comData[i])} DT`}
                        />
                      </div>
                      <span className="text-gray-400 text-center" style={{ fontSize: 9 }}>{monthData[i]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-3 h-2 bg-primary rounded-sm opacity-80" /> CA ({fmtK(totalCA)} DT)
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-success rounded-sm opacity-60" /> Commissions ({fmtK(totalCom)} DT)
                </span>
                {caGrowth !== 0 && (
                  caGrowth > 0 ? (
                    <span className="ml-auto flex items-center gap-1 text-xs text-success font-medium">
                      <TrendingUp size={12} /> +{caGrowth}% vs période précédente
                    </span>
                  ) : (
                    <span className="ml-auto flex items-center gap-1 text-xs text-danger font-medium">
                      <TrendingDown size={12} /> {caGrowth}% vs période précédente
                    </span>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400" style={{ height: 180 }}>
              <BarChart3 size={32} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun chiffre d'affaires enregistré</p>
              <p className="text-xs mt-1">Les revenus s'afficheront après la première transaction clôturée</p>
            </div>
          )}
        </div>

        {/* Type breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 mb-1">Répartition par type</div>
          <div className="text-xs text-gray-400 mb-5">Nombre de transactions</div>

          {/* Donut-like bars */}
          <div className="space-y-3">
            {typeCounts.map(({ type, count, amount }) => {
              const pct = Math.round((count / totalTypeTx) * 100);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{TYPE_LABELS[type]}</span>
                    <span className="text-gray-400">{count} · {pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: TYPE_COLORS[type] }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{fmt(amount)} DT</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent leaderboard + Funnel */}
      <div className="grid grid-cols-2 gap-5">
        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-900">Classement agents</div>
            <CalendarRange size={14} className="text-gray-300" />
          </div>
          <div className="space-y-3">
            {agentStats.length === 0 && (
              <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                <Award size={26} className="mb-2 opacity-30" />
                <p className="text-sm">Aucun agent à classer</p>
              </div>
            )}
            {agentStats.slice(0, 5).map((a, rank) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className={[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  rank === 0 ? 'bg-warning text-white' :
                  rank === 1 ? 'bg-gray-300 text-white' :
                  rank === 2 ? 'bg-orange-300 text-white' : 'bg-gray-100 text-gray-500',
                ].join(' ')}>{rank + 1}</div>
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {a.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{a.name}</div>
                  <div className="text-xs text-gray-400">{a.txCount} dossier{a.txCount !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-gray-900">{fmtK(a.totalCA)} DT</div>
                  <div className="text-xs text-success">{fmtK(a.commission)} com.</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline funnel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="text-sm font-semibold text-gray-900 mb-1">Entonnoir pipeline</div>
          <div className="text-xs text-gray-400 mb-5">Conversion par étape</div>
          <div className="space-y-2">
            {(['prospection','visite','offre','compromis','acte','cloture'] as const).map((s, _i, arr) => {
              const count = transactions.filter((t) => t.stage === s).length + (s === 'cloture' ? closedTx : 0);
              const maxCount = transactions.filter((t) => t.stage === arr[0]).length + 1;
              const pct  = Math.max(10, Math.round((count / maxCount) * 100));
              const cfg  = {
                prospection: { color: 'bg-gray-300', label: 'Prospection' },
                visite:      { color: 'bg-blue-300',  label: 'Visite' },
                offre:       { color: 'bg-yellow-400', label: 'Offre' },
                compromis:   { color: 'bg-purple-400', label: 'Compromis' },
                acte:        { color: 'bg-green-400',  label: 'Acte' },
                cloture:     { color: 'bg-green-600',  label: 'Clôturé' },
              }[s];
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-20 text-right flex-shrink-0">{cfg.label}</span>
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cfg.color} rounded-full transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${pct}%` }}
                    >
                      <span className="text-white text-xs font-medium">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Property portfolio summary */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-gray-900">Portefeuille immobilier</div>
          <Building2 size={14} className="text-gray-300" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {([
            { label: 'Disponibles',    count: properties.filter((p) => p.status === 'disponible').length,     color: 'bg-success' },
            { label: 'Sous compromis', count: properties.filter((p) => p.status === 'sous_compromis').length, color: 'bg-purple' },
            { label: 'Loués',          count: properties.filter((p) => p.status === 'loue').length,            color: 'bg-primary' },
            { label: 'Vendus',         count: properties.filter((p) => p.status === 'vendu').length,           color: 'bg-gray-400' },
          ]).map(({ label, count, color }) => (
            <div key={label} className="text-center">
              <div className={`text-2xl font-bold ${color.replace('bg-', 'text-')}`}>{count}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full`}
                  style={{ width: `${properties.length > 0 ? Math.round((count / properties.length) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  color: string;
  bg: string;
}> = ({ icon: Icon, label, value, sub, delta, color, bg }) => (
  <div className={`${bg} rounded-2xl p-4`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-9 h-9 bg-white/60 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      {delta !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-medium ${delta >= 0 ? 'text-success' : 'text-danger'}`}>
          {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {delta >= 0 ? '+' : ''}{delta}%
        </span>
      )}
    </div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
  </div>
);
