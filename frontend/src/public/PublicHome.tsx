import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from './LangContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { PropertyCard } from './PropertyCard';
import { InquiryForm } from './InquiryForm';
import { FinancingModal } from './FinancingModal';
import { fetchPublicProperties } from './api';
import type { Property } from '../types';
import cardBuy from '../assets/card-buy.jpg';
import cardFinance from '../assets/card-finance.jpg';
import cardRent from '../assets/card-rent.jpg';
import {
  Search, Building2, TrendingUp, Users, Award,
  ChevronRight, Home, Briefcase, TreePine,
  Shield, Star, Zap, CheckCircle2, ArrowRight
} from 'lucide-react';

/* ─────────────────────────── Quick Search Bar ─────────────────────────── */
const QuickSearchBar: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'vente' | 'location'>('vente');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tab) params.set('t', tab);
    if (query) params.set('q', query);
    navigate(`/proprietes?${params}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto -mt-8 relative z-20 px-4">
      <div className="bg-[#0A1830]/95 backdrop-blur-xl border border-white/15 p-4 sm:p-5 rounded-3xl shadow-2xl shadow-black/40">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Tab Pill */}
          <div className="flex bg-black/40 p-1 rounded-2xl shrink-0 w-full sm:w-auto">
            {(['vente', 'location'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTab(type)}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  tab === type
                    ? 'bg-[#F5C518] text-[#0D1B3E] shadow-md shadow-[#F5C518]/20'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {type === 'vente' ? t('hero_badge_buy') : t('hero_badge_rent')}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex-1 relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par ville, quartier (Tunis, Hammamet, Sousse, La Marsa, Djerba...)"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-gray-900 placeholder:text-white/40 focus:placeholder:text-gray-400 text-sm font-medium border border-white/10 focus:border-[#F5C518] focus:outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-[#D4A017] to-[#F5C518] hover:from-[#C49010] hover:to-[#E5B510] text-[#0D1B3E] font-bold text-sm rounded-2xl shadow-lg transition-all duration-200 hover:scale-105 whitespace-nowrap"
          >
            {t('hero_btn_search')}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────── Trust & Partner Banks ─────────────────────────── */
const PartnerTrustSection: React.FC<{ onOpenFinance: () => void }> = ({ onOpenFinance }) => {
  const bankPartners = [
    { name: 'BIAT', tag: 'Banque Partenaire' },
    { name: 'Attijari Bank', tag: 'Crédit Non-Résident' },
    { name: 'Amen Bank', tag: 'Financement Express' },
    { name: 'BH Bank', tag: 'Habitat & Promoteurs' },
    { name: 'UBCI', tag: 'BNP Paribas Group' },
    { name: 'Banque Zitouna', tag: 'Finance Islamique' },
  ];

  const guarantees = [
    { title: 'Titres 100% Vérifiés', desc: 'Contrôle systématique à la Conservation Foncière (Titre Bleu).' },
    { title: 'Financement Diaspora', desc: 'Dossier de prêt négocié à taux préférentiel depuis votre pays de résidence.' },
    { title: 'Notaires & Avocats Partenaires', desc: 'Signature et séquestre sécurisés en toute conformité légale.' },
    { title: 'Gestion Locative Sérénité', desc: 'Sélection des locataires, état des lieux et versement des loyers garanti.' },
  ];

  return (
    <section id="confiance" className="py-20 bg-gradient-to-b from-[#06121E] via-[#091B33] to-[#0D1B3E] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-3">
            Garantie & Sécurité Immobilière
          </div>
          <h2 className="font-luxury-serif text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            Ils nous font confiance
          </h2>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Un écosystème d’institutions financières, de promoteurs agréés et de juristes mobilisés pour garantir chaque étape de votre acquisition en Tunisie.
          </p>
        </div>

        {/* Bank Partner Logos / Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
          {bankPartners.map((bank) => (
            <div
              key={bank.name}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#F5C518]/40 p-4 rounded-2xl text-center transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5C518]/10 text-[#F5C518] font-luxury-serif font-bold text-sm flex items-center justify-center mx-auto mb-2 border border-[#F5C518]/20 group-hover:scale-110 transition-transform">
                {bank.name.slice(0, 2)}
              </div>
              <div className="text-white font-bold text-sm leading-tight">{bank.name}</div>
              <div className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">{bank.tag}</div>
            </div>
          ))}
        </div>

        {/* 4 Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((g) => (
            <div
              key={g.title}
              className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F5C518]/15 text-[#F5C518] flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-white text-base mb-2">{g.title}</h3>
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#D4A017]/20 via-[#F5C518]/15 to-[#D4A017]/10 border border-[#F5C518]/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[#F5C518] text-xs font-bold uppercase tracking-wider mb-1">
              Accompagnement bancaire non-résidents
            </div>
            <h3 className="font-luxury-serif text-2xl font-bold text-white">
              Besoin d'un crédit bancaire pour financer votre bien ?
            </h3>
            <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-xl">
              Simulez vos mensualités en euros ou dinars et obtenez un accord de principe rapidement auprès de nos banques partenaires.
            </p>
          </div>
          <button
            onClick={onOpenFinance}
            className="px-6 py-3.5 bg-[#F5C518] hover:bg-[#E5B510] text-[#0D1B3E] font-bold text-sm rounded-xl transition-all duration-200 hover:scale-105 shadow-xl shadow-[#F5C518]/20 whitespace-nowrap"
          >
            Simuler mon prêt immobilier
          </button>
        </div>
      </div>
    </section>
  );
};

/* ─────────────────────────── Stats Bar ─────────────────────────── */
const stats = [
  { icon: Building2, key: 'stat_properties', value: '500+' },
  { icon: TrendingUp, key: 'stat_sold', value: '1 200+' },
  { icon: Users, key: 'stat_clients', value: '3 000+' },
  { icon: Award, key: 'stat_years', value: '15+' },
] as const;

/* ─────────────────────────── Why Us ─────────────────────────── */
const whyItems = [
  { icon: Shield, titleKey: 'why_1_title', descKey: 'why_1_desc', color: 'from-blue-500/20 to-blue-600/5' },
  { icon: Star, titleKey: 'why_2_title', descKey: 'why_2_desc', color: 'from-amber-500/20 to-amber-600/5' },
  { icon: Zap, titleKey: 'why_3_title', descKey: 'why_3_desc', color: 'from-green-500/20 to-green-600/5' },
] as const;

/* ─────────────────────────── Category Shortcuts ─────────────────────────── */
const categories = [
  { icon: Building2, label: 'Appartements', type: 'appartement' },
  { icon: Home, label: 'Villas de prestige', type: 'villa' },
  { icon: Briefcase, label: 'Commercial & Bureaux', type: 'commercial' },
  { icon: TreePine, label: 'Terrains & Parcelles', type: 'terrain' },
];

/* ─────────────────────────── Main PublicHome Page ─────────────────────────── */
export const PublicHome: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);

  useEffect(() => {
    fetchPublicProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  const featured = properties.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ─────────────────────────────────────────────────────────────
          HERO & 3-DIRECTION CARDS (Exact match to user reference image)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#040D1F] text-white pt-24 sm:pt-28 pb-10 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#0E2F5E]/30 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* ── Top Hero Header ── */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center mb-8 sm:mb-12">
          {/* Badge Tagline with gold dot */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-[#F5C518]/30 text-white/90 text-xs sm:text-sm font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-[#F5C518] shadow-sm shadow-[#F5C518]" />
            <span>{t('hero_badge_diaspora')}</span>
          </div>

          {/* Grand Headline in Luxury Serif */}
          <h1 className="font-luxury-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15] mb-4 text-white">
            {t('hero_main_title_1')}
            <span className="font-luxury-serif italic font-normal text-[#E5A500]">
              {t('hero_main_title_highlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto font-light">
            {t('hero_main_sub')}
          </p>
        </div>

        {/* ── 3 Direction Cards Grid (Edge-to-Edge / Flush Columns) ── */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
            {/* ── Card 1: Acheter en Tunisie ── */}
            <div className="group relative h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end p-6 sm:p-8 transition-transform duration-500 hover:-translate-y-1">
              {/* Background Image */}
              <img
                src={cardBuy}
                alt="Acheter en Tunisie - Villas et Appartements"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Dark Gradient Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 group-hover:via-black/50 transition-colors" />

              {/* Bottom Content */}
              <div className="relative z-10 space-y-3 sm:space-y-4">
                <h2 className="font-luxury-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  {t('card_buy_title')}
                </h2>
                <p className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-sm">
                  {t('card_buy_desc')}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/proprietes?t=vente')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#D4A017] hover:bg-[#E5B020] text-[#0D1B3E] font-bold text-sm rounded-xl shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 inline-flex items-center justify-center gap-2"
                  >
                    <span>{t('card_buy_btn')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Card 2: Financer votre projet ── */}
            <div className="group relative h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end p-6 sm:p-8 transition-transform duration-500 hover:-translate-y-1">
              {/* Background Image */}
              <img
                src={cardFinance}
                alt="Financer votre projet - Crédit immobilier Tunisie"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 group-hover:via-black/50 transition-colors" />

              {/* Bottom Content */}
              <div className="relative z-10 space-y-3 sm:space-y-4">
                <h2 className="font-luxury-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  {t('card_finance_title')}
                </h2>
                <p className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-sm">
                  {t('card_finance_desc')}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setFinanceModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#D4A017] hover:bg-[#E5B020] text-[#0D1B3E] font-bold text-sm rounded-xl shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 inline-flex items-center justify-center gap-2"
                  >
                    <span>{t('card_finance_btn')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Card 3: Location estivale et annuelle ── */}
            <div className="group relative h-[520px] sm:h-[580px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col justify-end p-6 sm:p-8 transition-transform duration-500 hover:-translate-y-1">
              {/* Background Image */}
              <img
                src={cardRent}
                alt="Location estivale et annuelle Tunisie"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 group-hover:via-black/50 transition-colors" />

              {/* Bottom Content */}
              <div className="relative z-10 space-y-3 sm:space-y-4">
                <h2 className="font-luxury-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                  {t('card_rent_title')}
                </h2>
                <p className="text-white/85 text-xs sm:text-sm lg:text-base leading-relaxed max-w-sm">
                  {t('card_rent_desc')}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/proprietes?t=location')}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#D4A017] hover:bg-[#E5B020] text-[#0D1B3E] font-bold text-sm rounded-xl shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-95 inline-flex items-center justify-center gap-2"
                  >
                    <span>{t('card_rent_btn')}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick Search Floating Bar ── */}
      <QuickSearchBar />

      {/* ── Partner Trust & Guarantees ── */}
      <PartnerTrustSection onOpenFinance={() => setFinanceModalOpen(true)} />

      {/* ── Stats ── */}
      <section className="bg-[#0D1B3E] py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, key, value }) => (
              <div key={key} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-[#F5C518]" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1 font-luxury-serif">{value}</div>
                <div className="text-white/50 text-xs font-medium uppercase tracking-widest">{t(key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category shortcuts ── */}
      <section className="py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.type}
                onClick={() => navigate(`/proprietes?type=${cat.type}`)}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#F5C518]/50 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D1B3E]/10 to-[#F5C518]/10 border border-[#0D1B3E]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <cat.icon size={20} className="text-[#0D1B3E]" />
                </div>
                <div className="font-semibold text-gray-800 text-sm group-hover:text-[#0D1B3E] transition-colors">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <div className="text-[#D4A017] text-xs font-bold uppercase tracking-widest mb-2">
                Sélection exclusive
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-luxury-serif">{t('listings_title')}</h2>
              <p className="text-gray-500 mt-2">{t('listings_sub')}</p>
            </div>
            <button
              onClick={() => navigate('/proprietes')}
              className="flex items-center gap-2 text-[#0D1B3E] font-bold text-sm hover:text-[#D4A017] transition-all whitespace-nowrap"
            >
              {t('listings_view_all')}
              <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-400">{t('listings_empty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p, i) => (
                <PropertyCard key={p.id} property={p} featured={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-[#D4A017] text-xs font-bold uppercase tracking-widest mb-3">Notre différence</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-luxury-serif">{t('why_title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map(({ icon: Icon, titleKey, descKey, color }) => (
              <div key={titleKey} className="relative group p-8 bg-white rounded-3xl border border-gray-100 hover:border-amber-100 hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} border border-white/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className="text-[#0D1B3E]" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{t(titleKey)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Contact ── */}
      <section className="py-20 bg-gradient-to-br from-[#0D1B3E] to-[#040D1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-4">
                Contactez-nous
              </div>
              <h2 className="font-luxury-serif text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {t('detail_contact_title')}
              </h2>
              <p className="text-white/60 text-base leading-relaxed mb-8">
                {t('detail_contact_sub')}
              </p>
              <div className="space-y-4">
                {[
                  { emoji: '✅', text: 'Réponse sous 24h garantie par nos experts' },
                  { emoji: '🔒', text: 'Vos données et projets sont strictement confidentiels' },
                  { emoji: '🤝', text: 'Accompagnement complet sans engagement initial' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-white/70 text-sm">
                    <span>{item.emoji}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <InquiryForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── Financing Modal ── */}
      <FinancingModal
        isOpen={financeModalOpen}
        onClose={() => setFinanceModalOpen(false)}
      />

      <PublicFooter />
    </div>
  );
};
