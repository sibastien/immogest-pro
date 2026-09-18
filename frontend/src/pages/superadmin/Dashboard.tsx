import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, DollarSign, Sparkles, AlertCircle,
  Plus, Search, RefreshCw, CheckCircle2, ShieldAlert,
  Trash2, Edit3, ArrowRight, X
} from 'lucide-react';
import { api } from '../../lib/api';

interface TenantUsage {
  properties: number;
  agents: number;
  clients: number;
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'entreprise' | 'trial';
  planStatus: 'active' | 'suspended' | 'canceled';
  trialEndsAt?: string | null;
  ownerEmail: string;
  createdAt: string;
  usage: TenantUsage;
}

interface SuperAdminStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  estimatedMRR: number;
  totalProperties: number;
  totalAgents: number;
  totalClients: number;
  totalTransactions: number;
  planBreakdown: {
    starter: number;
    pro: number;
    entreprise: number;
    trial: number;
  };
}

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [editingTenant, setEditingTenant] = useState<TenantItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New tenant form
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPlan, setNewPlan] = useState<'starter' | 'pro' | 'entreprise' | 'trial'>('pro');
  const [submitting, setSubmitting] = useState(false);

  // Edit tenant form
  const [editName, setEditName] = useState('');
  const [editPlan, setEditPlan] = useState<'starter' | 'pro' | 'entreprise' | 'trial'>('pro');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'canceled'>('active');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, tenantsData] = await Promise.all([
        api.get<SuperAdminStats>('/superadmin/stats'),
        api.get<TenantItem[]>('/superadmin/tenants'),
      ]);
      setStats(statsData);
      setTenants(tenantsData);
    } catch (err) {
      console.error(err);
      setActionMsg({ type: 'error', text: 'Erreur lors du chargement des données SuperAdmin.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.slug.toLowerCase().includes(search.toLowerCase()) ||
        t.ownerEmail.toLowerCase().includes(search.toLowerCase());

      const matchPlan = planFilter === 'all' || t.plan === planFilter;
      const matchStatus = statusFilter === 'all' || t.planStatus === statusFilter;

      return matchSearch && matchPlan && matchStatus;
    });
  }, [tenants, search, planFilter, statusFilter]);

  const handleOpenEdit = (tenant: TenantItem) => {
    setEditingTenant(tenant);
    setEditName(tenant.name);
    setEditPlan(tenant.plan);
    setEditStatus(tenant.planStatus);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setSubmitting(true);
    try {
      await api.put(`/superadmin/tenants/${editingTenant.id}`, {
        name: editName,
        plan: editPlan,
        planStatus: editStatus,
      });
      setEditingTenant(null);
      setActionMsg({ type: 'success', text: `Agence "${editName}" mise à jour avec succès.` });
      fetchData();
    } catch {
      setActionMsg({ type: 'error', text: 'Impossible de mettre à jour l’agence.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: TenantItem) => {
    const newStatus = tenant.planStatus === 'active' ? 'suspended' : 'active';
    const actionLabel = newStatus === 'suspended' ? 'suspendre' : 'réactiver';
    if (!window.confirm(`Voulez-vous ${actionLabel} l'accès de l'agence "${tenant.name}" ?`)) return;

    try {
      await api.put(`/superadmin/tenants/${tenant.id}`, { planStatus: newStatus });
      setActionMsg({ type: 'success', text: `Agence ${newStatus === 'suspended' ? 'suspendue' : 'réactivée'}.` });
      fetchData();
    } catch {
      setActionMsg({ type: 'error', text: 'Erreur lors du changement de statut.' });
    }
  };

  const handleDeleteTenant = async (tenant: TenantItem) => {
    if (tenant.id === 'default') {
      alert('Impossible de supprimer le tenant principal par défaut.');
      return;
    }
    const confirmPrompt = window.prompt(
      `ATTENTION : Vous allez supprimer définitivement l'agence "${tenant.name}" et toutes ses données (biens, clients, visites).\n\nTapez "SUPPRIMER" pour confirmer :`
    );
    if (confirmPrompt !== 'SUPPRIMER') return;

    try {
      await api.del(`/superadmin/tenants/${tenant.id}`);
      setActionMsg({ type: 'success', text: `Agence "${tenant.name}" supprimée avec succès.` });
      fetchData();
    } catch {
      setActionMsg({ type: 'error', text: 'Erreur lors de la suppression.' });
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName || !newEmail) return;
    setSubmitting(true);
    try {
      await api.post('/superadmin/tenants', {
        agencyName: newAgencyName,
        adminName: newAdminName || 'Administrateur',
        email: newEmail,
        password: newPassword || 'password123',
        phone: newPhone,
        plan: newPlan,
      });
      setShowCreateModal(false);
      setNewAgencyName('');
      setNewAdminName('');
      setNewEmail('');
      setNewPassword('');
      setNewPhone('');
      setActionMsg({ type: 'success', text: 'Nouvelle agence provisionnée avec succès !' });
      fetchData();
    } catch {
      setActionMsg({ type: 'error', text: 'Erreur lors de la création de l’agence.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #0D3B6E 0%, #185FA5 100%)' }}>
              <span className="text-white font-black text-sm">SaaS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 leading-none">Console Super-Admin</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Propriétaire
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Pilotage global de la plateforme ImmoGest Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              title="Rafraîchir les données"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin text-blue-600' : ''} />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-95"
              style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E7FC4 100%)' }}
            >
              <Plus size={15} /> Nouvelle Agence
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
            >
              Aller à mon agence <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {actionMsg && (
          <div className={`p-4 rounded-2xl text-sm flex items-center justify-between ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2.5">
              {actionMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{actionMsg.text}</span>
            </div>
            <button onClick={() => setActionMsg(null)} className="text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── KPI Metric Cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Agences */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Agences</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats?.totalTenants ?? '—'}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span className="text-emerald-600 font-semibold">{stats?.activeTenants ?? 0} actives</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">{stats?.trialTenants ?? 0} essais</span>
            </div>
          </div>

          {/* Card 2: MRR Estimé */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">MRR Mensuel Estimé</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {stats?.estimatedMRR ? `${stats.estimatedMRR.toLocaleString()} DT` : '0 DT'}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Revenu récurrent des abonnements actifs
            </div>
          </div>

          {/* Card 3: Essais Gratuits */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Essais 14 Jours</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">{stats?.trialTenants ?? '0'}</div>
            <div className="text-xs text-amber-600 font-semibold mt-2">
              Prospects en cours de conversion
            </div>
          </div>

          {/* Card 4: Volume Global Réseau */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Biens & Utilisateurs</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {(stats?.totalProperties ?? 0) + (stats?.totalAgents ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>{stats?.totalProperties ?? 0} biens</span>
              <span>•</span>
              <span>{stats?.totalAgents ?? 0} agents</span>
            </div>
          </div>
        </div>

        {/* ── Plan breakdown banner ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span>Répartition des forfaits :</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Starter (99 DT) : <span className="font-bold">{stats?.planBreakdown?.starter ?? 0}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-xs font-semibold text-blue-800 flex items-center gap-2 border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Pro (199 DT) : <span className="font-bold">{stats?.planBreakdown?.pro ?? 0}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-semibold text-purple-800 flex items-center gap-2 border border-purple-100">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              Entreprise (399 DT) : <span className="font-bold">{stats?.planBreakdown?.entreprise ?? 0}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-xs font-semibold text-amber-800 flex items-center gap-2 border border-amber-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Essai gratuit : <span className="font-bold">{stats?.planBreakdown?.trial ?? 0}</span>
            </div>
          </div>
        </div>

        {/* ── Search & Filter Controls ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une agence, slug, email propriétaire…"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Plan */}
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les forfaits</option>
                <option value="trial">Essai gratuit</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="entreprise">Entreprise</option>
              </select>

              {/* Filter Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>

          {/* ── Tenants / Subscribers Table ─────────────────────────────────── */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Agence & Slug</th>
                  <th className="py-3 px-4">Propriétaire</th>
                  <th className="py-3 px-4">Date Inscription</th>
                  <th className="py-3 px-4">Forfait</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Utilisation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Aucune agence ne correspond à vos critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{t.name}</div>
                        <div className="text-[11px] text-blue-600 font-mono flex items-center gap-1">
                          <span>{t.slug}.immogest.pro</span>
                        </div>
                      </td>

                      {/* Owner Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900">{t.ownerEmail}</div>
                        <div className="text-[11px] text-gray-400">ID: {t.id}</div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          t.plan === 'entreprise'
                            ? 'bg-purple-100 text-purple-800'
                            : t.plan === 'pro'
                            ? 'bg-blue-100 text-blue-800'
                            : t.plan === 'starter'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          t.planStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            t.planStatus === 'active' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          {t.planStatus === 'active' ? 'Actif' : 'Suspendu'}
                        </span>
                      </td>

                      {/* Usage */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] text-gray-600">
                          <span className="font-semibold text-gray-900">{t.usage.properties}</span> biens •{' '}
                          <span className="font-semibold text-gray-900">{t.usage.agents}</span> agents
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(t)}
                            title="Modifier l'agence & le forfait"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Toggle status button */}
                          <button
                            onClick={() => handleToggleStatus(t)}
                            title={t.planStatus === 'active' ? 'Suspendre l’accès' : 'Réactiver l’accès'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              t.planStatus === 'active'
                                ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <ShieldAlert size={15} />
                          </button>

                          {/* Delete button (except default) */}
                          {t.id !== 'default' && (
                            <button
                              onClick={() => handleDeleteTenant(t)}
                              title="Supprimer l'agence"
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Modal: Edit Agency Plan & Status ───────────────────────────────── */}
      {editingTenant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(13, 59, 110, 0.6)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTenant(null); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Gérer l'Agence</h3>
                  <p className="text-xs text-gray-400">{editingTenant.slug}.immogest.pro</p>
                </div>
              </div>
              <button onClick={() => setEditingTenant(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de l'agence</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Formule d'abonnement</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="starter">Starter (99 DT / mois)</option>
                  <option value="pro">Pro (199 DT / mois)</option>
                  <option value="entreprise">Entreprise (399 DT / mois)</option>
                  <option value="trial">Essai gratuit (14 jours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Statut d'accès</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Actif (Accès autorisé)</option>
                  <option value="suspended">Suspendu (Accès bloqué)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95"
                  style={{ background: '#185FA5' }}
                >
                  {submitting ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Create New Agency ───────────────────────────────────────── */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: 'rgba(13, 59, 110, 0.6)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Nouvelle Agence</h3>
                  <p className="text-xs text-gray-400">Provisionner un compte client manuellement</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de l'agence *</label>
                <input
                  type="text"
                  value={newAgencyName}
                  onChange={(e) => setNewAgencyName(e.target.value)}
                  placeholder="Ex: Carthage Immo"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom gérant</label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Prénom Nom"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+216 ..."
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email propriétaire *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="contact@agence.tn"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe temporaire</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="password123 (par défaut)"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Forfait attribué</label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pro">Pro (199 DT / mois)</option>
                  <option value="starter">Starter (99 DT / mois)</option>
                  <option value="entreprise">Entreprise (399 DT / mois)</option>
                  <option value="trial">Essai gratuit 14 jours</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newAgencyName || !newEmail}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95"
                  style={{ background: '#185FA5' }}
                >
                  {submitting ? 'Création…' : 'Créer l’agence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
