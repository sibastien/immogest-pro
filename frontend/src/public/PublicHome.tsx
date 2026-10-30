import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from './LangContext';
import { PublicNavbar } from './PublicNavbar';
import { PublicFooter } from './PublicFooter';
import { PropertyCard } from './PropertyCard';
import { InquiryForm } from './InquiryForm';
import { fetchPublicProperties } from './api';
import type { Property } from '../types';
import heroBg from '../assets/hero-bg.jpg';
import {
  Search, Building2, TrendingUp, Users, Award,
  ChevronRight, Home, Briefcase, TreePine,
  Shield, Star, Zap
} from 'lucide-react';

/* ─────────────────────────── Hero Search ─────────────────────────── */
const HeroSearch: React.FC = () => {
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
    <div className="w-full max-w-2xl">
      {/* Transaction tabs */}
      <div className="flex gap-2 mb-4">
        {(['vente', 'location'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTab(type)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === type
                ? 'bg-[#F5C518] text-[#0D1B3E] shadow-lg shadow-[#F5C518]/30'
                : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
            }`}
          >
            {type === 'vente' ? t('hero_badge_buy') : t('hero_badge_rent')}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('hero_search_placeholder')}
            className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white text-gray-800 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F5C518]/50 shadow-xl"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-4 bg-gradient-to-r from-[#F5C518] to-[#E5A500] hover:from-[#E5B510] hover:to-[#D49500] text-[#0D1B3E] font-bold rounded-2xl shadow-xl shadow-[#F5C518]/30 hover:shadow-[#F5C518]/40 transition-all duration-200 hover:scale-105 whitespace-nowrap"
        >
          {t('hero_btn_search')}
        </button>
      </form>
    </div>
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
  { icon: Building2, label: 'Appartements', type: 'appartement', count: '' },
  { icon: Home, label: 'Villas', type: 'villa', count: '' },
  { icon: Briefcase, label: 'Commercial', type: 'commercial', count: '' },
  { icon: TreePine, label: 'Terrains', type: 'terrain', count: '' },
];

/* ─────────────────────────── Page ─────────────────────────── */
export const PublicHome: React.FC = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);

  const featured = properties.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040D1F]/70 via-[#040D1F]/60 to-[#040D1F]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B3E]/40 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5C518]/15 border border-[#F5C518]/30 text-[#F5C518] text-xs font-semibold uppercase tracking-widest mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F5C518] animate-pulse" />
            ImmoGest Pro — Immobilier Premium
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6 max-w-4xl mx-auto">
            {t('hero_tagline')}
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            {t('hero_sub')}
          </p>

          <HeroSearch />

          {/* Scroll hint */}
          <div className="mt-16 flex justify-center">
            <div className="flex flex-col items-center gap-2 text-white/30 text-xs animate-bounce">
              <div className="w-px h-8 bg-white/20" />
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#0D1B3E] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ icon: Icon, key, value }) => (
              <div key={key} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center mx-auto mb-3">
                  <Icon size={18} className="text-[#F5C518]" />
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">{value}</div>
                <div className="text-white/40 text-xs font-medium uppercase tracking-widest">{t(key)}</div>
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
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#1E7FC4]/30 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E7FC4]/10 to-[#0D3B6E]/5 border border-[#1E7FC4]/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <cat.icon size={20} className="text-[#1E7FC4]" />
                </div>
                <div className="font-semibold text-gray-800 text-sm">{cat.label}</div>
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
              <div className="text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-2">
                Sélection exclusive
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('listings_title')}</h2>
              <p className="text-gray-500 mt-2">{t('listings_sub')}</p>
            </div>
            <button
              onClick={() => navigate('/proprietes')}
              className="flex items-center gap-2 text-[#1E7FC4] font-semibold text-sm hover:gap-3 transition-all whitespace-nowrap"
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
            <div className="text-[#F5C518] text-xs font-bold uppercase tracking-widest mb-3">Notre différence</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">{t('why_title')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map(({ icon: Icon, titleKey, descKey, color }) => (
              <div key={titleKey} className="relative group p-8 bg-white rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} border border-white/80 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className="text-[#1E7FC4]" />
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
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                {t('detail_contact_title')}
              </h2>
              <p className="text-white/50 text-base leading-relaxed mb-8">
                {t('detail_contact_sub')}
              </p>
              <div className="space-y-4">
                {[
                  { emoji: '✅', text: 'Réponse sous 24h garantie' },
                  { emoji: '🔒', text: 'Vos données sont protégées' },
                  { emoji: '🤝', text: 'Accompagnement sans engagement' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-white/60 text-sm">
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

      <PublicFooter />
    </div>
  );
};
