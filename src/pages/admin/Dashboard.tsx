import React, { useState } from 'react';
import {
  Building2, Users, Eye, CalendarDays, ArrowRight,
  ArrowUpRight, ArrowDownRight, CheckCircle2,
  Banknote, Target, Award,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { BarChart } from '../../components/ui/BarChart';
import { DonutChart } from '../../components/ui/DonutChart';
import { SparkLine } from '../../components/ui/SparkLine';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { useAgentsStore } from '../../store/agentsStore';

// ─── Mock monthly data ───────────────────────────────────────────────────────
const MONTHLY_VISITS_ONLY = [
  { label: 'Juil', value: 18 },
  { label: 'Août', value: 22 },
  { label: 'Sep',  value: 31 },
  { label: 'Oct',  value: 28 },
  { label: 'Nov',  value: 35 },
  { label: 'Déc',  value: 19 },
];

const MONTHLY_CA_ONLY = [
  { label: 'Juil', value: 45000 },
  { label: 'Août', value: 67000 },
  { label: 'Sep',  value: 89000 },
  { label: 'Oct',  value: 72000 },
  { label: 'Nov',  value: 112000 },
  { label: 'Déc',  value: 63000 },
];

const SPARKLINE_VISITS  = [18, 22, 31, 28, 35, 19];
const SPARKLINE_CLIENTS = [12, 15, 18, 14, 20, 17];
const SPARKLINE_CA      = [45, 67, 89, 72, 112, 63];

const RECENT_ACTIVITY = [
  { text: 'Nouveau prospect enregistré — Mariem Ouali', time: 'il y a 12 min', type: 'client', icon: Users },
  { text: 'C.R. soumis — Terrain Ariana (Rania K.)', time: 'il y a 45 min', type: 'cr', icon: CheckCircle2 },
  { text: 'Offre reçue — Local Lac 2 (Horizon SARL)', time: 'il y a 1h', type: 'offre', icon: Banknote },
  { text: 'Visite confirmée — Appt T3 La Marsa, 10h', time: 'il y a 2h', type: 'visite', icon: CalendarDays },
  { text: 'Nouveau mandat signé — Villa Menzah 6', time: 'il y a 3h', type: 'mandat', icon: Target },
  { text: 'Transaction clôturée — Duplex Ennasr', time: 'hier', type: 'cloture', icon: Award },
];

const ACTIVITY_COLORS: Record<string, string> = {
  client: 'text-primary bg-primary-light',
  cr: 'text-success bg-success-light',
  offre: 'text-warning bg-warning-light',
  visite: 'text-purple bg-purple-light',
  mandat: 'text-primary bg-primary-light',
  cloture: 'text-success bg-success-light',
};

const PIPELINE_STAGES = [
  { label: 'Prospection', count: 4, color: '#9CA3AF' },
  { label: 'Visite',      count: 3, color: '#185FA5' },
  { label: 'Offre',       count: 2, color: '#534AB7' },
  { label: 'Compromis',   count: 2, color: '#854F0B' },
  { label: 'Acte',        count: 1, color: '#3B6D11' },
];

// ─── KPI card with sparkline ──────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  sparkData: number[];
  trend: number;
  trendLabel: string;
  icon: React.FC<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  sparkColor?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label, value, sparkData, trend, trendLabel, icon: Icon,
  iconBg, iconColor, sparkColor = '#185FA5',
}) => {
  const positive = trend >= 0;
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
        <SparkLine data={sparkData} width={72} height={28} color={sparkColor} />
      </div>
      <div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
      <div className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-success' : 'text-danger'}`}>
        {positive
          ? <ArrowUpRight size={13} />
          : <ArrowDownRight size={13} />
        }
        <span>{positive ? '+' : ''}{trend}%</span>
        <span className="text-gray-400 font-normal">{trendLabel}</span>
      </div>
    </div>
  );
};

// ─── Main dashboard ───────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();
  const { agents, appointments } = useAgentsStore();

  const [chartView, setChartView] = useState<'visites' | 'ca'>('visites');

  const activeProperties = properties.filter((p) => p.status === 'disponible').length;
  const activeClients    = clients.filter((c) => c.status === 'actif').length;

  const todayAppts = appointments
    .filter((a) => a.date === '2024-12-23' && a.status !== 'annule')
    .sort((a, b) => a.time.localeCompare(b.time));

  const donutData = [
    { label: 'Vente résidentielle', value: properties.filter((p) => p.type === 'vente_residentielle').length, color: '#185FA5' },
    { label: 'Location',            value: properties.filter((p) => p.type === 'location_residentielle').length, color: '#534AB7' },
    { label: 'Commercial',          value: properties.filter((p) => p.type === 'commercial').length, color: '#3B6D11' },
    { label: 'Terrain',             value: properties.filter((p) => p.type === 'terrain').length, color: '#854F0B' },
  ];

  const APPT_TYPE_LABELS: Record<string, string> = {
    visite: 'Visite', signature: 'Signature', appel: 'Appel',
    reunion: 'Réunion', autre: 'Autre',
  };
  const APPT_TYPE_COLORS: Record<string, string> = {
    visite: 'bg-primary-light text-primary',
    signature: 'bg-success-light text-success',
    reunion: 'bg-purple-light text-purple',
    appel: 'bg-warning-light text-warning',
    autre: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tableau de bord</h2>
          <p className="text-sm text-gray-400">Lundi 23 décembre 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            Ce mois
          </button>
          <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 transition-colors">
            Exporter
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Biens actifs"
          value={String(activeProperties)}
          sparkData={[6, 7, 8, 7, 9, activeProperties]}
          trend={8}
          trendLabel="vs mois dernier"
          icon={Building2}
          iconBg="bg-primary-light"
          iconColor="text-primary"
          sparkColor="#185FA5"
        />
        <KpiCard
          label="Clients actifs"
          value={String(activeClients)}
          sparkData={SPARKLINE_CLIENTS}
          trend={12}
          trendLabel="vs mois dernier"
          icon={Users}
          iconBg="bg-success-light"
          iconColor="text-success"
          sparkColor="#3B6D11"
        />
        <KpiCard
          label="CA mensuel (DT)"
          value="63 000"
          sparkData={SPARKLINE_CA}
          trend={-11}
          trendLabel="vs novembre"
          icon={Banknote}
          iconBg="bg-warning-light"
          iconColor="text-warning"
          sparkColor="#854F0B"
        />
        <KpiCard
          label="Visites ce mois"
          value="19"
          sparkData={SPARKLINE_VISITS}
          trend={-46}
          trendLabel="vs novembre"
          icon={Eye}
          iconBg="bg-purple-light"
          iconColor="text-purple"
          sparkColor="#534AB7"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Performance mensuelle */}
        <div className="col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Performance mensuelle</h3>
                <p className="text-xs text-gray-400 mt-0.5">6 derniers mois</p>
              </div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setChartView('visites')}
                  className={[
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    chartView === 'visites' ? 'bg-white text-primary shadow-sm' : 'text-gray-500',
                  ].join(' ')}
                >
                  Visites
                </button>
                <button
                  onClick={() => setChartView('ca')}
                  className={[
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    chartView === 'ca' ? 'bg-white text-primary shadow-sm' : 'text-gray-500',
                  ].join(' ')}
                >
                  Chiffre d'affaires
                </button>
              </div>
            </div>
            {chartView === 'visites' ? (
              <BarChart
                data={MONTHLY_VISITS_ONLY}
                height={160}
                color="#185FA5"
                formatValue={(v) => String(v)}
              />
            ) : (
              <BarChart
                data={MONTHLY_CA_ONLY}
                height={160}
                color="#3B6D11"
                formatValue={(v) => `${(v / 1000).toFixed(0)}K`}
              />
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">153</div>
                <div className="text-xs text-gray-400">Total visites S2</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">448 000 DT</div>
                <div className="text-xs text-gray-400">CA total S2</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">18</div>
                <div className="text-xs text-gray-400">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">11,8%</div>
                <div className="text-xs text-gray-400">Taux conversion</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Répartition biens */}
        <Card>
          <CardHeader
            title="Répartition du portefeuille"
            subtitle={`${properties.length} biens au total`}
          />
          <DonutChart
            data={donutData}
            size={120}
            thickness={20}
            centerLabel={String(properties.length)}
            centerSub="biens"
          />
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Taux occupation (locations)</span>
              <span className="font-medium text-gray-700">75%</span>
            </div>
            <ProgressBar value={75} color="green" size="sm" />
          </div>
        </Card>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Activité récente */}
        <div className="col-span-2">
          <Card>
            <CardHeader
              title="Activité récente"
              action={
                <button className="text-xs text-primary flex items-center gap-1 hover:underline">
                  Tout voir <ArrowRight size={12} />
                </button>
              }
            />
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((item, i) => {
                const Icon = item.icon;
                const colorClass = ACTIVITY_COLORS[item.type] ?? 'text-gray-500 bg-gray-100';
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-b-0"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon size={13} />
                    </div>
                    <span className="text-sm text-gray-700 flex-1 leading-5">{item.text}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{item.time}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* RDV du jour */}
        <Card>
          <CardHeader
            title="RDV aujourd'hui"
            subtitle={`${todayAppts.length} événements`}
            action={<CalendarDays size={15} className="text-gray-400" />}
          />
          <div className="space-y-2">
            {todayAppts.map((appt) => {
              const colorClass = APPT_TYPE_COLORS[appt.type] ?? 'bg-gray-100 text-gray-500';
              const agentName = agents.find((a) => a.id === appt.agentId)?.name?.split(' ')[0] ?? '';
              return (
                <div key={appt.id} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                  <div className="w-10 text-xs font-mono font-semibold text-primary flex-shrink-0 pt-0.5">
                    {appt.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate leading-5">
                      {appt.title}
                    </div>
                    <div className="text-xs text-gray-400">{agentName}</div>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${colorClass}`}>
                    {APPT_TYPE_LABELS[appt.type]}
                  </span>
                </div>
              );
            })}
            {todayAppts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">
                Aucun rendez-vous planifié
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Pipeline résumé */}
        <Card>
          <CardHeader title="Pipeline commercial" subtitle="Dossiers actifs par étape" />
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600">{stage.label}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(stage.count / 4) * 100}%`,
                          background: stage.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-4">{stage.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-xs text-primary text-center py-2 hover:underline flex items-center justify-center gap-1">
            Voir le kanban <ArrowRight size={12} />
          </button>
        </Card>

        {/* Agents performance */}
        <div className="col-span-2">
          <Card>
            <CardHeader title="Performance agents" subtitle="Ce mois" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-medium">Agent</th>
                    <th className="text-right pb-2 font-medium">Biens</th>
                    <th className="text-right pb-2 font-medium">Visites</th>
                    <th className="text-right pb-2 font-medium">Transactions</th>
                    <th className="text-right pb-2 font-medium">Commission</th>
                    <th className="text-right pb-2 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {agents
                    .filter((a) => ['agent_terrain', 'agent_bureau'].includes(a.role))
                    .sort((a, b) => b.stats.commission - a.stats.commission)
                    .map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={agent.initials} size="xs" status={agent.status} />
                            <div>
                              <div className="font-medium text-gray-800 text-xs">{agent.name}</div>
                              <div className="text-xs text-gray-400 capitalize">
                                {agent.role === 'agent_terrain' ? 'Terrain' : 'Bureau'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-xs font-medium text-gray-700">
                          {agent.stats.activeProperties}
                        </td>
                        <td className="py-2.5 text-right text-xs font-medium text-gray-700">
                          {agent.stats.visitsThisMonth}
                        </td>
                        <td className="py-2.5 text-right text-xs font-medium text-gray-700">
                          {agent.stats.transactions}
                        </td>
                        <td className="py-2.5 text-right text-xs font-semibold text-success">
                          {agent.stats.commission.toLocaleString('fr-TN')} DT
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge
                            variant={
                              agent.status === 'disponible' ? 'disponible' :
                              agent.status === 'en_visite' ? 'info' :
                              agent.status === 'bureau' ? 'compromis' : 'gray'
                            }
                            size="sm"
                            label={
                              agent.status === 'disponible' ? 'Dispo' :
                              agent.status === 'en_visite' ? 'En visite' :
                              agent.status === 'bureau' ? 'Bureau' : 'Hors ligne'
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Objectifs du mois */}
      <Card>
        <CardHeader title="Objectifs — Décembre 2024" />
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: 'Visites réalisées', value: 19, target: 40, color: 'blue' as const },
            { label: 'Nouveaux mandats', value: 3,  target: 8,  color: 'purple' as const },
            { label: 'Compromis signés',  value: 2,  target: 5,  color: 'green' as const },
            { label: 'CA mensuel',       value: 63, target: 120, color: 'amber' as const, suffix: 'K DT' },
          ].map((obj, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-gray-600">{obj.label}</span>
                <span className="text-xs font-medium text-gray-800">
                  {obj.value}{obj.suffix ?? ''} / {obj.target}{obj.suffix ?? ''}
                </span>
              </div>
              <ProgressBar
                value={obj.value}
                max={obj.target}
                color={obj.color}
                showLabel
                size="md"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
