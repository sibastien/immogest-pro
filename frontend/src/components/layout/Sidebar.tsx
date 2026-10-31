import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Settings, X, Shield, Globe, ExternalLink } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';
import { Logo } from '../ui/Logo';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  accentColor?: 'gold' | 'blue' | 'purple';
  logoSubtitle?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ACCENT = {
  gold: {
    active: 'border border-white/20 bg-white/15 text-white font-semibold shadow-[0_0_20px_rgba(30,127,196,0.25)]',
    hover: 'hover:bg-white/8 hover:text-white text-[#93C5FD]',
    iconActive: 'text-white',
    iconInactive: 'text-[#93C5FD]',
    badge: 'bg-[#F5C518] text-[#0D3B6E] font-bold',
  },
  blue: {
    active: 'border border-white/20 bg-white/15 text-white font-semibold shadow-[0_0_20px_rgba(30,127,196,0.25)]',
    hover: 'hover:bg-white/8 hover:text-white text-[#93C5FD]',
    iconActive: 'text-white',
    iconInactive: 'text-[#93C5FD]',
    badge: 'bg-[#F5C518] text-[#0D3B6E] font-bold',
  },
  purple: {
    active: 'border border-white/20 bg-white/15 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.2)]',
    hover: 'hover:bg-white/8 hover:text-white text-[#93C5FD]',
    iconActive: 'text-white',
    iconInactive: 'text-[#93C5FD]',
    badge: 'bg-[#A855F7] text-white font-bold',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  accentColor = 'gold',
  logoSubtitle = 'CRM IMMOBILIER',
  mobileOpen = false,
  onMobileClose,
}) => {
  const { user, tenant, logout } = useAuthStore();
  const navigate = useNavigate();
  const colors = ACCENT[accentColor] || ACCENT.gold;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const panel = (
    <aside
      className="w-64 h-full flex flex-col flex-shrink-0 select-none"
      style={{
        background: 'linear-gradient(180deg, #0D3B6E 0%, #0F4785 60%, #185FA5 100%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Logo size="md" variant="dark" subtitle={tenant?.name ? tenant.name.toUpperCase() : logoSubtitle} />
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* View public site button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => { navigate('/'); onMobileClose?.(); }}
          className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 shadow-sm transition-all group hover:border-[#F5C518]/40"
          title="Accéder au site public vitrine"
        >
          <div className="flex items-center gap-2.5">
            <Globe size={16} className="text-[#F5C518] flex-shrink-0" />
            <span>Voir mon site</span>
          </div>
          <ExternalLink size={13} className="text-blue-200 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all border border-transparent',
                isActive ? colors.active : colors.hover,
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${
                    isActive ? colors.iconActive : colors.iconInactive
                  } group-hover:text-white`}
                />
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`${colors.badge} text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center`}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-2 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {(user?.role === 'superadmin' || (user?.role === 'admin' && tenant?.id === 'default')) && (
          <button
            onClick={() => { navigate('/superadmin'); onMobileClose?.(); }}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-white/10 hover:bg-white/15 hover:text-white transition-all mb-1 border border-amber-400/20"
          >
            <Shield size={16} className="text-amber-400" />
            <span>Console Super-Admin</span>
          </button>
        )}
        {user?.role === 'admin' && (
          <button
          onClick={() => { navigate('/admin/parametres'); onMobileClose?.(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
        >
            <Settings size={18} />
            <span>Paramètres</span>
          </button>
        )}
        <button
          onClick={() => { navigate('/'); onMobileClose?.(); }}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Globe size={18} />
          <span>Voir le site</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm text-blue-200 hover:text-red-300 hover:bg-red-500/15 transition-colors"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* User info card */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div
          className="rounded-xl px-3.5 py-2.5 flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Avatar initials={user?.initials ?? '?'} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
            <div className="text-xs text-[#93C5FD] truncate flex items-center gap-1.5 mt-0.5">
              <span className="truncate">{user?.email}</span>
              {tenant?.plan && (
                <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] bg-white/20 text-white font-bold uppercase">
                  {tenant.plan}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: static sidebar */}
      <div className="hidden md:flex h-screen">
        {panel}
      </div>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <div className="relative z-10 h-full">
            {panel}
          </div>
        </div>
      )}
    </>
  );
};
