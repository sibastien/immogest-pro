import React from 'react';
import { TrendingUp, CheckCircle2, FileText, Banknote, MapPin, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAgentsStore } from '../../store/agentsStore';
import { ProgressBar } from '../../components/ui/ProgressBar';

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

// Mini bar chart SVG for mobile
const MiniBarChart: React.FC<{ data: number[]; labels: string[] }> = ({ data, labels }) => {
  const max  = Math.max(...data, 1);
  const W    = 280;
  const H    = 72;
  const BAR  = Math.floor(W / data.length) - 4;
  const PAD  = 2;

  return (
    <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full">
      {data.map((v, i) => {
        const barH  = Math.max(4, (v / max) * H);
        const x     = i * (BAR + PAD * 2) + PAD;
        const y     = H - barH;
        const isTop = v === max;
        return (
          <g key={i}>
            <rect
              x={x} y={y} width={BAR} height={barH} rx={3}
              className={isTop ? 'fill-primary' : 'fill-primary/30'}
            />
            <text
              x={x + BAR / 2} y={H + 14}
              textAnchor="middle"
              className="fill-gray-400"
              style={{ fontSize: 9 }}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const AgentTerrainPerformance: React.FC = () => {
  const { user }                          = useAuthStore();
  const { agents, visits, comptesRendus, transactions } = useAgentsStore();

  const agent = agents.find((a) => a.email === user?.email);

  const myVisits    = agent ? visits.filter((v) => v.agentId === agent.id) : [];
  const myCRs       = agent ? comptesRendus.filter((r) => r.agentId === agent.id) : [];
  const myTx        = agent ? transactions.filter((t) => t.agentId === agent.id) : [];

  const totalVisits = myVisits.length;
  const doneVisits  = myVisits.filter((v) => v.status === 'effectue').length;
  const crRate      = doneVisits > 0 ? Math.round((myCRs.length / doneVisits) * 100) : 0;
  const convRate    = totalVisits > 0 ? Math.round((myTx.length / totalVisits) * 100) : 0;
  const totalCA     = myTx.reduce((sum, t) => sum + t.amount, 0);
  const commission  = Math.round(totalCA * 0.025); // 2.5% commission

  const avgRating =
    myCRs.length > 0
      ? (myCRs.reduce((s, r) => s + r.clientInterest, 0) / myCRs.length).toFixed(1)
      : '—';

  // Monthly visits data (last 6 months)
  const now      = new Date();
  const monthly  = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: MONTHS[d.getMonth()],
      count: myVisits.filter((v) => {
        const vd = new Date(v.date);
        return vd.getMonth() === d.getMonth() && vd.getFullYear() === d.getFullYear();
      }).length,
    };
  });

  // Objectives
  const OBJ_VISITS = 20;
  const OBJ_CA     = 500_000;

  const kpis = [
    { label: 'Visites total', value: totalVisits.toString(), Icon: MapPin, color: 'text-primary bg-primary-light' },
    { label: 'C.R. soumis',  value: myCRs.length.toString(), Icon: FileText, color: 'text-purple bg-purple-light' },
    { label: 'Taux C.R.',    value: `${crRate}%`, Icon: CheckCircle2, color: 'text-success bg-success-light' },
    { label: 'Conversion',   value: `${convRate}%`, Icon: TrendingUp, color: 'text-warning bg-warning-light' },
  ];

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <h1 className="text-base font-bold text-gray-900">Mes performances</h1>
        <p className="text-xs text-gray-400">{agent?.name ?? user?.name} · {new Date().getFullYear()}</p>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* KPIs grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpis.map(({ label, value, Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                <Icon size={18} />
              </div>
              <div className="text-xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* CA & Commission */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Banknote size={16} className="text-success" />
            <span className="text-sm font-semibold text-gray-900">Chiffre d'affaires</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {new Intl.NumberFormat('fr-TN').format(totalCA)} DT
          </div>
          <div className="text-xs text-gray-400 mb-3">{myTx.length} transaction{myTx.length !== 1 ? 's' : ''}</div>
          <div className="flex items-center justify-between bg-success-light rounded-xl px-4 py-2.5">
            <div>
              <div className="text-xs text-success font-medium">Commission estimée</div>
              <div className="text-base font-bold text-success">
                {new Intl.NumberFormat('fr-TN').format(commission)} DT
              </div>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>

        {/* Note moyenne */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star size={16} className="text-warning" />
            <span className="text-sm font-semibold text-gray-900">Note client moyenne</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-gray-900">{avgRating}</div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={`${s <= Math.round(parseFloat(String(avgRating)) || 0) ? 'text-warning fill-warning' : 'text-gray-200'}`}
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1">Basé sur {myCRs.length} compte{myCRs.length !== 1 ? 's' : ''}-rendu</div>
        </div>

        {/* Mini bar chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-900 mb-1">Visites par mois</div>
          <div className="text-xs text-gray-400 mb-4">6 derniers mois</div>
          <MiniBarChart
            data={monthly.map((m) => m.count)}
            labels={monthly.map((m) => m.label)}
          />
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="text-sm font-semibold text-gray-900 mb-4">Objectifs du mois</div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                <span>Visites effectuées</span>
                <span className="font-medium">{doneVisits} / {OBJ_VISITS}</span>
              </div>
              <ProgressBar value={doneVisits} max={OBJ_VISITS} showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                <span>CA généré</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-TN').format(totalCA)} / {new Intl.NumberFormat('fr-TN').format(OBJ_CA)} DT
                </span>
              </div>
              <ProgressBar value={totalCA} max={OBJ_CA} showLabel={false} />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                <span>C.R. soumis</span>
                <span className="font-medium">{myCRs.length} / {doneVisits || 1}</span>
              </div>
              <ProgressBar value={myCRs.length} max={Math.max(doneVisits, 1)} showLabel={false} />
            </div>
          </div>
        </div>

        {/* Transactions récentes */}
        {myTx.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-sm font-semibold text-gray-900 mb-3">Dernières transactions</div>
            <div className="space-y-2">
              {myTx.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <div className="text-xs font-medium text-gray-800">
                      {tx.type === 'vente_residentielle' ? 'Vente rés.' : tx.type === 'location_residentielle' ? 'Location' : tx.type === 'commercial' ? 'Commercial' : 'Terrain'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-success">
                    +{new Intl.NumberFormat('fr-TN').format(tx.amount)} DT
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
