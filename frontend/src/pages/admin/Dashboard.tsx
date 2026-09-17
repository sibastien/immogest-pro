import React, { useState } from 'react';
import {
  Building2, Users, CalendarDays, ArrowRight,
  BarChart3, Activity,
  Handshake, User, Clock,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { BarChart } from '../../components/ui/BarChart';
import { DonutChart } from '../../components/ui/DonutChart';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { useAgentsStore } from '../../store/agentsStore';

const todayISO = new Date().toISOString().slice(0, 10);
const todayLabel = new Date().toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

// ─── Main dashboard ───────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();
  const { agents, appointments, visits, transactions } = useAgentsStore();

  const [chartView, setChartView] = useState<'visites' | 'ca'>('visites');

  const activeProperties = properties.filter((p) => p.status === 'disponible').length;

  // Live aggregates (zero until the agency adds data)
  const closedTx   = transactions.filter((t) => t.stage === 'cloture');
  const caRealise  = closedTx.reduce((s, t) => s + t.amount, 0);
  const totalVisits = visits.length;
  const conversion  = totalVisits > 0 ? Math.round((closedTx.length / totalVisits) * 1000) / 10 : 0;

  const todayAppts = appointments
    .filter((a) => a.date === todayISO && a.status !== 'annule')
    .sort((a, b) => a.time.localeCompare(b.time));

  const hasPortfolio = properties.length > 0;

  const donutData = [
    { label: 'Villa',            value: properties.filter((p) => p.type === 'villa').length, color: '#185FA5' },
    { label: 'Appartement',      value: properties.filter((p) => p.type === 'appartement').length, color: '#534AB7' },
    { label: 'Maison',           value: properties.filter((p) => p.type === 'maison').length, color: '#3B6D11' },
    { label: 'Local commercial', value: properties.filter((p) => p.type === 'commercial').length, color: '#854F0B' },
    { label: 'Terrain',          value: properties.filter((p) => p.type === 'terrain').length, color: '#0F766E' },
  ];

  // Pipeline stages derived from transactions
  const PIPELINE_DEF = [
    { id: 'prospection', label: 'Prospection', color: '#9CA3AF' },
    { id: 'visite',      label: 'Visite',      color: '#185FA5' },
    { id: 'offre',       label: 'Offre',       color: '#534AB7' },
    { id: 'compromis',   label: 'Compromis',   color: '#854F0B' },
    { id: 'acte',        label: 'Acte',        color: '#3B6D11' },
  ] as const;
  const pipelineStages = PIPELINE_DEF.map((s) => ({
    ...s,
    count: transactions.filter((t) => t.stage === s.id).length,
  }));
  const pipelineMax = Math.max(1, ...pipelineStages.map((s) => s.count));

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

  const teamAgents = agents.filter((a) => ['agent_terrain', 'agent_bureau'].includes(a.role));
  const fmt = (n: number) => n.toLocaleString('fr-TN');

  // ─── Technical Schema KPI Cards Data ───────────────────────────────────────
  const latestProp = properties[0];
  const newPropsCount = properties.filter((p) => {
    const diff = (Date.now() - new Date(p.createdAt || Date.now()).getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  }).length || (properties.length > 0 ? properties.length : 3);

  const latestClient = clients[0];
  const newClientsCount = clients.filter((c) => {
    const diff = (Date.now() - new Date(c.createdAt || Date.now()).getTime()) / (1000 * 3600 * 24);
    return diff <= 7;
  }).length || (clients.length > 0 ? clients.length : 1);

  const todayVisit = todayAppts[0];
  const visitClient = todayVisit?.clientId ? clients.find((c) => c.id === todayVisit.clientId) : null;
  const visitProp = todayVisit?.propertyId ? properties.find((p) => p.id === todayVisit.propertyId) : null;
  const todayVisitsCount = todayAppts.length > 0 ? todayAppts.length : 1;

  const latestTx = transactions[0];
  const txClient = latestTx?.clientId ? clients.find((c) => c.id === latestTx.clientId) : null;
  const txProp = latestTx?.propertyId ? properties.find((p) => p.id === latestTx.propertyId) : null;
  const txCount = transactions.filter((t) => t.createdAt === todayISO).length || (transactions.length > 0 ? transactions.length : 3);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tableau de bord</h2>
          <p className="text-sm text-gray-400 capitalize">{todayLabel}</p>
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

      {/* ─── Technical Schema KPI Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Nouveau Bien */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-3.5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="text-center pb-2 border-b border-gray-100">
            <div className="font-bold text-xs uppercase tracking-wider text-gray-900">Nouveau Bien</div>
            <div className="text-[10px] text-gray-500 font-medium">(Nouveau Bien ajouté)</div>
          </div>
          <div className="py-2.5 flex items-center justify-center">
            <div className="w-13 h-13 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-800 shadow-inner">
              <Handshake size={26} strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-[11px] divide-y divide-gray-100 border-t border-b border-gray-200 py-0.5 my-1">
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Titre du Bien</span>
              <span className="font-semibold text-gray-900 truncate max-w-[130px] text-right" title={latestProp?.title || 'Villa Hammamet'}>
                {latestProp?.title || 'Villa Hammamet'}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Prix (TND)</span>
              <span className="font-bold text-gray-900 text-right">
                {latestProp ? `${fmt(latestProp.price)} TND` : '420 000 TND'}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Caractéristiques</span>
              <span className="font-medium text-gray-700 truncate max-w-[130px] text-right">
                {latestProp
                  ? `${latestProp.rooms ?? 3}P · ${latestProp.bathrooms ?? 2}SDB · ${latestProp.surface}m²`
                  : '3+1+W · 220 m²'}
              </span>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-gray-300 text-gray-700 bg-gray-50">
              Données clés
            </span>
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ↑ {newPropsCount}
            </span>
          </div>
        </div>

        {/* Card 2: Nouveau Client */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-3.5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="text-center pb-2 border-b border-gray-100">
            <div className="font-bold text-xs uppercase tracking-wider text-gray-900">Nouveau Client</div>
            <div className="text-[10px] text-gray-500 font-medium">(Nouveau Client ajouté)</div>
          </div>
          <div className="py-2.5 flex items-center justify-center">
            <div className="w-13 h-13 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-800 shadow-inner">
              <User size={26} strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-[11px] divide-y divide-gray-100 border-t border-b border-gray-200 py-0.5 my-1">
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Nom du Client</span>
              <span className="font-semibold text-gray-900 truncate max-w-[130px] text-right" title={latestClient?.name || 'Sami Ben Ali'}>
                {latestClient?.name || 'Sami Ben Ali'}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Recherche</span>
              <span className="font-semibold text-gray-900 truncate max-w-[130px] text-right">
                {latestClient?.search || (latestClient?.type === 'locataire' ? 'Location' : 'Achat - Villa')}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Budget</span>
              <span className="font-bold text-gray-900 text-right">
                {latestClient?.budget?.max ? `${fmt(latestClient.budget.max)} TND` : '350 000 TND'}
              </span>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-end">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ↑ {newClientsCount}
            </span>
          </div>
        </div>

        {/* Card 3: Visite Planifiée Aujourd'hui */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-3.5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="text-center pb-2 border-b border-gray-100">
            <div className="font-bold text-xs uppercase tracking-wider text-gray-900">Visite Planifiée</div>
            <div className="text-[10px] text-gray-500 font-medium">Aujourd'hui</div>
          </div>
          <div className="py-2.5 flex items-center justify-center">
            <div className="w-13 h-13 rounded-lg border border-gray-200 bg-gray-50 relative flex items-center justify-center text-gray-800 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <path d="M3 9h6v6H3" />
                <path d="M9 15h6v6" />
                <path d="M15 3v6h6" />
              </svg>
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-xs">
                <Clock size={11} className="text-gray-700" />
              </div>
            </div>
          </div>
          <div className="text-[11px] divide-y divide-gray-100 border-t border-b border-gray-200 py-0.5 my-1">
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Nom du Client</span>
              <span className="font-semibold text-gray-900 truncate max-w-[130px] text-right">
                {todayVisit ? (visitClient?.name || todayVisit.title || 'Client Visiteur') : (clients[0]?.name || 'Karim Trabelsi')}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Heure</span>
              <span className="font-bold text-gray-900 text-right">
                {todayVisit?.time || '14:30'}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Adresse du Bien</span>
              <span className="font-medium text-gray-700 truncate max-w-[130px] text-right" title={visitProp?.address || visitProp?.location || 'Av. Habib Bourguiba, Hammamet'}>
                {visitProp?.address || visitProp?.location || 'Av. H. Bourguiba, Hammamet'}
              </span>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-end">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ↑ {todayVisitsCount}
            </span>
          </div>
        </div>

        {/* Card 4: Transactions */}
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm p-3.5 flex flex-col justify-between hover:shadow-md transition-all">
          <div className="text-center pb-2 border-b border-gray-100">
            <div className="font-bold text-xs uppercase tracking-wider text-gray-900">Transactions</div>
            <div className="text-[10px] text-gray-500 font-medium">(Transactions aujourd'hui)</div>
          </div>
          <div className="py-2.5 flex items-center justify-center">
            <div className="w-13 h-13 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-800 shadow-inner">
              <Handshake size={26} strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-[11px] divide-y divide-gray-100 border-t border-b border-gray-200 py-0.5 my-1">
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Client</span>
              <span className="font-semibold text-gray-900 truncate max-w-[130px] text-right">
                {txClient?.name || 'Mounir Bouazizi'}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Bien</span>
              <span className="font-semibold text-gray-900 truncate max-w-[130px] text-right" title={txProp?.title || 'Appartement Sousse'}>
                {txProp?.title || 'Appartement Sousse'}
              </span>
            </div>
            <div className="py-1 flex items-center justify-between gap-1">
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Montant</span>
              <span className="font-bold text-gray-900 text-right">
                {latestTx ? `${fmt(latestTx.amount)} TND` : '280 000 TND'}
              </span>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-end">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              ↑ {txCount}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-5">
        {/* Performance mensuelle */}
        <div className="col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Performance mensuelle</h3>
                <p className="text-xs text-gray-400 mt-0.5">Données cumulées</p>
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

            {totalVisits === 0 && transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400" style={{ height: 160 }}>
                <BarChart3 size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Aucune donnée à afficher</p>
                <p className="text-xs mt-1">Les statistiques s'afficheront dès les premières activités</p>
              </div>
            ) : chartView === 'visites' ? (
              <BarChart
                data={[{ label: 'Total', value: totalVisits }]}
                height={160}
                color="#185FA5"
                formatValue={(v) => String(v)}
              />
            ) : (
              <BarChart
                data={[{ label: 'CA', value: caRealise }]}
                height={160}
                color="#3B6D11"
                formatValue={(v) => `${(v / 1000).toFixed(0)}K`}
              />
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{totalVisits}</div>
                <div className="text-xs text-gray-400">Total visites</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{fmt(caRealise)} DT</div>
                <div className="text-xs text-gray-400">CA réalisé</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{closedTx.length}</div>
                <div className="text-xs text-gray-400">Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{conversion}%</div>
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
          {hasPortfolio ? (
            <>
              <DonutChart
                data={donutData}
                size={120}
                thickness={20}
                centerLabel={String(properties.length)}
                centerSub="biens"
              />
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Biens disponibles</span>
                  <span className="font-medium text-gray-700">
                    {Math.round((activeProperties / properties.length) * 100)}%
                  </span>
                </div>
                <ProgressBar value={activeProperties} max={properties.length} color="green" size="sm" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 py-10">
              <Building2 size={30} className="mb-2 opacity-30" />
              <p className="text-sm">Aucun bien enregistré</p>
            </div>
          )}
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
            <div className="flex flex-col items-center justify-center text-gray-400 py-12">
              <Activity size={30} className="mb-2 opacity-30" />
              <p className="text-sm">Aucune activité récente</p>
              <p className="text-xs mt-1">Les dernières actions de l'équipe apparaîtront ici</p>
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
            {pipelineStages.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-600">{stage.label}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(stage.count / pipelineMax) * 100}%`,
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
            <CardHeader title="Performance agents" subtitle="Équipe" />
            {teamAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-gray-400 py-10">
                <Users size={30} className="mb-2 opacity-30" />
                <p className="text-sm">Aucun agent dans l'équipe</p>
                <p className="text-xs mt-1">Ajoutez des agents depuis la page Équipe</p>
              </div>
            ) : (
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
                    {teamAgents
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
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
