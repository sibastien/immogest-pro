import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, Wallet, Ruler, Building2, Check, ChevronRight } from 'lucide-react';
import { usePropertiesStore } from '../store/propertiesStore';
import type { Client, Property } from '../types';

interface Props {
  client: Client;
  /** Where to navigate when a match is clicked (defaults to admin). */
  basePath?: string;
}

interface Match {
  property: Property;
  score: number;
  reasons: string[];
}

const fmtPrice = (p: Property) =>
  `${p.price.toLocaleString('fr-FR')} DT${p.priceType === 'mois' ? '/mois' : ''}`;

// Score each available property against the client's budget, zones and needs.
function matchProperty(client: Client, p: Property): Match | null {
  const prefs = client.propertyPreferences ?? {};
  const reasons: string[] = [];
  let score = 0;

  // Budget
  if (client.budget && (client.budget.min || client.budget.max)) {
    const okMax = !client.budget.max || p.price <= client.budget.max;
    const okMin = !client.budget.min || p.price >= client.budget.min;
    if (okMax && okMin) { score += 2; reasons.push('Budget'); }
  }
  // Zone / location
  if (prefs.locations?.length) {
    if (prefs.locations.some((l) => p.location.toLowerCase().includes(l.toLowerCase()))) {
      score += 2; reasons.push('Zone');
    }
  }
  // Type of property
  if (prefs.type?.length) {
    if (prefs.type.includes(p.type)) { score += 1; reasons.push('Type'); }
  }
  // Surface
  if (prefs.minSurface) {
    if (p.surface >= prefs.minSurface) { score += 1; reasons.push('Surface'); }
  }
  // Rooms
  if (prefs.rooms && p.rooms) {
    if (p.rooms >= prefs.rooms) { score += 1; reasons.push('Pièces'); }
  }

  return score > 0 ? { property: p, score, reasons } : null;
}

const REASON_ICON: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Budget: Wallet, Zone: MapPin, Type: Building2, Surface: Ruler, Pièces: Home,
};

export const PropertyMatches: React.FC<Props> = ({ client, basePath = '/admin/biens' }) => {
  const navigate = useNavigate();
  const { properties } = usePropertiesStore();

  const matches = useMemo(() => {
    return properties
      .filter((p) => p.status === 'disponible')
      .map((p) => matchProperty(client, p))
      .filter((m): m is Match => m !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [properties, client]);

  const hasCriteria =
    !!(client.budget?.min || client.budget?.max) ||
    !!client.propertyPreferences?.locations?.length ||
    !!client.propertyPreferences?.type?.length ||
    !!client.propertyPreferences?.minSurface ||
    !!client.propertyPreferences?.rooms;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Biens correspondants</h3>
        <span className="text-xs text-gray-400">{matches.length} suggestion{matches.length !== 1 ? 's' : ''}</span>
      </div>

      {!hasCriteria && (
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          Renseignez le budget et les préférences (zones, type, surface) de ce client pour obtenir des suggestions de biens.
        </p>
      )}

      {hasCriteria && matches.length === 0 && (
        <div className="flex flex-col items-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Building2 size={24} className="mb-2 opacity-30" />
          <p className="text-sm">Aucun bien disponible ne correspond pour l'instant</p>
        </div>
      )}

      <div className="space-y-2">
        {matches.map(({ property: p, reasons }) => (
          <div
            key={p.id}
            onClick={() => navigate(`${basePath}/${p.id}`)}
            className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {p.photos?.[0]
                ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />
                : <Building2 size={18} className="text-gray-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{p.title}</span>
                <span className="text-xs font-mono text-gray-400">{p.ref}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <MapPin size={11} /> {p.location} · {fmtPrice(p)} · {p.surface} m²
              </div>
              <div className="flex flex-wrap gap-1">
                {reasons.map((r) => {
                  const Icon = REASON_ICON[r] ?? Check;
                  return (
                    <span key={r} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-success-light text-success text-[10px] rounded-full font-medium">
                      <Icon size={9} /> {r}
                    </span>
                  );
                })}
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
