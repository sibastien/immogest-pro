import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CalendarDays, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../ui/Avatar';

const NAV_ITEMS = [
  { label: 'Mon dossier', path: '/client', icon: LayoutDashboard },
  { label: 'Documents', path: '/client/documents', icon: FolderOpen },
  { label: 'Rendez-vous', path: '/client/rendez-vous', icon: CalendarDays },
];

export const ClientLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">IG</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">ImmoGest Pro</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/client'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100',
                  ].join(' ')
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 md:gap-3 ml-auto">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-400">Espace client</div>
            </div>
            <Avatar initials={user?.initials ?? '?'} size="sm" />
            <button
              onClick={handleLogout}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut size={16} className="text-gray-400" />
            </button>
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-2 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/client'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary-light text-primary font-medium'
                      : 'text-gray-600 hover:bg-gray-100',
                  ].join(' ')
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger-light transition-colors"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
};
