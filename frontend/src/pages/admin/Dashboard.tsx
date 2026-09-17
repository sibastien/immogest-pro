import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, CalendarDays, ArrowRight,
  BarChart3, Activity, Bed, Bath, Square, Home, Heart,
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
  const activeClients    = clients.filter((c) => c.status === 'actif').length;

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

  return (
    <div className="space-y-5">
      {/* Conception Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Bonjour,</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">Voici un aperçu de votre activité aujourd'hui</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium hidden sm:inline capitalize mr-2">{todayLabel}</span>
          <button className="px-3.5 py-1.5 border border-gray-200 bg-white rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            Ce mois
          </button>
          <button className="px-4 py-1.5 bg-[#F5C518] hover:bg-[#E5B510] text-gray-950 font-bold rounded-xl text-xs shadow-sm transition-all hover:scale-[1.02] flex items-center gap-1.5">
            Exporter
          </button>
        </div>
      </div>

      {/* 4 Conception-matched KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs text-gray-500 font-medium">Biens en ligne</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{activeProperties || 24}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +2
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs text-gray-500 font-medium">Nouveaux clients</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{activeClients || 6}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +3
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs text-gray-500 font-medium">Visites aujourd'hui</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{totalVisits || 12}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +5
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-xs text-gray-500 font-medium">Transactions</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{closedTx.length || 3}</span>
            <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              +1
            </span>
          </div>
        </div>
      </div>

      {/* Conception Showcase Row: Derniers biens ajoutés & Dernières demandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Derniers biens ajoutés (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Derniers biens ajoutés</h3>
            <Link
              to="/admin/biens"
              className="text-xs font-semibold text-[#B45309] hover:text-[#92400E] flex items-center gap-1 transition-colors"
            >
              Voir tout <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="relative h-28 bg-slate-100 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80"
                  alt="Villa à Hammamet"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                  <Heart size={13} />
                </button>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 truncate">Villa à Hammamet</h4>
                  <div className="text-sm font-extrabold text-gray-950 mt-1">850 000 TND</div>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-gray-50">
                  <span className="flex items-center gap-1"><Bed size={12} /> 4</span>
                  <span className="flex items-center gap-1"><Bath size={12} /> 3</span>
                  <span className="flex items-center gap-1"><Square size={11} /> 320 m²</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="relative h-28 bg-slate-100 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&auto=format&fit=crop&q=80"
                  alt="Appartement à Tunis"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                  <Heart size={13} />
                </button>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 truncate">Appartement à Tunis</h4>
                  <div className="text-sm font-extrabold text-gray-950 mt-1">420 000 TND</div>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-gray-50">
                  <span className="flex items-center gap-1"><Bed size={12} /> 3</span>
                  <span className="flex items-center gap-1"><Bath size={12} /> 2</span>
                  <span className="flex items-center gap-1"><Square size={11} /> 120 m²</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
              <div className="relative h-28 bg-slate-100 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&auto=format&fit=crop&q=80"
                  alt="Terrain à Sousse"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                  <Heart size={13} />
                </button>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-gray-800 truncate">Terrain à Sousse</h4>
                  <div className="text-sm font-extrabold text-gray-950 mt-1">250 000 TND</div>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] text-gray-400 mt-2.5 pt-2 border-t border-gray-50">
                  <span className="flex items-center gap-1"><Square size={11} /> 800 m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières demandes (1 col) */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Dernières demandes</h3>
              <Link
                to="/admin/clients"
                className="text-xs font-semibold text-[#B45309] hover:text-[#92400E] flex items-center gap-1 transition-colors"
              >
                Tout voir <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-3">
              {/* Demand 1 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#FEF9E7] border border-[#F5C518]/30 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <Home size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">Achat – Maison</div>
                    <div className="text-[11px] text-gray-400">Tunis · 16/09/2025</div>
                  </div>
                </div>
                <Badge variant="nouveau" size="sm" />
              </div>

              {/* Demand 2 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700">
                    <Building2 size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">Achat – Appartement</div>
                    <div className="text-[11px] text-gray-400">Sousse · 16/09/2025</div>
                  </div>
                </div>
                <Badge variant="nouveau" size="sm" />
              </div>

              {/* Demand 3 */}
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#FEF9E7] border border-[#F5C518]/30 flex items-center justify-center flex-shrink-0 text-amber-700">
                    <Home size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900 truncate">Location – Villa</div>
                    <div className="text-[11px] text-gray-400">Hammamet · 15/09/2025</div>
                  </div>
                </div>
                <Badge variant="en_cours" size="sm" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>3 nouvelles requêtes</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Mises à jour en direct
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
