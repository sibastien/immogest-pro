import React from 'react';
import { MapPin, Maximize2, BedDouble, Bath } from 'lucide-react';
import type { Property, PropertyType } from '../../types';
import { Badge } from '../ui/Badge';

const TYPE_LABELS: Record<PropertyType, string> = {
  villa: 'Villa',
  appartement: 'Appartement',
  maison: 'Maison',
  commercial: 'Local commercial',
};

function formatPrice(price: number, priceType: 'vente' | 'mois'): string {
  const formatted = new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return priceType === 'mois' ? `${formatted} DT/mois` : `${formatted} DT`;
}

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
    >
      {/* Photo placeholder */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
        <div className="text-gray-300 text-4xl font-light">IG</div>
        <div className="absolute top-2 left-2">
          <Badge
            variant={
              property.status === 'disponible'
                ? 'disponible'
                : property.status === 'sous_compromis'
                ? 'sous_compromis'
                : 'loue'
            }
            dot
          />
        </div>
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium text-gray-600">
          {property.transaction === 'location' ? 'Location' : 'Vente'} · {TYPE_LABELS[property.type] ?? 'Autre'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-gray-400 font-mono mb-1">{property.ref}</div>
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{property.title}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin size={12} />
          <span>{property.location}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Maximize2 size={12} />
            {property.surface} m²
          </span>
          {property.rooms && (
            <span className="flex items-center gap-1">
              <BedDouble size={12} />
              {property.rooms} ch.
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath size={12} />
              {property.bathrooms} sdb
            </span>
          )}
        </div>

        {/* Price */}
        <div className="text-base font-semibold text-gray-900">
          {formatPrice(property.price, property.priceType)}
        </div>
      </div>
    </div>
  );
};
