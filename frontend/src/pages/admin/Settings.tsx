import React, { useState, useEffect } from 'react';
import {
  UserPlus, Trash2, RefreshCw, Copy, Check, KeyRound,
  ShieldCheck, Building2, CreditCard, Sparkles, AlertCircle, Save,
  Phone, MessageCircle, MapPin
} from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { api } from '../../lib/api';
import type { Agent, Role, Tenant } from '../../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'agent_terrain', label: 'Agent terrain' },
  { value: 'agent_bureau', label: 'Agent bureau' },
  { value: 'coordinatrice', label: 'Coordinatrice' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'client', label: 'Client' },
];

const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Super-Administrateur',
  admin: 'Administrateur',
  coordinatrice: 'Coordinatrice',
  agent_bureau: 'Agent bureau',
  agent_terrain: 'Agent terrain',
  client: 'Client',
};

function generateAccessCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  role: Role;
  accessCode: string;
}

const emptyForm = (): FormState => ({
  name: '',
  email: '',
  phone: '',
  role: 'agent_terrain',
  accessCode: generateAccessCode(),
});

export const AdminSettings: React.FC = () => {
  const { agents, addAgent, removeAgent } = useAgentsStore();
  const { tenant: authTenant, setTenant } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'agents' | 'subscription'>('agents');

  // Form agent state
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tenant / Subscription state
  const [tenantData, setTenantData] = useState<Tenant | null>(authTenant);
  const [agencyNameInput, setAgencyNameInput] = useState(authTenant?.name || '');
  const [agencyPhoneInput, setAgencyPhoneInput] = useState(authTenant?.phone || '');
  const [agencyWhatsAppInput, setAgencyWhatsAppInput] = useState(authTenant?.whatsapp || '');
  const [agencyAddressInput, setAgencyAddressInput] = useState(authTenant?.address || '');
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenantMsg, setTenantMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Fetch live tenant stats
    api.get<Tenant>('/tenant')
      .then((data) => {
        setTenantData(data);
        setAgencyNameInput(data.name || '');
        setAgencyPhoneInput(data.phone || '');
        setAgencyWhatsAppInput(data.whatsapp || '');
        setAgencyAddressInput(data.address || '');
        setTenant(data);
      })
      .catch(() => {});
  }, [setTenant]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Le nom est obligatoire';
    if (!form.email.trim()) e.email = "L'email est obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Email invalide';
    else if (agents.some((a) => a.email.toLowerCase() === form.email.trim().toLowerCase()))
      e.email = 'Un agent utilise déjà cet email';
    if (!form.accessCode.trim()) e.accessCode = "Le code d'accès est obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: form.name.trim(),
      initials: initialsFromName(form.name),
      role: form.role,
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      status: 'hors_ligne',
      accessCode: form.accessCode.trim().toUpperCase(),
      stats: { activeProperties: 0, visitsThisMonth: 0, transactions: 0, commission: 0 },
    };
    addAgent(newAgent);
    setForm(emptyForm());
    setErrors({});
  };

  const handleRemove = (agent: Agent) => {
    if (window.confirm(`Retirer ${agent.name} ? Cette personne ne pourra plus se connecter.`)) {
      removeAgent(agent.id);
    }
  };

  const handleCopy = (agent: Agent) => {
    if (!agent.accessCode) return;
    navigator.clipboard?.writeText(agent.accessCode);
    setCopiedId(agent.id);
    setTimeout(() => setCopiedId((id) => (id === agent.id ? null : id)), 1500);
  };

  const handleSaveAgencyDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyNameInput.trim()) return;
    setSavingTenant(true);
    setTenantMsg(null);
    try {
      const updated = await api.put<Tenant>('/tenant', {
        name: agencyNameInput.trim(),
        phone: agencyPhoneInput.trim(),
        whatsapp: agencyWhatsAppInput.trim(),
        address: agencyAddressInput.trim(),
      });
      setTenantData((prev) => prev ? { ...prev, ...updated } : updated);
      setTenant(updated);
      setTenantMsg({ type: 'success', text: 'Coordonnées de l’agence mises à jour avec succès !' });
    } catch {
      setTenantMsg({ type: 'error', text: 'Erreur lors de la mise à jour.' });
    } finally {
      setSavingTenant(false);
    }
  };

  const handlePlanChange = async (plan: 'starter' | 'pro' | 'entreprise') => {
    if (!window.confirm(`Changer pour le forfait ${plan.toUpperCase()} ?`)) return;
    try {
      await api.post('/tenant/plan', { plan });
      const refetched = await api.get<Tenant>('/tenant');
      setTenantData(refetched);
      setTenant(refetched);
      setTenantMsg({ type: 'success', text: `Forfait mis à jour vers ${plan.toUpperCase()} !` });
    } catch {
      setTenantMsg({ type: 'error', text: 'Impossible de changer le forfait.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Paramètres de l'Agence</h2>
          <p className="text-sm text-gray-500">Gérez vos accès équipe et votre forfait SaaS</p>
        </div>

        {/* Tab navigation */}
        <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'agents'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck size={15} /> Équipe & Rôles
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'subscription'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard size={15} /> Abonnement & Forfait
          </button>
        </div>
      </div>

      {/* ── TAB 1: Équipe & Rôles ── */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Add agent form */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <UserPlus size={16} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Ajouter un collaborateur</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Nom complet *" error={errors.name}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Prénom Nom"
                  className={cls(!!errors.name)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Email *" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="agent@immogest.tn"
                    className={cls(!!errors.email)}
                  />
                </Field>
                <Field label="Téléphone">
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="+216 xx xxx xxx"
                    className={cls()}
                  />
                </Field>
              </div>

              <Field label="Rôle">
                <select value={form.role} onChange={(e) => set('role', e.target.value as Role)} className={cls()}>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Code d'accès *" error={errors.accessCode}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.accessCode}
                    onChange={(e) => set('accessCode', e.target.value.toUpperCase())}
                    className={`${cls(!!errors.accessCode)} font-mono tracking-widest`}
                  />
                  <button
                    type="button"
                    onClick={() => set('accessCode', generateAccessCode())}
                    title="Générer un nouveau code"
                    className="flex-shrink-0 px-3 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Le collaborateur se connecte avec son email + ce code.</p>
              </Field>

              <button
                type="submit"
                className="w-full py-2.5 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E7FC4 100%)' }}
              >
                <UserPlus size={16} />
                Ajouter le collaborateur
              </button>
            </form>
          </Card>

          {/* Agents list */}
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <ShieldCheck size={16} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                Accès actifs <span className="text-gray-400 font-normal">({agents.length})</span>
              </h3>
            </div>

            {agents.length === 0 ? (
              <div className="text-center py-10">
                <KeyRound size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun agent ajouté pour l'instant.</p>
                <p className="text-xs text-gray-400">Utilisez le formulaire pour créer un accès.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {agents.map((agent) => (
                  <li
                    key={agent.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <Avatar initials={agent.initials} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">{agent.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {ROLE_LABELS[agent.role]} · {agent.email}
                      </div>
                    </div>
                    {agent.accessCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(agent)}
                        title="Copier le code d'accès"
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <span className="font-mono text-xs tracking-widest text-gray-700">{agent.accessCode}</span>
                        {copiedId === agent.id ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} className="text-gray-400" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(agent)}
                      title="Retirer l'agent"
                      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 2: Abonnement & Agence ── */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {tenantMsg && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
              tenantMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <AlertCircle size={16} />
              {tenantMsg.text}
            </div>
          )}

          {/* Agency Identity Card */}
          <Card padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Identité & Coordonnées Publiques</h3>
                <p className="text-xs text-gray-500">Ces coordonnées apparaissent sur vos biens publiés pour permettre aux clients de vous contacter directement.</p>
              </div>
            </div>

            <form onSubmit={handleSaveAgencyDetails} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom de l'agence *</label>
                  <input
                    type="text"
                    required
                    value={agencyNameInput}
                    onChange={(e) => setAgencyNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-blue-600" />
                    Téléphone de contact client
                  </label>
                  <input
                    type="tel"
                    placeholder="+216 71 123 456"
                    value={agencyPhoneInput}
                    onChange={(e) => setAgencyPhoneInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MessageCircle size={13} className="text-green-600" />
                    Numéro WhatsApp direct
                  </label>
                  <input
                    type="tel"
                    placeholder="+216 20 123 456"
                    value={agencyWhatsAppInput}
                    onChange={(e) => setAgencyWhatsAppInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-500" />
                    Adresse de l'agence
                  </label>
                  <input
                    type="text"
                    placeholder="Les Berges du Lac 2, Tunis"
                    value={agencyAddressInput}
                    onChange={(e) => setAgencyAddressInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingTenant}
                  className="py-2.5 px-6 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                  style={{ background: '#185FA5' }}
                >
                  <Save size={16} /> {savingTenant ? 'Enregistrement…' : 'Enregistrer les coordonnées'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">Identifiant Agence (Tenant ID)</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{tenantData?.id || 'default'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Slug Agence</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded text-blue-700">{tenantData?.slug || 'default'}.immogest.pro</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-1">Email propriétaire</span>
                <span className="font-medium text-gray-700">{tenantData?.ownerEmail || 'admin@immogest.pro'}</span>
              </div>
            </div>
          </Card>

          {/* Usage Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Biens enregistrés</span>
                <span className="text-xs font-bold text-blue-600">
                  {tenantData?.usage?.properties || 0} / {tenantData?.limits?.properties === Infinity ? '∞' : (tenantData?.limits?.properties || 100)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${Math.min(100, ((tenantData?.usage?.properties || 0) / (tenantData?.limits?.properties || 100)) * 100)}%` }}
                />
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Collaborateurs</span>
                <span className="text-xs font-bold text-purple-600">
                  {tenantData?.usage?.agents || agents.length} / {tenantData?.limits?.agents === Infinity ? '∞' : (tenantData?.limits?.agents || 10)}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${Math.min(100, (((tenantData?.usage?.agents || agents.length) / (tenantData?.limits?.agents || 10)) * 100))}%` }}
                />
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Stockage cloud</span>
                <span className="text-xs font-bold text-emerald-600">
                  {tenantData?.limits?.storage || '20 Go'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
              </div>
            </Card>
          </div>

          {/* Current Plan & Switcher */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Forfaits Disponibles</h3>
                <p className="text-xs text-gray-500">
                  Forfait actuel : <span className="font-bold text-blue-700 uppercase">{tenantData?.plan || 'pro'}</span>
                  {tenantData?.plan === 'trial' && ' (Essai gratuit actif)'}
                </p>
              </div>
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                Statut : {tenantData?.planStatus === 'active' ? 'Actif' : 'En attente'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  id: 'starter',
                  name: 'Starter',
                  price: '99 DT / mois',
                  limits: '15 biens • 2 agents • 1 Go',
                },
                {
                  id: 'pro',
                  name: 'Pro (Populaire)',
                  price: '199 DT / mois',
                  limits: '100 biens • 10 agents • 20 Go',
                },
                {
                  id: 'entreprise',
                  name: 'Entreprise',
                  price: '399 DT / mois',
                  limits: 'Biens & agents illimités • Support 24/7',
                },
              ].map((p) => {
                const isCurrent = (tenantData?.plan || 'pro') === p.id;
                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 text-sm">{p.name}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold">
                          Actuel
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-gray-800 mb-2">{p.price}</div>
                    <p className="text-xs text-gray-500 mb-4">{p.limits}</p>

                    <button
                      type="button"
                      disabled={isCurrent}
                      onClick={() => handlePlanChange(p.id as any)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-gray-200 text-gray-500 cursor-default'
                          : 'bg-white border border-blue-600 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      {isCurrent ? 'Forfait activé' : 'Choisir ce forfait'}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

function cls(hasError = false) {
  return [
    'w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-colors',
    hasError ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500',
  ].join(' ');
}

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
