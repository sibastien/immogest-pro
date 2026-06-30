import React, { useState } from 'react';
import { Phone, Mail, Clock, UserPlus, Search, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientsStore } from '../../store/clientsStore';
import { useAgentsStore } from '../../store/agentsStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Drawer } from '../../components/ui/Drawer';
import { PhoneReveal } from '../../components/shared/PhoneReveal';
import type { Client } from '../../types';

const TYPE_LABELS = { acheteur: 'Acheteur', locataire: 'Locataire', proprietaire: 'Propriétaire' };

const SOURCE_LABELS: Record<Client['source'], string> = {
  appel: 'Appel', web: 'Web', email: 'Email', passage: 'Passage', recommandation: 'Recommandation',
  facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', mubawab: 'Mubawab',
};

const STATUS_BADGE: Record<Client['status'], 'actif' | 'a_relancer' | 'compromis' | 'cloture'> = {
  actif: 'actif', a_relancer: 'a_relancer', compromis: 'compromis', cloture: 'cloture',
};

export const AgentBureauProspects: React.FC = () => {
  const navigate = useNavigate();
  const { clients, updateClient } = useClientsStore();
  const { agents } = useAgentsStore();
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'a_relancer' | 'actif'>('a_relancer');
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter((c) => {
    if (c.status !== statusTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  }).sort((a, b) => b.lastContact.localeCompare(a.lastContact));

  const relance = clients.filter((c) => c.status === 'a_relancer').length;
  const actifs  = clients.filter((c) => c.status === 'actif').length;

  const daysSince = (date: string) => {
    const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    return d;
  };

  const handleRelance = (id: string) => {
    updateClient(id, { lastContact: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Prospects & Relances</h2>
          <p className="text-sm text-gray-400">{relance} à relancer en priorité</p>
        </div>
        <button
          onClick={() => navigate('/agent-bureau/nouvelle-fiche')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={15} /> Nouveau prospect
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setStatusTab('a_relancer')}
          className={['flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2',
            statusTab === 'a_relancer' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'].join(' ')}
        >
          À relancer
          {relance > 0 && <span className="bg-danger text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{relance}</span>}
        </button>
        <button
          onClick={() => setStatusTab('actif')}
          className={['flex-1 py-2 text-xs font-medium rounded-lg transition-colors',
            statusTab === 'actif' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'].join(' ')}
        >
          Actifs ({actifs})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, téléphone…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((client) => {
          const agent = agents.find((a) => a.id === client.agentId);
          const days  = daysSince(client.lastContact);
          const urgent = days >= 7;
          return (
            <Card key={client.id} padding="none">
              <div
                onClick={() => setSelected(client)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors rounded-xl"
              >
                <Avatar
                  initials={client.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{client.name}</span>
                    <span className="text-xs text-gray-400">{TYPE_LABELS[client.type]}</span>
                    {urgent && <Badge variant="urgent" size="sm" label={`${days}j`} dot />}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-1">
                    <span className="font-mono">{client.phone}</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {days === 0 ? 'Aujourd\'hui' : `Il y a ${days}j`}</span>
                  </div>
                  {client.budget && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Banknote size={11} className="text-gray-400" />
                      {new Intl.NumberFormat('fr-TN').format(client.budget.min)} — {new Intl.NumberFormat('fr-TN').format(client.budget.max)} DT
                    </div>
                  )}
                  {client.search && (
                    <div className="text-xs text-gray-400 italic mt-0.5 truncate">{client.search}</div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <PhoneReveal
                      phone={client.phone}
                      name={client.name}
                      className="w-8 h-8 flex items-center justify-center bg-primary rounded-lg"
                    >
                      <Phone size={14} className="text-white" />
                    </PhoneReveal>
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <Mail size={14} className="text-gray-500" />
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRelance(client.id); }}
                      className="px-2.5 py-1.5 bg-success text-white text-xs rounded-lg font-medium"
                    >
                      Relancé
                    </button>
                  </div>
                  {agent && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Avatar initials={agent.initials} size="xs" />
                      {agent.name.split(' ')[0]}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <UserPlus size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun prospect dans cet onglet</p>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Fiche prospect"
        subtitle={selected?.name}
        width="md"
      >
        {selected && (
          <div className="space-y-5">
            {/* Identity */}
            <div className="flex items-center gap-3">
              <Avatar
                initials={selected.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                size="lg"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
                <div className="text-xs text-gray-400">{TYPE_LABELS[selected.type]}</div>
              </div>
              <div className="ml-auto"><Badge variant={STATUS_BADGE[selected.status]} /></div>
            </div>

            {/* Quick contact */}
            <div className="flex gap-2">
              <PhoneReveal
                phone={selected.phone}
                name={selected.name}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Phone size={13} /> Appeler
              </PhoneReveal>
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail size={13} /> Email
                </a>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Row label="Téléphone" value={selected.phone} mono />
              {selected.email && <Row label="Email" value={selected.email} />}
              {selected.budget && (
                <Row label="Budget" value={`${selected.budget.min.toLocaleString('fr-TN')} — ${selected.budget.max.toLocaleString('fr-TN')} DT`} />
              )}
              <Row label="Source" value={SOURCE_LABELS[selected.source]} />
              <Row label="Agent référent" value={agents.find((a) => a.id === selected.agentId)?.name ?? '—'} />
              <Row label="Dernier contact" value={new Date(selected.lastContact).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
              <Row label="Créé le" value={new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
            </div>

            {selected.search && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Recherche</div>
                <div className="text-xs text-gray-600 leading-5 bg-gray-50 rounded-lg p-2.5">{selected.search}</div>
              </div>
            )}
            {selected.notes && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Notes</div>
                <div className="text-xs text-gray-600 leading-5 bg-gray-50 rounded-lg p-2.5">{selected.notes}</div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => { handleRelance(selected.id); setSelected(null); }}
                className="w-full py-2.5 bg-success text-white text-sm font-medium rounded-lg hover:bg-success/90 transition-colors"
              >
                Marquer comme relancé
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <span className="text-xs text-gray-400">{label}</span>
    <span className={['text-gray-800 text-right', mono ? 'font-mono text-xs' : 'text-xs'].join(' ')}>{value}</span>
  </div>
);
