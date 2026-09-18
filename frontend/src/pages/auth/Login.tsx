import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, X, Building2, Users, CalendarCheck,
  BarChart3, CheckCircle, ArrowRight, Shield, Zap,
  MapPin, Phone, FileText, Star, Sparkles, Check
} from 'lucide-react';
import { useAuthStore, dashboardPathByRole } from '../../store/authStore';

// ── Auth Modal (Login + SaaS Agency Registration) ────────────────────────────
interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialMode = 'login', onClose }) => {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [agencyName, setAgencyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    setError('');
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) {
      const role = useAuthStore.getState().user?.role;
      if (role) navigate(dashboardPathByRole[role]);
    } else {
      setError(result.error ?? 'Identifiants incorrects. Réessayez.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName || !adminName || !registerEmail || !registerPassword) return;
    setLoading(true);
    setError('');
    const result = await register({
      agencyName,
      name: adminName,
      email: registerEmail,
      password: registerPassword,
      phone: registerPhone,
    });
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error ?? 'Erreur lors de la création du compte.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(13, 59, 110, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#185FA5' }}>
              <span className="text-white text-base font-bold">IG</span>
            </div>
            <div>
              <div className="text-base font-bold text-gray-900">ImmoGest Pro</div>
              <div className="text-xs text-gray-400">
                {mode === 'login' ? 'Connexion à votre agence' : 'Créer votre agence SaaS'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1.5 mx-6 mt-4 bg-gray-100/80 rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles size={13} className="text-amber-500" />
            Créer mon agence
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
            {error}
          </div>
        )}

        {/* ── Form: Login ── */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@immogest.pro"
                required
                autoComplete="off"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
                style={{ '--tw-ring-color': '#185FA5' } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mot de passe / Code d'accès
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !loginEmail || !loginPassword}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 active:scale-[0.98] shadow-md shadow-blue-900/10"
              style={{ background: 'linear-gradient(135deg, #0D3B6E 0%, #185FA5 100%)' }}
            >
              {loading ? 'Connexion en cours…' : 'Accéder à mon espace'}
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs text-gray-500">Pas encore d'agence ? </span>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Créer une agence (14j gratuits)
              </button>
            </div>
          </form>
        )}

        {/* ── Form: Register (SaaS Onboarding) ── */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} autoComplete="off" className="p-6 space-y-3.5">
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex items-center gap-2.5">
              <Sparkles size={18} className="text-amber-500 flex-shrink-0" />
              <div className="text-xs text-blue-900">
                <span className="font-bold">Essai gratuit 14 jours</span> complet et sans engagement ni carte bancaire.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de votre agence *</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Ex: Carthage Prestige Immobilier"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Votre nom *</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Jean Dupont"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  placeholder="+216 71 000 000"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email professionnel *</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="contact@carthage-immo.tn"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mot de passe administrateur *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Au moins 6 caractères"
                  minLength={6}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !agencyName || !adminName || !registerEmail || registerPassword.length < 6}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 active:scale-[0.98] shadow-md shadow-blue-900/10"
              style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E7FC4 100%)' }}
            >
              {loading ? 'Création de votre espace…' : 'Démarrer mon agence'}
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              En créant votre agence, vous acceptez nos conditions d'utilisation SaaS.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Landing page data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Building2,
    color: '#185FA5',
    bg: '#DBEAFE',
    title: 'Catalogue de biens',
    desc: 'Gérez votre portefeuille immobilier — vente, location, terrain, commercial. Photos, prix, statuts, mandats.',
  },
  {
    icon: Users,
    color: '#7C3AED',
    bg: '#EDE9FE',
    title: 'Gestion des clients',
    desc: 'Fiches prospects enrichies, suivi du pipeline, historique des contacts et alertes de relance automatiques.',
  },
  {
    icon: CalendarCheck,
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'Planification des visites',
    desc: 'Agenda partagé, assignation aux agents terrain, bons de visite numériques et comptes rendus structurés.',
  },
  {
    icon: BarChart3,
    color: '#D97706',
    bg: '#FEF3C7',
    title: 'Rapports & Performance',
    desc: 'Tableaux de bord en temps réel, CA mensuel, taux de conversion et classement agents en direct.',
  },
  {
    icon: MapPin,
    color: '#0F766E',
    bg: '#CCFBF1',
    title: 'Suivi terrain',
    desc: 'Application responsive pour agents terrain : visites GPS, compte rendu photo, statut en temps réel.',
  },
  {
    icon: FileText,
    color: '#DC2626',
    bg: '#FEE2E2',
    title: 'Documents & Transactions',
    desc: 'Pipeline de vente Kanban, gestion des compromis, actes et commissions avec export PDF instantané.',
  },
];

const ROLES = [
  { role: 'Admin', color: '#185FA5', desc: 'Vision globale, équipe, biens, transactions, abonnement agence.' },
  { role: 'Coordinatrice', color: '#7C3AED', desc: 'Dispatch, planning agents, validation des comptes rendus.' },
  { role: 'Agent bureau', color: '#D97706', desc: 'Prospects, appels, catalogue, agenda personnel.' },
  { role: 'Agent terrain', color: '#16A34A', desc: 'Visites, comptes rendus, clients assignés, performance.' },
  { role: 'Client', color: '#0F766E', desc: 'Suivi de dossier, documents, rendez-vous.' },
];

const PLANS = [
  {
    name: 'Starter',
    price: '99',
    period: 'DT / mois',
    desc: 'Idéal pour les agences indépendantes qui démarrent.',
    features: [
      'Jusqu’à 2 agents',
      'Jusqu’à 15 biens actifs',
      'Catalogue & fiches clients',
      'Bons de visite numériques',
      'Support par email',
    ],
    highlight: false,
    cta: 'Démarrer l’essai',
  },
  {
    name: 'Pro',
    badge: 'Recommandé',
    price: '199',
    period: 'DT / mois',
    desc: 'Pour les agences en forte croissance cherchant l’efficacité.',
    features: [
      'Jusqu’à 10 agents',
      'Jusqu’à 100 biens actifs',
      'Pipeline de vente Kanban',
      'Comptes rendus photos géolocalisés',
      'Statistiques & rapports avancés',
      'Gestion électronique des documents',
      'Support prioritaire 7j/7',
    ],
    highlight: true,
    cta: 'Essai gratuit 14 jours',
  },
  {
    name: 'Entreprise',
    price: '399',
    period: 'DT / mois',
    desc: 'Pour les réseaux d’agences et grands cabinets immobiliers.',
    features: [
      'Agents & biens illimités',
      'Multi-agences & filiales',
      'Accès API & exports personnalisés',
      'Domaine personnalisé sur mesure',
      'Gestionnaire de compte dédié',
      'Formation de votre équipe offerte',
    ],
    highlight: false,
    cta: 'Contacter l’équipe',
  },
];

const STATS = [
  { value: 'Multi-Tenant', label: 'Espace sécurisé isolé', icon: Shield },
  { value: '100%', label: 'Données en direct', icon: Zap },
  { value: '14 Jours', label: 'Essai gratuit offert', icon: Sparkles },
  { value: '24/7', label: 'Accessible partout', icon: Phone },
];

// ── Main showcase & SaaS landing page ─────────────────────────────────────────
export const Login: React.FC = () => {
  const [modalMode, setModalMode] = useState<'login' | 'register' | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(dashboardPathByRole[user.role]);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Navbar ───────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b border-gray-100"
        style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm" style={{ background: '#185FA5' }}>
              <span className="text-white text-xs font-bold">IG</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base tracking-tight">ImmoGest Pro</span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                SaaS
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors font-semibold text-blue-600">Tarifs</a>
            <a href="#roles" className="hover:text-gray-900 transition-colors">Rôles</a>
            <a href="#about" className="hover:text-gray-900 transition-colors">À propos</a>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalMode('login')}
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
            >
              Se connecter
            </button>
            <button
              onClick={() => setModalMode('register')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 hover:shadow-md active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E7FC4 100%)' }}
            >
              <Sparkles size={14} className="text-amber-300" />
              Essai gratuit
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0D3B6E 0%, #185FA5 55%, #1E7FC4 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: '#F5C518' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5" style={{ background: 'white' }} />
          <div className="absolute top-1/2 left-1/3 w-px h-64 opacity-10" style={{ background: 'white' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20" style={{ background: 'rgba(255,255,255,0.1)', color: '#F5C518' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F5C518' }} />
            Plateforme SaaS de gestion immobilière moderne
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-5">
            Gérez et développez votre agence<br />
            <span style={{ color: '#F5C518' }}>en toute simplicité</span>
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Biens, clients, visites, transactions et équipe réunis dans un seul espace
            cloud ultra-sécurisé pensé pour les agences immobilières.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setModalMode('register')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: '#F5C518', color: '#0D3B6E' }}
            >
              <Sparkles size={16} /> Démarrer 14 jours gratuits <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setModalMode('login')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold border border-white/25 text-white hover:bg-white/10 transition-all"
            >
              Accéder à mon agence
            </button>
          </div>
          <div className="mt-4 text-xs text-blue-200">
            ✓ Aucune carte de crédit requise • ✓ Configuration immédiate en 30 secondes
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#DBEAFE' }}>
                <s.icon size={18} style={{ color: '#185FA5' }} />
              </div>
              <div>
                <div className="text-lg font-black text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#185FA5' }}>Fonctionnalités Clés</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-3">Tout ce dont votre agence a besoin</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Une solution tout-en-un développée pour éliminer les fichiers Excel dispersés et les relances manuelles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110" style={{ background: f.bg }}>
                <f.icon size={20} style={{ color: f.color }} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing (SaaS Plans) ─────────────────────────────────────────── */}
      <section id="pricing" className="py-20 border-t border-gray-100" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Tarifs Transparents</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-3">Des formules adaptées à votre agence</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Commencez avec 14 jours gratuits sur le forfait Pro. Passez au niveau supérieur quand votre équipe grandit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-white border-2 border-blue-600 shadow-2xl scale-105 z-10'
                    : 'bg-white border border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black text-white shadow-sm" style={{ background: '#185FA5' }}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="text-lg font-black text-gray-900">{plan.name}</div>
                  <p className="text-xs text-gray-500 mt-1 mb-5">{plan.desc}</p>

                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-gray-100">
                    <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-sm font-semibold text-gray-500">{plan.period}</span>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-gray-700">
                        <Check size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setModalMode('register')}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    plan.highlight
                      ? 'text-white hover:opacity-95'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  style={plan.highlight ? { background: 'linear-gradient(135deg, #185FA5 0%, #1E7FC4 100%)' } : {}}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ────────────────────────────────────────────────────────── */}
      <section id="roles" className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#185FA5' }}>Espaces Personnalisés</span>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-3">Une interface sur-mesure par collaborateur</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Chaque membre de votre agence accède aux outils indispensables à ses missions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ROLES.map((r) => (
            <div
              key={r.role}
              className="p-5 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-xs font-black text-white"
                style={{ background: r.color }}
              >
                {r.role[0]}
              </div>
              <div className="text-sm font-bold text-gray-900 mb-1.5">{r.role}</div>
              <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / Why ──────────────────────────────────────────────────── */}
      <section id="about" className="border-t border-gray-100 py-20" style={{ background: '#F8FAFC' }}>
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#185FA5' }}>Pourquoi ImmoGest Pro</span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-5">Conçu pour l'excellence immobilière</h2>
            <div className="space-y-4">
              {[
                'Architecture SaaS multi-tenants : isolation complète de vos données',
                'Devises en Dinars Tunisiens (DT) et formats adaptés',
                'Comptes rendus de visites terrain avec photos et géolocalisation',
                'Pipeline de vente Kanban avec étapes négociables',
                'Statistiques de performance et CA en temps réel',
                'Accessible instantanément sur smartphone, tablette et PC',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#DCFCE7' }}>
                    <CheckCircle size={12} style={{ color: '#16A34A' }} />
                  </div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100" style={{ background: 'linear-gradient(135deg, #0D3B6E 0%, #185FA5 100%)' }}>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <div className="ml-3 px-3 py-0.5 rounded text-white/40 text-xs border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    votre-agence.immogest.pro
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[['32', 'Biens actifs'], ['148', 'Clients'], ['24', 'Visites']].map(([v, l]) => (
                      <div key={l} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="text-xl font-black text-white">{v}</div>
                        <div className="text-xs text-blue-200">{l}</div>
                      </div>
                    ))}
                  </div>
                  {['Villa Carthage — 450 000 DT', 'Appart. La Marsa — 280 000 DT', 'Bureau Lac II — 1 500 DT/mois'].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ background: '#F5C518' }} />
                      <span className="text-xs text-white/80 truncate">{item}</span>
                      <Star size={11} className="ml-auto flex-shrink-0 text-yellow-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2.5 border border-gray-100">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                <Zap size={16} style={{ color: '#16A34A' }} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-900">Données en direct</div>
                <div className="text-[11px] text-gray-400">Multi-agences SaaS</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #0D3B6E 0%, #185FA5 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Prêt à propulser votre agence immobilière ?
          </h2>
          <p className="text-blue-200 text-sm mb-7 max-w-xl mx-auto">
            Rejoignez les agences qui automatisent leur gestion avec ImmoGest Pro.
          </p>
          <button
            onClick={() => setModalMode('register')}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-black shadow-xl transition-all hover:scale-[1.03] active:scale-[0.98]"
            style={{ background: '#F5C518', color: '#0D3B6E' }}
          >
            <Sparkles size={16} /> Créer mon agence gratuitement <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#185FA5' }}>
              <span className="text-white text-[8px] font-bold">IG</span>
            </div>
            <span className="font-semibold text-gray-600">ImmoGest Pro SaaS</span>
          </div>
          <span>© {new Date().getFullYear()} — Solution SaaS de gestion immobilière</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModalMode('register')}
              className="font-semibold text-blue-600 hover:underline"
            >
              Essai gratuit
            </button>
            <button
              onClick={() => setModalMode('login')}
              className="hover:text-gray-900 transition-colors"
            >
              Connexion →
            </button>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ───────────────────────────────────────────────────── */}
      {modalMode && (
        <AuthModal
          initialMode={modalMode}
          onClose={() => setModalMode(null)}
        />
      )}
    </div>
  );
};
