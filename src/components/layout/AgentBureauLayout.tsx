import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import {
  LayoutDashboard, Phone, UserPlus, FilePlus, BookOpen, CalendarDays, Building2,
} from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/agent-bureau':               'Mon bureau',
  '/agent-bureau/appels':        'Journal des appels',
  '/agent-bureau/prospects':     'Mes prospects',
  '/agent-bureau/nouvelle-fiche':'Nouvelle fiche client',
  '/agent-bureau/catalogue':     'Catalogue des biens',
  '/agent-bureau/nouveau-bien':  'Nouveau bien',
  '/agent-bureau/agenda':        'Mon agenda',
};

export const AgentBureauLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Mon bureau',      path: '/agent-bureau',               icon: LayoutDashboard },
    { label: 'Appels',          path: '/agent-bureau/appels',        icon: Phone },
    { label: 'Prospects',       path: '/agent-bureau/prospects',     icon: UserPlus },
    { label: 'Nouvelle fiche',  path: '/agent-bureau/nouvelle-fiche',icon: FilePlus },
    { label: 'Catalogue',       path: '/agent-bureau/catalogue',     icon: BookOpen },
    { label: 'Nouveau bien',    path: '/agent-bureau/nouveau-bien',  icon: Building2 },
    { label: 'Agenda',          path: '/agent-bureau/agenda',        icon: CalendarDays },
  ];

  const title = PAGE_TITLES[pathname] ?? 'Agent bureau';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        navItems={navItems}
        accentColor="blue"
        logoSubtitle="Agent bureau"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          title={title}
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
