import React, { useState } from 'react';
import { Search, Banknote, TrendingUp, ArrowUpRight, Filter, X, Plus, CheckCircle2 } from 'lucide-react';
import { useAgentsStore } from '../../store/agentsStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { useAuthStore } from '../../store/authStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import type { Transaction } from '../../types';

type Stage = Transaction['stage'];

const STAGE_LABELS: Record<Stage, string> = {
  prospection: 'Prospection',
  visite:      'Visite',
  offre:       'Offre',
  compromis:   'Compromis',
  acte:        'Acte',
  cloture:     'Clôturée',
};

const STAGE_VARIANT: Record<Stage, 'gray' | 'info' | 'a_relancer' | 'sous_compromis' | 'disponible' | 'vendu'> = {
  prospection: 'gray',
  visite:      'info',
  offre:       'a_relancer',
  compromis:   'sous_compromis',
  acte:        'disponible',
  cloture:     'vendu',
};

const TYPE_LABEL: Record<string, string> = {
  vente_residentielle:    'Vente rés.',
  location_residentielle: 'Location',
  commercial:             'Commercial',
  terrain:                'Terrain',
};

export const AdminTransactions: React.FC = () => {
  const { transactions, agents, addTransaction, closeTransaction } = useAgentsStore();
  const { properties }           = usePropertiesStore();
  const { clients }              = useClientsStore();
  const { user }                 = useAuthStore();

  const [search, setSearch]       = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | ''>('');

  // New-deal form
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ propertyId: '', clientId: '', agentId: '', amount: 0, commission: 0, stage: 'prospection' as Stage });
  const [formError, setFormError] = useState('');

  const openForm = () => {
    setForm({ propertyId: '', clientId: '', agentId: user?.agentId ?? '', amount: 0, commission: 0, stage: 'prospection' });
    setFormError('');
    setOpen(true);
  };

  const handleCreate = () => {
    if (!form.propertyId) { setFormError('Sélectionnez un bien.'); return; }
    if (!form.clientId) { setFormError('Sélectionnez un client.'); return; }
    const prop = properties.find((p) => p.id === form.propertyId);
    const now = new Date().toISOString();
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      ref: `TX-${String(Date.now()).slice(-5)}`,
      propertyId: form.propertyId,
      clientId: form.clientId,
      agentId: form.agentId || prop?.agentId || (user?.agentId ?? ''),
      type: prop?.type ?? 'vente_residentielle',
      amount: Number(form.amount) || (prop?.price ?? 0),
      commission: Number(form.commission) || 0,
      stage: form.stage,
      createdAt: now,
      updatedAt: now,
    };
    addTransaction(tx);
    setOpen(false);
  };

  const handleClose = (tx: Transaction) => {
    const prop = properties.find((p) => p.id === tx.propertyId);
    const isRental = tx.type === 'location_residentielle';
    if (window.confirm(`Clôturer cette transaction ?\nLe bien « ${prop?.title ?? ''} » sera marqué comme ${isRental ? 'loué' : 'vendu'} et le client comme clôturé.`)) {
      closeTransaction(tx.id);
    }
  };

  const filtered = transactions.filter((tx) => {
    if (stageFilter && tx.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const prop = properties.find((p) => p.id === tx.propertyId);
      const cli  = clients.find((c) => c.id === tx.clientId);
      return tx.ref.toLowerCase().includes(q)
        || prop?.title.toLowerCase().includes(q)
        || cli?.name.toLowerCase().includes(q);
    }
    return true;
  });

  const totalCA       = transactions.reduce((s, t) => s + t.amount, 0);
  const totalComm     = transactions.reduce((s, t) => s + t.commission, 0);
  const clôturées     = transactions.filter((t) => t.stage === 'cloture').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
          <p className="text-sm text-gray-400">{transactions.length} dossiers au total</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> Nouvelle transaction
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Banknote size={14} className="text-primary" /><span className="text-xs text-gray-500">CA Total</span></div>
          <div className="text-xl font-bold text-gray-900">{new Intl.NumberFormat('fr-TN').format(totalCA)} DT</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={14} className="text-success" /><span className="text-xs text-gray-500">Commissions</span></div>
          <div className="text-xl font-bold text-success">{new Intl.NumberFormat('fr-TN').format(totalComm)} DT</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><ArrowUpRight size={14} className="text-purple" /><span className="text-xs text-gray-500">Clôturées</span></div>
          <div className="text-xl font-bold text-purple">{clôturées}</div>
        </div>
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
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-gray-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | '')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Tous les stades</option>
            {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {(search || stageFilter) && (
          <button onClick={() => { setSearch(''); setStageFilter(''); }} className="flex items-center gap-1 text-xs text-danger hover:underline">
            <X size={12} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-xs text-gray-500">
              <th className="text-left px-4 py-3 font-medium">Réf.</th>
              <th className="text-left px-4 py-3 font-medium">Bien</th>
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Agent</th>
              <th className="text-right px-4 py-3 font-medium">Montant</th>
              <th className="text-right px-4 py-3 font-medium">Commission</th>
              <th className="text-left px-4 py-3 font-medium">Stade</th>
              <th className="text-left px-4 py-3 font-medium">Mis à jour</th>
              <th className="text-right px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((tx) => {
              const property = properties.find((p) => p.id === tx.propertyId);
              const client   = clients.find((c) => c.id === tx.clientId);
              const agent    = agents.find((a) => a.id === tx.agentId);
              return (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{tx.ref}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-gray-800 max-w-[160px] truncate">{property?.title ?? '—'}</div>
                    <div className="text-xs text-gray-400">{TYPE_LABEL[tx.type] ?? tx.type}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{client?.name ?? '—'}</div>
                    <div className="text-xs text-gray-400">{client?.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {agent && (
                      <div className="flex items-center gap-1.5">
                        <Avatar initials={agent.initials} size="xs" />
                        <span className="text-xs text-gray-600">{agent.name.split(' ')[0]}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-bold text-gray-900">
                    {new Intl.NumberFormat('fr-TN').format(tx.amount)} DT
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-semibold text-success">
                    {new Intl.NumberFormat('fr-TN').format(tx.commission)} DT
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STAGE_VARIANT[tx.stage]} size="sm" label={STAGE_LABELS[tx.stage]} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(tx.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {tx.stage === 'cloture' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 size={13} /> Clôturée
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClose(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-success/40 text-success rounded-lg text-xs font-medium hover:bg-success-light transition-colors"
                      >
                        <CheckCircle2 size={12} /> {tx.type === 'location_residentielle' ? 'Marquer loué' : 'Marquer vendu'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">Aucune transaction ne correspond</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New-deal modal */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Nouvelle transaction</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Bien *</label>
                <select
                  value={form.propertyId}
                  onChange={(e) => {
                    const prop = properties.find((p) => p.id === e.target.value);
                    setForm((f) => ({ ...f, propertyId: e.target.value, amount: prop?.price ?? f.amount, agentId: f.agentId || (prop?.agentId ?? '') }));
                    setFormError('');
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Choisir —</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.ref} · {p.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Client *</label>
                <select value={form.clientId} onChange={(e) => { setForm((f) => ({ ...f, clientId: e.target.value })); setFormError(''); }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Choisir —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Agent</label>
                <select value={form.agentId} onChange={(e) => setForm((f) => ({ ...f, agentId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Choisir —</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Montant (DT)</label>
                  <input type="number" value={form.amount || ''} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Commission (DT)</label>
                  <input type="number" value={form.commission || ''} onChange={(e) => setForm((f) => ({ ...f, commission: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Stade initial</label>
                <select value={form.stage} onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as Stage }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {formError && <p className="text-xs text-danger">{formError}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={handleCreate} className="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">
                  Créer la transaction
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
