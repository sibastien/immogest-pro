import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from './LangContext';
import type { Lang } from './i18n';
import { Building2, Menu, X, Globe, LogIn } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { t, lang, setLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
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
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isHome = location.pathname === '/';

  const navLinks = [
    { label: t('nav_home'), to: '/' },
    { label: t('nav_buy'), to: '/proprietes?t=vente' },
    { label: t('nav_rent'), to: '/proprietes?t=location' },
  ];

  const langOptions: { code: Lang; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇹🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const baseNavClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled || !isHome
      ? 'bg-[#0D1B3E]/95 backdrop-blur-md shadow-xl shadow-black/20'
      : 'bg-transparent'
  }`;

  return (
    <nav className={baseNavClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5C518] to-[#E5A500] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Building2 size={18} className="text-[#0D1B3E]" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight tracking-tight">ImmoGest Pro</div>
              <div className="text-[#F5C518] text-[10px] font-medium leading-tight tracking-widest uppercase opacity-80">Immobilier</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Lang switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <Globe size={15} />
                <span className="uppercase font-medium">{lang}</span>
              </button>
              {langOpen && (
                <div className="absolute top-full mt-2 right-0 bg-[#0D1B3E] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-36 animate-in fade-in slide-in-from-top-2 duration-150">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => { setLang(opt.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${
                        lang === opt.code ? 'text-[#F5C518] bg-white/5' : 'text-white/80'
                      }`}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CRM login */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-[#F5C518] hover:bg-[#E5B510] text-[#0D1B3E] font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-[#F5C518]/20 hover:shadow-[#F5C518]/30 hover:scale-105"
            >
              <LogIn size={15} />
              {t('nav_login')}
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white/80 hover:text-white p-2"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D1B3E]/98 backdrop-blur-md border-t border-white/10 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex gap-2">
            {langOptions.map((opt) => (
              <button
                key={opt.code}
                onClick={() => { setLang(opt.code); setMobileOpen(false); }}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  lang === opt.code
                    ? 'bg-[#F5C518] text-[#0D1B3E]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {opt.flag} {opt.code.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => { navigate('/login'); setMobileOpen(false); }}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5C518] text-[#0D1B3E] font-semibold text-sm rounded-xl"
          >
            <LogIn size={15} />
            {t('nav_login')}
          </button>
        </div>
      )}
    </nav>
  );
};
