import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import {
  LayoutDashboard, Building2, Users, ArrowLeftRight,
  Calendar, GitPullRequest, UserCheck, FileText, BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Tableau de bord', path: '/admin',              icon: LayoutDashboard },
  { label: 'Biens',           path: '/admin/biens',        icon: Building2 },
  { label: 'Clients',         path: '/admin/clients',      icon: Users },
  { label: 'Transactions',    path: '/admin/transactions', icon: ArrowLeftRight },
  { label: 'Pipeline',        path: '/admin/pipeline',     icon: GitPullRequest },
  { label: 'Agenda',          path: '/admin/agenda',       icon: Calendar },
  { label: 'Documents',       path: '/admin/documents',    icon: FileText },
  { label: 'Rapports',        path: '/admin/rapports',     icon: BarChart3 },
  { label: 'Équipe',          path: '/admin/equipe',       icon: UserCheck },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin':              'Tableau de bord',
  '/admin/biens':        'Biens immobiliers',
  '/admin/clients':      'Clients',
  '/admin/transactions': 'Transactions',
  '/admin/pipeline':     'Pipeline commercial',
  '/admin/agenda':       'Agenda',
  '/admin/documents':    'Documents',
  '/admin/rapports':     'Rapports & statistiques',
  '/admin/equipe':       'Équipe',
};

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'ImmoGest Pro';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        navItems={NAV_ITEMS}
        accentColor="blue"
        logoSubtitle="Administration"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={baseTitle}
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
