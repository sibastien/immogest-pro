import React from 'react';
import { Link } from 'react-router-dom';
import type { Property } from '../types';
import { useLang } from './LangContext';
import { Bed, Bath, Square, Car, MapPin, ArrowRight, Tag, Phone, MessageCircle, Building2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  featured?: boolean;
}

function formatPrice(price: number, priceType: string, cardMois: string): string {
  const formatted = new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return priceType === 'mois' ? `${formatted} DT${cardMois}` : `${formatted} DT`;
}

function cleanWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `216${digits}`;
  return digits;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, featured }) => {
  const { t } = useLang();

  const typeLabel: Record<string, string> = {
    villa: t('type_villa'),
    appartement: t('type_appartement'),
    maison: t('type_maison'),
    commercial: t('type_commercial'),
    terrain: t('type_terrain'),
  };

  const mainPhoto = property.photos?.[0];
  const agency = property.agency;
  const agencyPhone = agency?.phone || '';
  const agencyWhatsApp = cleanWhatsAppNumber(agency?.whatsapp || agency?.phone);

  const waMessage = encodeURIComponent(
    `Bonjour, je suis intéressé par votre bien "${property.title}" (Réf: ${property.ref || property.id}). Est-il toujours disponible ?`
  );

  return (
    <Link
      to={`/proprietes/${property.id}`}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 border border-gray-100 hover:border-[#1E7FC4]/20 transition-all duration-300 hover:-translate-y-1 ${featured ? 'ring-2 ring-[#F5C518]/50' : ''}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900">
        {mainPhoto ? (
          <img
            src={mainPhoto.startsWith('http') ? mainPhoto : `/api/uploads/${mainPhoto}`}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/20 text-6xl">🏠</div>
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide shadow-lg ${
              property.transaction === 'vente'
                ? 'bg-[#0D3B6E] text-white'
                : 'bg-[#16A34A] text-white'
            }`}
          >
            {property.transaction === 'vente' ? t('card_sale') : t('card_rent')}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-black/40 backdrop-blur-sm text-white">
            {typeLabel[property.type] ?? property.type}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          <div className="px-3 py-1.5 bg-[#F5C518] rounded-xl text-[#0D1B3E] font-bold text-sm shadow-lg">
            {formatPrice(property.price, property.priceType, t('card_mois'))}
          </div>
        </div>

        {featured && (
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 bg-[#F5C518] rounded-lg text-[#0D1B3E] text-xs font-bold flex items-center gap-1">
              <Tag size={10} />
              Vedette
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start gap-1 mb-1.5">
          <MapPin size={13} className="text-[#1E7FC4] flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-500 font-medium truncate">{property.location}</span>
        </div>
        <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-3 group-hover:text-[#1E7FC4] transition-colors">
          {property.title}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4 border-t border-gray-50 pt-3">
          <span className="flex items-center gap-1">
            <Square size={13} className="text-gray-400" />
            {property.surface} {t('card_sqm')}
          </span>
          {property.rooms && (
            <span className="flex items-center gap-1">
              <Bed size={13} className="text-gray-400" />
              {property.rooms} {t('card_rooms')}
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath size={13} className="text-gray-400" />
              {property.bathrooms} {t('card_bath')}
            </span>
          )}
          {property.parking && (
            <span className="flex items-center gap-1">
              <Car size={12} className="text-gray-400" />
              {t('card_parking')}
            </span>
          )}
        </div>

        {/* Agency Info & Direct Contact */}
        {agency && (
          <div className="mb-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1E7FC4] font-bold text-xs flex-shrink-0">
                <Building2 size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {agency.name}
                </div>
                {agencyPhone && (
                  <div className="text-[11px] text-gray-500 font-mono truncate">
                    {agencyPhone}
                  </div>
                )}
              </div>
            </div>

            {/* Direct contact action buttons on card */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {agencyPhone && (
                <a
                  href={`tel:${agencyPhone.replace(/\s+/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`Appeler ${agency.name}`}
                  className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E7FC4] hover:bg-[#1E7FC4] hover:text-white transition-colors flex items-center justify-center shadow-xs"
                >
                  <Phone size={13} />
                </a>
              )}
              {agencyWhatsApp && (
                <a
                  href={`https://wa.me/${agencyWhatsApp}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title={`Discuter sur WhatsApp avec ${agency.name}`}
                  className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center shadow-xs"
                >
                  <MessageCircle size={13} />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-gray-400 font-mono">Réf. {property.ref}</span>
          <span className="flex items-center gap-1.5 text-[#1E7FC4] text-sm font-semibold group-hover:gap-2.5 transition-all">
            {t('card_details')}
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};
