import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from './LangContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { InquiryForm } from './InquiryForm';
import { fetchPublicProperty } from './api';
import type { Property } from '../types';
import {
  ArrowLeft, MapPin, Square, Bed, Bath, Car, Star,
  Building2, ChevronLeft, ChevronRight, Check,
  Phone, Calendar, Tag, MessageCircle, Mail, ShieldCheck,
} from 'lucide-react';

function formatPrice(price: number, priceType: string): string {
  const formatted = new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);
  return priceType === 'mois' ? `${formatted} DT/mois` : `${formatted} DT`;
}

function cleanWhatsAppNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 8) return `216${digits}`;
  return digits;
}

export const PublicPropertyDetail: React.FC = () => {
  const { t } = useLang();
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    fetchPublicProperty(id)
      .then(setProperty)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-[16/9] bg-gray-200 rounded-3xl" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-xl" />)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PublicNavbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="text-7xl mb-6">🏚️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('not_found')}</h1>
          <p className="text-gray-500 mb-8">{t('not_found_sub')}</p>
          <Link to="/proprietes" className="px-6 py-3 bg-[#1E7FC4] text-white rounded-xl font-semibold hover:bg-[#185FA5] transition-colors">
            {t('detail_back')}
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const photos = property.photos?.length ? property.photos : [];
  const currentPhoto = photos[photoIndex];

  const specs = [
    { icon: Square, label: t('detail_surface'), value: `${property.surface} m²` },
    ...(property.rooms ? [{ icon: Bed, label: t('detail_rooms'), value: String(property.rooms) }] : []),
    ...(property.bathrooms ? [{ icon: Bath, label: t('detail_bathrooms'), value: String(property.bathrooms) }] : []),
    ...(property.parking ? [{ icon: Car, label: t('detail_parking'), value: '✓' }] : []),
    ...(property.floor != null ? [{ icon: Building2, label: t('detail_floor'), value: String(property.floor) }] : []),
    ...(property.furnished ? [{ icon: Star, label: t('detail_furnished'), value: '✓' }] : []),
  ];

  const typeLabel: Record<string, string> = {
    villa: t('type_villa'),
    appartement: t('type_appartement'),
    maison: t('type_maison'),
    commercial: t('type_commercial'),
    terrain: t('type_terrain'),
  };

  const agency = property.agency;
  const agencyPhone = agency?.phone || '';
  const agencyWhatsApp = cleanWhatsAppNumber(agency?.whatsapp || agency?.phone);
  const agencyEmail = agency?.email || '';

  const waMessage = encodeURIComponent(
    `Bonjour, je suis intéressé par votre bien "${property.title}" (Réf: ${property.ref || property.id}) affiché à ${formatPrice(property.price, property.priceType)}. Est-il toujours disponible ?`
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Back link */}
        <Link
          to="/proprietes"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1E7FC4] mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {t('detail_back')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: gallery + details ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gallery */}
            <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-[16/9] group shadow-2xl">
              {currentPhoto ? (
                <img
                  src={currentPhoto.startsWith('http') ? currentPhoto : `/api/uploads/${currentPhoto}`}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white/20 text-8xl">🏠</div>
                </div>
              )}

              {/* Nav arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === photoIndex ? 'bg-white w-5' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Badges on photo */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`px-3 py-1.5 text-xs font-bold rounded-xl uppercase tracking-wide shadow-lg ${
                  property.transaction === 'vente' ? 'bg-[#0D3B6E] text-white' : 'bg-[#16A34A] text-white'
                }`}>
                  {property.transaction === 'vente' ? t('card_sale') : t('card_rent')}
                </span>
                <span className="px-3 py-1.5 text-xs font-medium rounded-xl bg-black/40 backdrop-blur-sm text-white">
                  {typeLabel[property.type] ?? property.type}
                </span>
              </div>

              {/* Photo counter */}
              {photos.length > 0 && (
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-lg">
                  {photoIndex + 1} / {photos.length}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      i === photoIndex ? 'border-[#1E7FC4] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.startsWith('http') ? photo : `/api/uploads/${photo}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title & price */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-2 mb-2">
                <MapPin size={15} className="text-[#1E7FC4] flex-shrink-0 mt-1" />
                <span className="text-sm text-gray-500 font-medium">{property.location}</span>
                {property.address && (
                  <span className="text-sm text-gray-400"> — {property.address}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                {property.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-3xl font-extrabold text-[#1E7FC4]">
                  {formatPrice(property.price, property.priceType)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Tag size={12} />
                  {t('detail_ref')} {property.ref}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(property.createdAt).toLocaleDateString('fr-TN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-[#1E7FC4]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-[#1E7FC4]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-sm font-bold text-gray-900">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg mb-4">{t('detail_description')}</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 text-lg mb-4">{t('detail_features')}</h2>
                <div className="grid grid-cols-2 gap-2">
                  {property.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-green-600" />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: sticky agency contact card & inquiry form ── */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bg-gradient-to-br from-[#0D1B3E] to-[#1A3A6B] rounded-2xl p-6 text-white shadow-xl">
              <div className="text-white/50 text-xs font-medium uppercase tracking-widest mb-1">Prix</div>
              <div className="text-3xl font-extrabold text-[#F5C518] mb-1">
                {formatPrice(property.price, property.priceType)}
              </div>
              <div className="text-white/60 text-sm">{typeLabel[property.type]} · {property.location}</div>
            </div>

            {/* Dedicated Agency Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
              {/* Agency Header */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-[#1E7FC4]/20 border border-[#1E7FC4]/20 flex items-center justify-center text-[#1E7FC4] font-bold text-lg flex-shrink-0 shadow-xs">
                  <Building2 size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-base truncate">
                      {agency?.name || 'Agence Immobilière'}
                    </span>
                    <span title="Agence vérifiée" className="flex items-center">
                      <ShieldCheck size={16} className="text-blue-500 flex-shrink-0" />
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {agency?.agentName ? `Conseiller: ${agency.agentName}` : 'Agence partenaire ImmoGest'}
                  </p>
                  {agency?.address && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">{agency.address}</p>
                  )}
                </div>
              </div>

              {/* Direct Instant Action Buttons */}
              <div className="space-y-2.5">
                {agencyPhone && (
                  <a
                    href={`tel:${agencyPhone.replace(/\s+/g, '')}`}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#1E7FC4] hover:bg-[#185FA5] transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 active:scale-[0.99]"
                  >
                    <Phone size={16} />
                    <span>Appeler l'agence ({agencyPhone})</span>
                  </a>
                )}

                {agencyWhatsApp && (
                  <a
                    href={`https://wa.me/${agencyWhatsApp}?text=${waMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20BA5A] transition-all flex items-center justify-center gap-2 shadow-sm shadow-green-500/20 active:scale-[0.99]"
                  >
                    <MessageCircle size={17} />
                    <span>Contacter sur WhatsApp</span>
                  </a>
                )}

                {agencyEmail && (
                  <a
                    href={`mailto:${agencyEmail}?subject=${encodeURIComponent(`Demande d'information - Réf: ${property.ref || property.id}`)}`}
                    className="w-full py-2.5 px-4 rounded-xl font-medium text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={14} />
                    <span>Envoyer un email ({agencyEmail})</span>
                  </a>
                )}
              </div>
            </div>

            {/* Inquiry form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:sticky lg:top-24">
              <h3 className="font-bold text-gray-900 text-base mb-1">{t('detail_contact_title')}</h3>
              <p className="text-gray-500 text-xs mb-4">{t('detail_contact_sub')}</p>
              <InquiryForm propertyId={property.id} propertyRef={property.ref} />
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};
