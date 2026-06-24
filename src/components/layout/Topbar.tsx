import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Search, X, Building2, Users, User, ArrowRight, LogOut, ChevronDown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { usePropertiesStore } from '../../store/propertiesStore';
import { useClientsStore } from '../../store/clientsStore';
import { useAgentsStore } from '../../store/agentsStore';
import { Avatar } from '../ui/Avatar';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

type SearchResult =
  | { kind: 'property'; id: string; title: string; sub: string; path: string }
  | { kind: 'client';   id: string; title: string; sub: string; path: string }
  | { kind: 'agent';    id: string; title: string; sub: string };

const NOTIFS = [
  { id: 'n1', text: 'Nouveau C.R. soumis par Rania Khelil',     time: 'Il y a 5 min',  dot: 'bg-primary', unread: true },
  { id: 'n2', text: 'Visite confirmée — Villa Gammarth',         time: 'Il y a 18 min', dot: 'bg-success', unread: true },
  { id: 'n3', text: 'Client Ahmed Zouari — relance recommandée', time: 'Il y a 1h',     dot: 'bg-warning', unread: true },
  { id: 'n4', text: 'Compromis signé — App. La Marsa T4',        time: 'Il y a 2h',     dot: 'bg-purple',  unread: false },
  { id: 'n5', text: 'Nouveau bien ajouté au portefeuille',        time: 'Hier 17:30',   dot: 'bg-gray-400', unread: false },
];

const ROLE_LABELS: Record<string, string> = {
  admin:          'Administrateur',
  coordinatrice:  'Coordinatrice',
  agent_bureau:   'Agent bureau',
  agent_terrain:  'Agent terrain',
  client:         'Client',
};

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, actions }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { properties } = usePropertiesStore();
  const { clients }    = useClientsStore();
  const { agents }     = useAgentsStore();

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState('');
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [notifs,      setNotifs]      = useState(NOTIFS);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef  = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const unreadCount = notifs.filter((n) => n.unread).length;

  // Close all panels on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  { setSearchOpen(false); setQuery(''); }
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }
      if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); setNotifOpen(false); setProfileOpen(false); }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, []);

  const results = useCallback((): SearchResult[] => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    const out: SearchResult[] = [];

    properties.filter((p) =>
      p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.ref.toLowerCase().includes(q)
    ).slice(0, 3).forEach((p) =>
      out.push({ kind: 'property', id: p.id, title: p.title, sub: `${p.location} · ${p.ref}`, path: `/admin/biens/${p.id}` })
    );

    clients.filter((c) =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q)
    ).slice(0, 3).forEach((c) =>
      out.push({ kind: 'client', id: c.id, title: c.name, sub: c.phone, path: `/admin/clients/${c.id}` })
    );

    agents.filter((a) =>
      a.name.toLowerCase().includes(q)
    ).slice(0, 2).forEach((a) =>
      out.push({ kind: 'agent', id: a.id, title: a.name, sub: a.role.replace('_', ' ') })
    );

    return out;
  }, [query, properties, clients, agents]);

  const res = results();

  const handleResultClick = (r: SearchResult) => {
    if ('path' in r) navigate(r.path);
    setSearchOpen(false);
    setQuery('');
  };

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ICON_MAP  = { property: Building2, client: Users, agent: User };
  const KIND_LABEL = { property: 'Bien', client: 'Client', agent: 'Agent' };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 flex-shrink-0 relative z-40">
      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-sm text-gray-500 truncate">{subtitle}</span>
            </>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Search trigger */}
      <div ref={searchRef} className="relative">
        <button
          onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 hover:border-primary/40 hover:bg-primary-light transition-colors min-w-[180px]"
        >
          <Search size={14} />
          <span className="flex-1 text-left">Rechercher…</span>
          <kbd className="text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {searchOpen && (
          <div className="absolute top-full right-0 mt-1 w-[480px] bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
              <Search size={15} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un bien, client, agent…"
                className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {query.length < 2 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">Tapez au moins 2 caractères pour chercher</div>
            ) : res.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-400">Aucun résultat pour « {query} »</div>
            ) : (
              <div className="py-1 max-h-72 overflow-y-auto">
                {res.map((r) => {
                  const Icon = ICON_MAP[r.kind];
                  return (
                    <button
                      key={`${r.kind}-${r.id}`}
                      onClick={() => handleResultClick(r)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                        <div className="text-xs text-gray-400 truncate">{r.sub}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{KIND_LABEL[r.kind]}</span>
                        {'path' in r && <ArrowRight size={12} className="text-gray-300" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
              <span><kbd className="bg-gray-100 px-1 rounded">↵</kbd> Ouvrir</span>
              <span><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> Fermer</span>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell size={18} className="text-gray-500" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">Tout marquer lu</button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${n.unread ? 'bg-primary-light/30' : ''}`}
                  onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, unread: false } : x))}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${n.unread ? n.dot : 'bg-gray-200'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-5 ${n.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{n.text}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <button className="text-xs text-primary hover:underline">Voir toutes les notifications</button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar + profile dropdown */}
      <div ref={profileRef} className="relative">
        <button
          onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
          className="flex items-center gap-1.5 rounded-lg hover:bg-gray-100 p-1 transition-colors"
        >
          <Avatar initials={user?.initials ?? '?'} size="sm" />
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
        </button>

        {profileOpen && (
          <div className="absolute top-full right-0 mt-1 w-60 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
            {/* User info */}
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar initials={user?.initials ?? '?'} size="md" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{user?.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 bg-primary-light rounded-lg w-fit">
                <Shield size={11} className="text-primary" />
                <span className="text-xs font-medium text-primary">{ROLE_LABELS[user?.role ?? ''] ?? user?.role}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="py-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors"
              >
                <LogOut size={15} />
                Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
