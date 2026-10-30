import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from './LangContext';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { t } = useLang();

  return (
    <footer className="bg-[#040D1F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5C518] to-[#E5A500] flex items-center justify-center">
                <Building2 size={18} className="text-[#0D1B3E]" />
              </div>
              <div>
                <div className="font-bold text-base leading-tight">ImmoGest Pro</div>
                <div className="text-[#F5C518] text-[10px] font-medium tracking-widest uppercase opacity-80">Immobilier</div>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              {t('footer_desc')}
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#F5C518]/20 border border-white/10 hover:border-[#F5C518]/30 flex items-center justify-center text-white/50 hover:text-[#F5C518] transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#F5C518]/20 border border-white/10 hover:border-[#F5C518]/30 flex items-center justify-center text-white/50 hover:text-[#F5C518] transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-5">
              {t('footer_links')}
            </h4>
            <ul className="space-y-3">
              {[
                { label: t('nav_home'), to: '/' },
                { label: t('nav_buy'), to: '/proprietes?t=vente' },
                { label: t('nav_rent'), to: '/proprietes?t=location' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-white/50 hover:text-[#F5C518] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 uppercase tracking-widest mb-5">
              {t('footer_contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <Phone size={14} className="mt-0.5 text-[#F5C518] flex-shrink-0" />
                +216 XX XXX XXX
              </li>
              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <Mail size={14} className="mt-0.5 text-[#F5C518] flex-shrink-0" />
                contact@immogest-pro.tn
              </li>
              <li className="flex items-start gap-2.5 text-white/50 text-sm">
                <MapPin size={14} className="mt-0.5 text-[#F5C518] flex-shrink-0" />
                Tunis, Tunisie
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} ImmoGest Pro. {t('footer_rights')}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
