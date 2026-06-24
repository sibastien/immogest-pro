import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, CalendarDays, LogOut } from 'lucide-react';
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">IG</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">ImmoGest Pro</span>
          </div>

          <nav className="flex items-center gap-1 flex-1">
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

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-400">Espace client</div>
            </div>
            <Avatar initials={user?.initials ?? '?'} size="sm" />
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};
