import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Bell, LogOut, Globe } from 'lucide-react';
import { Home, MapPin, Phone, Users, TrendingUp, Building2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

const NAV_ITEMS = [
  { label: 'Accueil', path: '/agent-terrain', icon: Home },
  { label: 'Visites', path: '/agent-terrain/visites', icon: MapPin },
  { label: 'Biens', path: '/agent-terrain/biens', icon: Building2 },
  { label: 'Appels', path: '/agent-terrain/appels', icon: Phone },
  { label: 'Clients', path: '/agent-terrain/clients', icon: Users },
  { label: 'Perf.', path: '/agent-terrain/performance', icon: TrendingUp },
];

export const AgentTerrainLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {/* Mobile topbar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">IG</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">ImmoGest Pro</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            title="Voir mon site"
          >
            <Globe size={14} />
            <span className="text-[11px]">Site</span>
          </button>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <Bell size={20} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <Avatar initials={user?.initials ?? '?'} size="sm" />
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100"
          >
            <LogOut size={18} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Main content with bottom padding for nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <MobileNav items={NAV_ITEMS} />
    </div>
  );
};
