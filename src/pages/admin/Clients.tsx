import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Phone, Mail, X, ChevronRight, AlertTriangle, Users } from 'lucide-react';
import { useClientsStore } from '../../store/clientsStore';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Drawer } from '../../components/ui/Drawer';
import { PhoneReveal } from '../../components/shared/PhoneReveal';
import { ClientForm } from './ClientForm';
import { useAgentsStore } from '../../store/agentsStore';
import type { Client } from '../../types';

const TYPE_LABELS: Record<Client['type'], string> = {
  acheteur: 'Acheteur',
  locataire: 'Locataire',
  proprietaire: 'Propriétaire',
};

const SOURCE_LABELS: Record<Client['source'], string> = {
  appel: 'Appel', web: 'Web', email: 'Email',
  passage: 'Passage', recommandation: 'Recommandation',
  facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', mubawab: 'Mubawab',
};

const STATUS_BADGE: Record<Client['status'], 'actif' | 'a_relancer' | 'compromis' | 'cloture'> = {
  actif: 'actif',
  a_relancer: 'a_relancer',
  compromis: 'compromis',
  cloture: 'cloture',
};

export const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const { clients }  = useClientsStore();
  const { agents }   = useAgentsStore();
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState<Client['status'] | ''>('');
  const [typeFilter,   setTypeFilter]   = useState<Client['type']   | ''>('');
  const [selected,     setSelected]     = useState<Client | null>(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);

  const filtered = clients.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (typeFilter   && c.type   !== typeFilter)   return false;
    if (search) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.phone.includes(q) ||
             (c.email?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const stats = {
    actif:      clients.filter((c) => c.status === 'actif').length,
    a_relancer: clients.filter((c) => c.status === 'a_relancer').length,
    compromis:  clients.filter((c) => c.status === 'compromis').length,
    cloture:    clients.filter((c) => c.status === 'cloture').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-400">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={16} />
          Nouveau client
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            !statusFilter ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'].join(' ')}
        >
          Tous ({clients.length})
        </button>
        {([
          ['actif', 'Actifs'],
          ['a_relancer', 'À relancer'],
          ['compromis', 'Compromis'],
          ['cloture', 'Clôturés'],
        ] as [Client['status'], string][]).map(([s, l]) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
            className={['px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1',
              statusFilter === s ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'].join(' ')}
          >
            {s === 'a_relancer' && <AlertTriangle size={11} className={statusFilter !== s ? 'text-warning' : ''} />}
            {l} ({stats[s]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, téléphone, email…"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as Client['type'] | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous types</option>
          {(Object.entries(TYPE_LABELS) as [Client['type'], string][]).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Two-panel layout when a client is selected */}
      <div className={['grid gap-5', selected ? 'grid-cols-5' : 'grid-cols-1'].join(' ')}>
        {/* Client table */}
        <div className={selected ? 'col-span-3' : 'col-span-1'}>
          <Card padding="none">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-gray-400">
                <Users size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Aucun client ne correspond à vos filtres</p>
              </div>
            ) : (
              filtered.map((client) => {
                const initials = client.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                const isSelected = selected?.id === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/admin/clients/${client.id}`)}
                    className={[
                      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0',
                      isSelected ? 'bg-primary-light' : 'hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <Avatar initials={initials} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={['text-sm font-medium truncate', isSelected ? 'text-primary' : 'text-gray-900'].join(' ')}>
                          {client.name}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{TYPE_LABELS[client.type]}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Phone size={11} />{client.phone}</span>
                        {client.email && (
                          <span className="flex items-center gap-1 hidden sm:flex"><Mail size={11} />{client.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-300 hidden lg:block">{SOURCE_LABELS[client.source]}</span>
                      <Badge variant={STATUS_BADGE[client.status]} size="sm" />
                      <ChevronRight size={13} className={isSelected ? 'text-primary' : 'text-gray-300'} />
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>

        {/* Client detail panel */}
        {selected && (
          <div className="col-span-2">
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={selected.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                    size="lg"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{selected.name}</div>
                    <div className="text-xs text-gray-400">{TYPE_LABELS[selected.type]}</div>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500">
                  <X size={16} />
                </button>
              </div>

              <div className="mb-3">
                <Badge variant={STATUS_BADGE[selected.status]} />
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="flex-shrink-0 text-gray-400" />
                  <span className="select-all">{selected.phone}</span>
                </div>
                {selected.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="flex-shrink-0 text-gray-400" />
                    <a href={`mailto:${selected.email}`} className="hover:text-primary truncate">{selected.email}</a>
                  </div>
                )}

                {selected.budget && (
                  <div className="pt-2 pb-1 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-1">Budget</div>
                    <div className="text-sm text-gray-800">
                      {selected.budget.min.toLocaleString('fr-TN')} — {selected.budget.max.toLocaleString('fr-TN')} DT
                    </div>
                  </div>
                )}

                {selected.search && (
                  <div className="pt-2 pb-1 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-1">Recherche</div>
                    <div className="text-xs text-gray-600 leading-5">{selected.search}</div>
                  </div>
                )}

                {selected.notes && (
                  <div className="pt-2 pb-1 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-1">Notes</div>
                    <div className="text-xs text-gray-600 leading-5">{selected.notes}</div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>
                    <span className="font-medium">Source :</span> {SOURCE_LABELS[selected.source]}
                  </div>
                  <div>
                    <span className="font-medium">Dernier contact :</span>{' '}
                    {new Date(selected.lastContact).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                  <div>
                    <span className="font-medium">Agent :</span>{' '}
                    {agents.find((a) => a.id === selected.agentId)?.name ?? '—'}
                  </div>
                  <div>
                    <span className="font-medium">Créé le :</span>{' '}
                    {new Date(selected.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                <PhoneReveal
                  phone={selected.phone}
                  name={selected.name}
                  className="flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Phone size={13} />
                  Appeler
                </PhoneReveal>
                <button className="flex items-center justify-center gap-1.5 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
                  <Mail size={13} />
                  Envoyer email
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Drawer — Nouveau client */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Nouveau client"
        subtitle="Renseignez les informations du nouveau contact"
        width="lg"
      >
        <ClientForm
          onSuccess={() => setDrawerOpen(false)}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </div>
  );
};
