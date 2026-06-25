import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Settings, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  accentColor?: 'blue' | 'purple';
  logoSubtitle?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const ACCENT = {
  blue: {
    active: 'bg-primary-light text-primary',
    hover: 'hover:bg-gray-100',
    dot: 'bg-primary',
    border: 'border-primary',
  },
  purple: {
    active: 'bg-purple-light text-purple',
    hover: 'hover:bg-gray-100',
    dot: 'bg-purple',
    border: 'border-purple',
  },
};

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  accentColor = 'blue',
  logoSubtitle = 'Gestion immobilière',
  mobileOpen = false,
  onMobileClose,
}) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const colors = ACCENT[accentColor];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const panel = (
    <aside className="w-60 h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${colors.dot} flex items-center justify-center`}>
            <span className="text-white text-sm font-bold">IG</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">ImmoGest Pro</div>
            <div className="text-xs text-gray-400">{logoSubtitle}</div>
          </div>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? colors.active : `text-gray-600 ${colors.hover}`,
              ].join(' ')
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="bg-danger text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
        {user?.role === 'admin' && (
          <button
            onClick={() => { navigate('/admin/parametres'); onMobileClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings size={18} />
            <span>Paramètres</span>
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-danger-light hover:text-danger transition-colors"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
        <Avatar initials={user?.initials ?? '?'} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 truncate">{user?.name}</div>
          <div className="text-xs text-gray-400 truncate">{user?.email}</div>
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
