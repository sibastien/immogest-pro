import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, LayoutGrid, List, X, MapPin, Maximize2,
  BedDouble, Bath, Building2,
} from 'lucide-react';
import { usePropertiesStore } from '../../store/propertiesStore';
import { PropertyCard } from '../../components/shared/PropertyCard';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Drawer } from '../../components/ui/Drawer';
import { PropertyForm } from './PropertyForm';
import { useAgentsStore } from '../../store/agentsStore';
import type { PropertyType, PropertyStatus } from '../../types';

const TYPE_LABELS: Record<PropertyType, string> = {
  villa: 'Villa',
  appartement: 'Appartement',
  maison: 'Maison',
  commercial: 'Local commercial',
};

const STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: 'Disponible',
  sous_compromis: 'Sous compromis',
  loue: 'Loué',
  vendu: 'Vendu',
};

const STATUS_BADGE_VARIANT: Record<PropertyStatus, 'disponible' | 'sous_compromis' | 'loue' | 'vendu'> = {
  disponible: 'disponible',
  sous_compromis: 'sous_compromis',
  loue: 'loue',
  vendu: 'vendu',
};

function formatPrice(price: number, priceType: 'vente' | 'mois'): string {
  return `${new Intl.NumberFormat('fr-TN').format(price)} DT${priceType === 'mois' ? '/mois' : ''}`;
}

export const AdminProperties: React.FC = () => {
  const navigate = useNavigate();
  const { properties, filters, setFilters, resetFilters } = usePropertiesStore();
  const { agents } = useAgentsStore();

  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = properties.filter((p) => {
    if (filters.type   && p.type   !== filters.type)   return false;
    if (filters.status && p.status !== filters.status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const hasFilters = !!filters.type || !!filters.status || !!search;

  const counts: Record<PropertyStatus, number> = {
    disponible:     properties.filter((p) => p.status === 'disponible').length,
    sous_compromis: properties.filter((p) => p.status === 'sous_compromis').length,
    loue:           properties.filter((p) => p.status === 'loue').length,
    vendu:          properties.filter((p) => p.status === 'vendu').length,
  };

  const handleCardClick = (id: string) => navigate(`/admin/biens/${id}`);

  const handleFormSuccess = (id: string) => {
    setDrawerOpen(false);
    navigate(`/admin/biens/${id}`);
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Biens immobiliers</h2>
            <p className="text-sm text-gray-400">
              {filtered.length} bien{filtered.length !== 1 ? 's' : ''}
              {hasFilters ? ' — filtrés' : ' dans le portefeuille'}
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Ajouter un bien
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setFilters({ status: undefined })}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              !filters.status ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
            ].join(' ')}
          >
            Tous ({properties.length})
          </button>
          {(Object.entries(STATUS_LABELS) as [PropertyStatus, string][]).map(([s, l]) => (
            <button
              key={s}
              onClick={() => setFilters({ status: s === filters.status ? undefined : s })}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                filters.status === s ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100',
              ].join(' ')}
            >
              {l} ({counts[s]})
            </button>
          ))}
        </div>

        {/* Filters bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Référence, titre, quartier…"
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <select
            value={filters.type ?? ''}
            onChange={(e) => setFilters({ type: (e.target.value as PropertyType) || undefined })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Tous types</option>
            {(Object.entries(TYPE_LABELS) as [PropertyType, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>

          {hasFilters && (
            <button
              onClick={() => { resetFilters(); setSearch(''); }}
              className="flex items-center gap-1 text-xs text-danger hover:underline"
            >
              <X size={12} /> Réinitialiser
            </button>
          )}

          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={['p-1.5 rounded-md transition-colors', viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'].join(' ')}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={['p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'].join(' ')}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((p) => (
              <PropertyCard key={p.id} property={p} onClick={() => handleCardClick(p.id)} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 flex flex-col items-center py-20 text-gray-400">
                <Building2 size={36} className="mb-3 opacity-30" />
                <p>Aucun bien ne correspond à vos filtres</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-xs text-gray-500">
                  <th className="text-left px-4 py-2.5 font-medium">Référence</th>
                  <th className="text-left px-4 py-2.5 font-medium">Bien</th>
                  <th className="text-left px-4 py-2.5 font-medium">Localisation</th>
                  <th className="text-right px-4 py-2.5 font-medium">Caractéristiques</th>
                  <th className="text-right px-4 py-2.5 font-medium">Prix</th>
                  <th className="text-left px-4 py-2.5 font-medium">Statut</th>
                  <th className="text-left px-4 py-2.5 font-medium">Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const agent = agents.find((a) => a.id === p.agentId);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleCardClick(p.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.ref}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {p.photos && p.photos.length > 0 ? (
                            <img src={p.photos[0]} alt="" className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-gray-100" />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 size={16} className="text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium text-gray-800 text-xs truncate max-w-[160px]">{p.title}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{p.transaction === 'location' ? 'Location' : 'Vente'} · {TYPE_LABELS[p.type] ?? 'Autre'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin size={11} /> {p.location}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><Maximize2 size={11} />{p.surface} m²</span>
                          {p.rooms && <span className="flex items-center gap-1"><BedDouble size={11} />{p.rooms}</span>}
                          {p.bathrooms && <span className="flex items-center gap-1"><Bath size={11} />{p.bathrooms}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-gray-900">
                        {formatPrice(p.price, p.priceType)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_BADGE_VARIANT[p.status]} size="sm" dot />
                      </td>
                      <td className="px-4 py-3">
                        {agent && (
                          <div className="flex items-center gap-1.5">
                            <Avatar initials={agent.initials} size="xs" />
                            <span className="text-xs text-gray-600">{agent.name.split(' ')[0]}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                      Aucun bien ne correspond à vos filtres
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer — Nouveau bien */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Ajouter un bien"
        subtitle="Renseignez les informations du nouveau bien immobilier"
        width="xl"
      >
        <PropertyForm
          onSuccess={handleFormSuccess}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>
    </>
  );
};
