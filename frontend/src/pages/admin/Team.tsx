import React, { useState } from 'react';
import { useAgentsStore } from '../../store/agentsStore';
import { AgentCard } from '../../components/shared/AgentCard';
import { StatCard } from '../../components/ui/StatCard';
import { Users, Eye, TrendingUp, Award, UserPlus, X, Trash2, Loader2 } from 'lucide-react';
import type { Agent, Role } from '../../types';

// ── Invite modal ──────────────────────────────────────────────────────────────
interface InviteModalProps {
  onClose: () => void;
  onSave: (agent: Agent) => void;
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'agent_terrain', label: 'Agent terrain' },
  { value: 'agent_bureau', label: 'Agent bureau' },
  { value: 'coordinatrice', label: 'Coordinatrice' },
];

const InviteModal: React.FC<InviteModalProps> = ({ onClose, onSave }) => {
  const { addAgent } = useAgentsStore();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'agent_terrain' as Role,
    accessCode: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.accessCode) {
      setError('Nom, email et code d\'accès sont requis.');
      return;
    }
    setSaving(true);
    try {
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        initials: form.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
        name: form.name.trim(),
        role: form.role,
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        status: 'hors_ligne',
        accessCode: form.accessCode,
        stats: { activeProperties: 0, visitsThisMonth: 0, transactions: 0, commission: 0 },
      };
      addAgent(newAgent);
      onSave(newAgent);
      onClose();
    } catch {
      setError('Erreur lors de la création. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Inviter un membre</h3>
            <p className="text-xs text-gray-400 mt-0.5">Créer un accès pour un nouvel agent ou coordinatrice</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom complet *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Ex : Sami Trabelsi"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="sami@agence.tn"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+216 XX XXX XXX"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Rôle *</label>
              <select
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Code d'accès / mot de passe *
              </label>
              <input
                type="text"
                value={form.accessCode}
                onChange={(e) => set('accessCode', e.target.value)}
                placeholder="Provisoire — à changer à la première connexion"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Ce code sera transmis à la personne pour sa première connexion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {saving ? 'Création…' : 'Créer l\'accès'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete confirmation dialog ─────────────────────────────────────────────────
interface DeleteDialogProps {
  agent: Agent;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({ agent, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Trash2 size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 text-center">Supprimer le compte ?</h3>
      <p className="text-sm text-gray-500 text-center mt-1 mb-5">
        Le compte de <span className="font-semibold text-gray-800">{agent.name}</span> sera définitivement supprimé.
        Cette action est irréversible.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
);

// ── Agent row with delete button ───────────────────────────────────────────────
interface AgentRowProps {
  agent: Agent;
  onDelete: (agent: Agent) => void;
}

const AgentRow: React.FC<AgentRowProps> = ({ agent, onDelete }) => (
  <div className="relative group">
    <AgentCard agent={agent} />
    <button
      onClick={() => onDelete(agent)}
      title="Supprimer ce compte"
      className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
    >
      <Trash2 size={14} />
    </button>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────────
export const AdminTeam: React.FC = () => {
  const { agents, removeAgent } = useAgentsStore();
  const [showInvite, setShowInvite] = useState(false);
  const [toDelete, setToDelete] = useState<Agent | null>(null);

  const totalVisits = agents.reduce((sum, a) => sum + a.stats.visitsThisMonth, 0);
  const totalCommission = agents.reduce((sum, a) => sum + a.stats.commission, 0);
  const totalTransactions = agents.reduce((sum, a) => sum + a.stats.transactions, 0);
  const activeAgents = agents.filter((a) => a.status !== 'hors_ligne').length;

  const terrain = agents.filter((a) => a.role === 'agent_terrain');
  const bureau = agents.filter((a) => a.role === 'agent_bureau');
  const coordinatrices = agents.filter((a) => a.role === 'coordinatrice');

  const handleDelete = (agent: Agent) => setToDelete(agent);
  const confirmDelete = () => {
    if (toDelete) {
      removeAgent(toDelete.id);
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Équipe</h2>
          <p className="text-sm text-gray-500">{agents.length} membres · {activeAgents} connectés</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserPlus size={15} />
          Inviter un membre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Agents actifs" value={activeAgents} icon={Users} color="blue" />
        <StatCard label="Visites ce mois" value={totalVisits} icon={Eye} color="purple" />
        <StatCard label="Transactions" value={totalTransactions} icon={TrendingUp} color="green" />
        <StatCard
          label="Commissions totales"
          value={`${(totalCommission / 1000).toFixed(1)}K DT`}
          icon={Award}
          color="amber"
        />
      </div>

      {/* Empty state */}
      {agents.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3">
            <Users size={24} className="text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">Aucun membre dans l'équipe</p>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">Invitez votre premier agent pour commencer</p>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            <UserPlus size={14} /> Inviter un membre
          </button>
        </div>
      )}

      {/* Agent lists */}
      <div className="grid grid-cols-2 gap-6">
        {/* Agents terrain */}
        {terrain.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Agents terrain ({terrain.length})
            </h3>
            <div className="space-y-3">
              {terrain.map((agent) => (
                <AgentRow key={agent.id} agent={agent} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* Agents bureau */}
        {bureau.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Agents bureau ({bureau.length})
            </h3>
            <div className="space-y-3">
              {bureau.map((agent) => (
                <AgentRow key={agent.id} agent={agent} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}

        {/* Coordinatrices */}
        {coordinatrices.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Coordinatrices ({coordinatrices.length})
            </h3>
            <div className="space-y-3">
              {coordinatrices.map((agent) => (
                <AgentRow key={agent.id} agent={agent} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onSave={() => {}}
        />
      )}
      {toDelete && (
        <DeleteDialog
          agent={toDelete}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
};
