import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from './LangContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { PropertyCard } from './PropertyCard';
import { fetchPublicProperties } from './api';
import type { Property, PropertyType, TransactionType } from '../types';
import { SlidersHorizontal, X, Search, Building2 } from 'lucide-react';

const TYPES: { value: PropertyType; labelKey: string }[] = [
  { value: 'villa', labelKey: 'type_villa' },
  { value: 'appartement', labelKey: 'type_appartement' },
  { value: 'maison', labelKey: 'type_maison' },
  { value: 'commercial', labelKey: 'type_commercial' },
  { value: 'terrain', labelKey: 'type_terrain' },
];

export const PublicListings: React.FC = () => {
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state — read initial values from URL
  const [transaction, setTransaction] = useState<TransactionType | ''>( (searchParams.get('t') as TransactionType) || '');
  const [type, setType] = useState<PropertyType | ''>((searchParams.get('type') as PropertyType) || '');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minP') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxP') || '');
  const [minRooms, setMinRooms] = useState(searchParams.get('rooms') || '');

  useEffect(() => {
    fetchPublicProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  // Sync filter state → URL
  useEffect(() => {
    const p: Record<string, string> = {};
    if (transaction) p.t = transaction;
    if (type) p.type = type;
    if (query) p.q = query;
    if (minPrice) p.minP = minPrice;
    if (maxPrice) p.maxP = maxPrice;
    if (minRooms) p.rooms = minRooms;
    setSearchParams(p, { replace: true });
  }, [transaction, type, query, minPrice, maxPrice, minRooms]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (transaction && p.transaction !== transaction) return false;
      if (type && p.type !== type) return false;
      if (minPrice && p.price < Number(minPrice)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      if (minRooms && (p.rooms ?? 0) < Number(minRooms)) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          (p.ref || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [properties, transaction, type, minPrice, maxPrice, minRooms, query]);

  const reset = () => {
    setTransaction('');
    setType('');
    setQuery('');
    setMinPrice('');
    setMaxPrice('');
    setMinRooms('');
  };

  const hasFilters = !!(transaction || type || query || minPrice || maxPrice || minRooms);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Page header */}
      <div className="bg-gradient-to-br from-[#0D1B3E] to-[#1A3A6B] pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={20} className="text-[#F5C518]" />
            <span className="text-[#F5C518] text-xs font-bold uppercase tracking-widest">Catalogue</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Nos biens disponibles</h1>
          <p className="text-white/50 text-sm">
            {loading ? '…' : `${filtered.length} bien${filtered.length !== 1 ? 's' : ''} trouvé${filtered.length !== 1 ? 's' : ''}`}
          </p>

          {/* Quick transaction tabs */}
          <div className="flex gap-2 mt-6">
            {([['', t('listings_all')], ['vente', t('listings_sale')], ['location', t('listings_rent')]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTransaction(val as TransactionType | '')}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  transaction === val
                    ? 'bg-[#F5C518] text-[#0D1B3E] shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Filters sidebar ── */}
          <div className={`lg:w-72 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#1E7FC4]" />
                  Filtres
                </h3>
                {hasFilters && (
                  <button onClick={reset} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                    <X size={12} />
                    {t('filter_reset')}
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t('hero_search_placeholder')}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/20 focus:border-[#1E7FC4] bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {t('filter_type')}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as PropertyType | '')}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/20 focus:border-[#1E7FC4] bg-gray-50/50"
                  >
                    <option value="">{t('filter_all_types')}</option>
                    {TYPES.map((tp) => (
                      <option key={tp.value} value={tp.value}>{t(tp.labelKey as any)}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Prix (DT)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={t('filter_price_min')}
                      className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/20 focus:border-[#1E7FC4] bg-gray-50/50"
                    />
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={t('filter_price_max')}
                      className="w-1/2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7FC4]/20 focus:border-[#1E7FC4] bg-gray-50/50"
                    />
                  </div>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {t('filter_rooms')} (min)
                  </label>
                  <div className="flex gap-1.5">
                    {['', '1', '2', '3', '4', '5+'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setMinRooms(v === '5+' ? '5' : v)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                          (v === '' && minRooms === '') || (v === '5+' && minRooms === '5') || v === minRooms
                            ? 'bg-[#1E7FC4] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {v === '' ? 'Tout' : v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Results ── */}
          <div className="flex-1">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm"
              >
                <SlidersHorizontal size={15} />
                Filtres {hasFilters && <span className="w-2 h-2 bg-[#1E7FC4] rounded-full" />}
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-white animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-4 bg-gray-100 rounded w-full" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-700 text-lg mb-2">{t('listings_empty')}</h3>
                <button onClick={reset} className="mt-4 px-5 py-2.5 bg-[#1E7FC4] text-white rounded-xl text-sm font-semibold hover:bg-[#185FA5] transition-colors">
                  {t('filter_reset')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
