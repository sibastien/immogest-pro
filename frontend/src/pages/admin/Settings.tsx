import React, { useState } from 'react';
import { UserPlus, Trash2, RefreshCw, Copy, Check, KeyRound, ShieldCheck } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import type { Agent, Role } from '../../types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'agent_terrain', label: 'Agent terrain' },
  { value: 'agent_bureau', label: 'Agent bureau' },
  { value: 'coordinatrice', label: 'Coordinatrice' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'client', label: 'Client' },
];

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrateur',
  coordinatrice: 'Coordinatrice',
  agent_bureau: 'Agent bureau',
  agent_terrain: 'Agent terrain',
  client: 'Client',
};

// 6-char access code, no ambiguous characters (0/O, 1/I).
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

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Paramètres</h2>
        <p className="text-sm text-gray-500">Gérez les accès de votre équipe</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Add agent form */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
              <UserPlus size={16} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Ajouter un agent</h3>
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
              <p className="text-xs text-gray-400 mt-1">L'agent se connecte avec son email + ce code.</p>
            </Field>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Ajouter l'agent
            </button>
          </form>
        </Card>

        {/* Agents list */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-light flex items-center justify-center">
              <ShieldCheck size={16} className="text-purple" />
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
                        <Check size={13} className="text-success" />
                      ) : (
                        <Copy size={13} className="text-gray-400" />
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(agent)}
                    title="Retirer l'agent"
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-danger-light hover:text-danger transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
};

function cls(hasError = false) {
  return [
    'w-full px-3 py-2 border rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 transition-colors',
    hasError ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-gray-200 focus:ring-primary/30 focus:border-primary',
  ].join(' ');
}

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-danger mt-1">{error}</p>}
  </div>
);
