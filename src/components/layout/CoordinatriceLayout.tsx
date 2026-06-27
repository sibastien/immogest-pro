import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAgentsStore } from '../../store/agentsStore';
import {
  LayoutDashboard, Send, ClipboardCheck, Map, FolderOpen, CalendarDays, Building2,
} from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/coordinatrice':               'Hub central',
  '/coordinatrice/dispatch':      'Dispatch visite',
  '/coordinatrice/comptes-rendus':'Valider les C.R.',
  '/coordinatrice/carte':         'Carte agents',
  '/coordinatrice/dossiers':      'Dossiers actifs',
  '/coordinatrice/planning':      'Planning hebdo',
  '/coordinatrice/nouveau-bien':  'Nouveau bien',
};

export const CoordinatriceLayout: React.FC = () => {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { comptesRendus } = useAgentsStore();

  const pendingCRs = comptesRendus.filter((cr) => cr.status === 'soumis').length;

  const navItems = [
    { label: 'Hub central',    path: '/coordinatrice',               icon: LayoutDashboard },
    { label: 'Dispatch',       path: '/coordinatrice/dispatch',      icon: Send },
    { label: 'Valider C.R.',   path: '/coordinatrice/comptes-rendus',icon: ClipboardCheck, badge: pendingCRs || undefined },
    { label: 'Carte agents',   path: '/coordinatrice/carte',         icon: Map },
    { label: 'Dossiers',       path: '/coordinatrice/dossiers',      icon: FolderOpen },
    { label: 'Planning',       path: '/coordinatrice/planning',      icon: CalendarDays },
    { label: 'Nouveau bien',   path: '/coordinatrice/nouveau-bien',  icon: Building2 },
  ];

  const title = PAGE_TITLES[pathname] ?? 'Coordinatrice';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        navItems={navItems}
        accentColor="purple"
        logoSubtitle="Coordinatrice"
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
