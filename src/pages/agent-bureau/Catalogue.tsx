import React, { useState } from 'react';
import { Search, MapPin, Maximize2, BedDouble, Phone, Share2, X } from 'lucide-react';
import { usePropertiesStore } from '../../store/propertiesStore';
import { Badge } from '../../components/ui/Badge';
import type { PropertyType } from '../../types';

const TYPE_LABELS: Record<PropertyType, string> = {
  villa:       'Villa',
  appartement: 'Appartement',
  maison:      'Maison',
  commercial:  'Local commercial',
};

const STATUS_VARIANT = {
  disponible:    'disponible' as const,
  sous_compromis: 'sous_compromis' as const,
  loue:          'loue' as const,
  vendu:         'vendu' as const,
};

export const AgentBureauCatalogue: React.FC = () => {
  const { properties } = usePropertiesStore();
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [selected, setSelected]     = useState<string | null>(null);

  const filtered = properties.filter((p) => {
    if (p.status === 'vendu') return false; // hide sold
    if (typeFilter && p.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedProp = selected ? properties.find((p) => p.id === selected) : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Catalogue des biens</h2>
        <p className="text-sm text-gray-400">{filtered.length} bien{filtered.length !== 1 ? 's' : ''} disponibles</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Réf., titre, quartier…"
            className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as PropertyType | '')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Two-panel layout */}
      <div className={`flex gap-4 ${selectedProp ? '' : ''}`}>
        {/* List */}
        <div className={`space-y-2 ${selectedProp ? 'w-80 flex-shrink-0' : 'flex-1'}`}>
          {filtered.map((p) => {
            const isSelected = selected === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelected(isSelected ? null : p.id)}
                className={[
                  'bg-white rounded-xl border p-3 cursor-pointer transition-all',
                  isSelected ? 'border-primary bg-primary-light shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  {/* Photo thumbnail */}
                  {p.photos && p.photos.length > 0 ? (
                    <div className="w-16 h-14 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
                      <img src={p.photos[0]} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-mono">{p.ref}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold leading-4 ${isSelected ? 'text-primary' : 'text-gray-900'}`}>{p.title}</span>
                      <Badge variant={STATUS_VARIANT[p.status]} size="sm" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <MapPin size={10} /> {p.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Maximize2 size={10} />{p.surface}m²</span>
                      {p.rooms && <span className="flex items-center gap-1"><BedDouble size={10} />{p.rooms}</span>}
                      <span className="ml-auto font-bold text-gray-900 text-xs">
                        {new Intl.NumberFormat('fr-TN').format(p.price)} DT{p.priceType === 'mois' ? '/m' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selectedProp && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-5 self-start sticky top-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{selectedProp.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                  <MapPin size={11} /> {selectedProp.location}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Badge variant={STATUS_VARIANT[selectedProp.status]} />
                <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50">
                  <X size={13} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Photo */}
            {selectedProp.photos && selectedProp.photos.length > 0 ? (
              <div className="h-32 rounded-xl mb-4 overflow-hidden bg-gray-100">
                <img src={selectedProp.photos[0]} alt={selectedProp.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-mono">{selectedProp.ref}</span>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <StatBox label="Surface" value={`${selectedProp.surface} m²`} />
              {selectedProp.rooms && <StatBox label="Pièces" value={selectedProp.rooms.toString()} />}
              {selectedProp.bathrooms && <StatBox label="SDB" value={selectedProp.bathrooms.toString()} />}
            </div>

            {/* Price */}
            <div className="bg-primary-light rounded-xl p-3 mb-4">
              <div className="text-xs text-primary mb-0.5">Prix</div>
              <div className="text-lg font-bold text-primary">
                {new Intl.NumberFormat('fr-TN').format(selectedProp.price)} DT
                {selectedProp.priceType === 'mois' && <span className="text-sm font-normal">/mois</span>}
              </div>
            </div>

            {/* Description */}
            {selectedProp.description && (
              <p className="text-xs text-gray-600 leading-5 mb-4">{selectedProp.description}</p>
            )}

            {/* Features */}
            {selectedProp.features && selectedProp.features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedProp.features.map((f) => (
                  <span key={f} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{f}</span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors">
                <Phone size={12} /> Proposer au client
              </button>
              <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={14} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-2 text-center">
    <div className="text-sm font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-400">{label}</div>
  </div>
);
