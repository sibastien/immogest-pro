import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from './LangContext';
import type { Lang } from './i18n';
import { Menu, X, Globe, ChevronDown, Check } from 'lucide-react';
import { PartnerModal } from './PartnerModal';

interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
}

const countries: CountryOption[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR (€)' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', currency: 'EUR (€)' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD ($)' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', currency: 'EUR (€)' },
  { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪', currency: 'AED' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', currency: 'CHF' },
  { code: 'TN', name: 'Tunisie (Local)', flag: '🇹🇳', currency: 'TND (DT)' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', currency: 'GBP (£)' },
];

export const PublicNavbar: React.FC = () => {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(countries[0]);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isHome = location.pathname === '/';

  const scrollToTrust = () => {
    if (!isHome) {
      navigate('/#confiance');
      return;
    }
    const elem = document.getElementById('confiance');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const langOptions: { code: Lang; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const baseNavClass = `fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
    scrolled || !isHome
      ? 'bg-[#040D1F]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2.5'
      : 'bg-transparent py-4'
  }`;

  return (
    <>
      <nav className={baseNavClass}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                {/* Gold luxury emblem medallion */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#8E6A1B] via-[#F5C518] to-[#FDEAA7] p-[1.5px] shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-full bg-[#040D1F] flex flex-col items-center justify-center border border-[#F5C518]/30">
                    <span className="font-luxury-serif font-bold text-base text-[#F5C518] leading-none">
                      S
                    </span>
                    <span className="text-[6px] tracking-widest text-[#F5C518] font-bold uppercase mt-0.5">
                      ESTATE
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-serif font-bold text-lg tracking-wide leading-tight group-hover:text-[#F5C518] transition-colors">
                  ImmoGest <span className="text-[#F5C518]">PRO</span>
                </div>
                <div className="text-white/50 text-[10px] tracking-widest uppercase font-medium">
                  Immobilier de prestige
                </div>
              </div>
            </Link>

            {/* ── Desktop Pill Buttons (exact reference design) ── */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Button: Ils nous font confiance */}
              <button
                onClick={scrollToTrust}
                className="px-4 py-2 rounded-full border border-white/20 hover:border-[#F5C518]/60 bg-black/20 hover:bg-black/40 text-white/90 hover:text-white text-xs font-medium tracking-wide transition-all duration-200"
              >
                {t('header_trust')}
              </button>

              {/* Button: Choisir un pays */}
              <div ref={countryRef} className="relative">
                <button
                  onClick={() => setCountryOpen(!countryOpen)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 hover:border-[#F5C518]/60 bg-black/20 hover:bg-black/40 text-white/90 hover:text-white text-xs font-medium tracking-wide transition-all duration-200"
                >
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.name}</span>
                  <ChevronDown size={13} className="opacity-70" />
                </button>

                {countryOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-[#071328] border border-white/15 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="px-3 py-2 text-[11px] font-bold text-[#F5C518] uppercase tracking-wider border-b border-white/10">
                      Pays de résidence (Diaspora)
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            setSelectedCountry(c);
                            setCountryOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors hover:bg-white/10 ${
                            selectedCountry.code === c.code ? 'text-[#F5C518] bg-white/5 font-semibold' : 'text-white/80'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </div>
                          <span className="text-[10px] text-white/50">{c.currency}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Button: Devenir partenaire */}
              <button
                onClick={() => setPartnerModalOpen(true)}
                className="px-4 py-2 rounded-full border border-white/20 hover:border-[#F5C518]/60 bg-black/20 hover:bg-black/40 text-white/90 hover:text-white text-xs font-medium tracking-wide transition-all duration-200"
              >
                {t('header_partner')}
              </button>

              {/* Button: Accès partenaire */}
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-full border border-white/20 hover:border-[#F5C518]/60 bg-black/20 hover:bg-black/40 text-white/90 hover:text-white text-xs font-medium tracking-wide transition-all duration-200"
              >
                {t('header_partner_access')}
              </button>

              {/* WhatsApp Icon Button */}
              <a
                href="https://wa.me/21620000000?text=Bonjour%20ImmoGest%20Pro,%20je%20souhaite%20des%20renseignements%20sur%20vos%20services"
                target="_blank"
                rel="noopener noreferrer"
                title="Contacter sur WhatsApp"
                className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all duration-200 hover:scale-105"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              {/* Language Selector */}
              <div ref={langRef} className="relative">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 hover:border-[#F5C518]/60 bg-black/20 hover:bg-black/40 text-white/90 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  <Globe size={13} className="text-white/80" />
                  <span>{lang.toUpperCase()}</span>
                </button>
                {langOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-[#071328] border border-white/15 rounded-2xl shadow-2xl overflow-hidden min-w-[140px] p-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {langOptions.map((opt) => (
                      <button
                        key={opt.code}
                        onClick={() => {
                          setLang(opt.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors hover:bg-white/10 ${
                          lang === opt.code ? 'text-[#F5C518] bg-white/5 font-bold' : 'text-white/80'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.flag}</span>
                          <span>{opt.label}</span>
                        </span>
                        {lang === opt.code && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Mobile Hamburger ── */}
            <div className="lg:hidden flex items-center gap-2">
              <a
                href="https://wa.me/21620000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="text-white/80 hover:text-white p-2 rounded-lg bg-white/5"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu Drawer ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#040D1F]/98 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-6 space-y-2.5">
            <button
              onClick={() => {
                scrollToTrust();
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl border border-white/10 text-white/90 text-sm"
            >
              🤝 {t('header_trust')}
            </button>
            <button
              onClick={() => {
                setPartnerModalOpen(true);
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl border border-white/10 text-white/90 text-sm"
            >
              ✨ {t('header_partner')}
            </button>
            <button
              onClick={() => {
                navigate('/login');
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl bg-[#F5C518] text-[#0D1B3E] font-bold text-sm"
            >
              🔐 {t('header_partner_access')}
            </button>

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-xs text-white/60">Langue:</span>
              <div className="flex gap-1.5">
                {langOptions.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLang(opt.code);
                      setMobileOpen(false);
                    }}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition ${
                      lang === opt.code ? 'bg-[#F5C518] text-[#0D1B3E]' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    {opt.flag} {opt.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Partner Modal */}
      <PartnerModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
      />
    </>
  );
};
