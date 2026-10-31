import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Building2, Users, TrendingUp, ArrowRight,
  Sparkles, Check, Shield, ChevronRight, Home, Phone,
  BarChart3, Lock, Mail, User, Briefcase
} from 'lucide-react';
import { useAuthStore, dashboardPathByRole } from '../../store/authStore';

// ── Animated stat counter ─────────────────────────────────────────────────────
const StatCard: React.FC<{ icon: React.ElementType; value: string; label: string; delay?: number }> = ({
  icon: Icon, value, label, delay = 0,
}) => (
  <div
    className="stat-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="stat-icon">
      <Icon size={15} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

// ── Main Login / Register page ─────────────────────────────────────────────────
export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register state
  const [agencyName, setAgencyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(dashboardPathByRole[user.role], { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    setError('');
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (result.success) {
      const role = useAuthStore.getState().user?.role;
      if (role) navigate(dashboardPathByRole[role], { replace: true });
    } else {
      setError(result.error ?? 'Identifiants incorrects. Réessayez.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName || !adminName || !registerEmail || registerPassword.length < 6) return;
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
      navigate('/admin', { replace: true });
    } else {
      setError(result.error ?? 'Erreur lors de la création du compte.');
    }
  };

  const loginValid = loginEmail.includes('@') && loginPassword.length >= 1;
  const registerValid = agencyName.trim().length >= 2 && adminName.trim().length >= 2
    && registerEmail.includes('@') && registerPassword.length >= 6;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', system-ui, sans-serif;
          background: #F0F4FA;
        }

        /* ── Left panel ───────────────────────────────────────────────── */
        .panel-left {
          display: none;
          flex: 1;
          position: relative;
          overflow: hidden;
          background: linear-gradient(145deg, #071D3A 0%, #0D3B6E 45%, #185FA5 100%);
          padding: 48px 44px;
          flex-direction: column;
          justify-content: space-between;
        }
        @media (min-width: 1024px) { .panel-left { display: flex; } }

        /* Geometric decorations */
        .panel-left::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .panel-left::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 320px; height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30,127,196,0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .panel-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .panel-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .panel-logo-mark {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #F5C518 0%, #E8A800 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; font-weight: 900; color: #0D3B6E;
          box-shadow: 0 4px 16px rgba(245,197,24,0.35);
          flex-shrink: 0;
        }
        .panel-logo-name {
          font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.3px;
        }
        .panel-logo-sub {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.05em; text-transform: uppercase;
        }

        .panel-body {
          position: relative; z-index: 1; flex: 1;
          display: flex; flex-direction: column; justify-content: center;
          padding: 20px 0;
        }
        .panel-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,197,24,0.15);
          border: 1px solid rgba(245,197,24,0.25);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 11px; font-weight: 700;
          color: #F5C518; letter-spacing: 0.06em; text-transform: uppercase;
          width: fit-content; margin-bottom: 20px;
        }
        .panel-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #F5C518;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .panel-headline {
          font-size: 36px; font-weight: 900; color: #fff;
          line-height: 1.15; letter-spacing: -0.8px;
          margin-bottom: 14px;
        }
        .panel-headline span { color: #F5C518; }

        .panel-sub {
          font-size: 14px; color: rgba(255,255,255,0.55);
          line-height: 1.65; max-width: 360px; margin-bottom: 36px;
        }

        /* Feature list */
        .feature-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 40px; }
        .feature-item {
          display: flex; align-items: center; gap: 12px;
        }
        .feature-check {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(245,197,24,0.15);
          border: 1px solid rgba(245,197,24,0.3);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .feature-text { font-size: 13px; color: rgba(255,255,255,0.75); font-weight: 500; }

        /* Stats */
        .stats-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
        }
        .stat-card {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 14px 16px;
          backdrop-filter: blur(12px);
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to { opacity:1; transform:translateY(0); }
        }
        .stat-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(245,197,24,0.15);
          border: 1px solid rgba(245,197,24,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #F5C518; flex-shrink: 0;
        }
        .stat-value { font-size: 15px; font-weight: 800; color: #fff; }
        .stat-label { font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 500; }

        /* Panel footer */
        .panel-footer { position: relative; z-index: 1; }
        .panel-footer-text {
          font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 500;
        }

        /* ── Right panel (form) ────────────────────────────────────────── */
        .panel-right {
          display: flex; flex: 0 0 100%;
          align-items: center; justify-content: center;
          padding: 24px 16px;
          min-height: 100vh;
        }
        @media (min-width: 1024px) { .panel-right { flex: 0 0 480px; } }

        .form-card {
          width: 100%; max-width: 420px;
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(13,59,110,0.12), 0 4px 16px rgba(13,59,110,0.06);
          overflow: hidden;
        }

        /* Mobile logo */
        .mobile-logo {
          display: flex; align-items: center; justify-content: center;
          gap: 10px; padding: 28px 28px 0;
        }
        @media (min-width: 1024px) { .mobile-logo { display: none; } }
        .mobile-logo-mark {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #0D3B6E 0%, #185FA5 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 900; color: #fff;
        }
        .mobile-logo-name { font-size: 18px; font-weight: 800; color: #0D3B6E; }

        /* Tabs */
        .tabs-wrap { padding: 20px 24px 0; }
        .tabs {
          display: flex;
          background: #F1F5FB;
          border-radius: 12px;
          padding: 4px;
        }
        .tab {
          flex: 1; padding: 9px 6px;
          border: none; border-radius: 9px; cursor: pointer;
          font-size: 13px; font-weight: 700;
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: transparent; color: #8A9AB5;
        }
        .tab.active {
          background: #fff;
          color: #0D3B6E;
          box-shadow: 0 2px 8px rgba(13,59,110,0.1);
        }

        /* Form area */
        .form-body { padding: 20px 24px 28px; }

        .form-title { font-size: 20px; font-weight: 800; color: #0D3B6E; margin-bottom: 4px; }
        .form-subtitle { font-size: 13px; color: #8A9AB5; margin-bottom: 20px; }

        /* Trial badge */
        .trial-badge {
          display: flex; align-items: center; gap: 10px;
          background: linear-gradient(135deg, #EFF8FF 0%, #F0F9FF 100%);
          border: 1px solid #BFDBFE;
          border-radius: 12px; padding: 10px 14px;
          margin-bottom: 18px;
        }
        .trial-badge-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: #DBEAFE; display: flex;
          align-items: center; justify-content: center;
          color: #185FA5; flex-shrink: 0;
        }
        .trial-badge-text { font-size: 12px; color: #1E40AF; }
        .trial-badge-text strong { font-weight: 700; }

        /* Field */
        .field { margin-bottom: 14px; }
        .field-label {
          display: block;
          font-size: 12px; font-weight: 700; color: #374151;
          margin-bottom: 5px;
        }
        .field-input-wrap { position: relative; }
        .field-input {
          width: 100%; padding: 10px 14px 10px 38px;
          border: 1.5px solid #E5EAF2;
          border-radius: 10px;
          font-size: 14px; color: #111827;
          background: #FAFBFC;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .field-input::placeholder { color: #B4BFCC; }
        .field-input:focus {
          border-color: #185FA5;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(24,95,165,0.1);
        }
        .field-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: #B4BFCC; pointer-events: none;
        }
        .field-input:focus ~ .field-icon, .field-input-wrap:focus-within .field-icon {
          color: #185FA5;
        }
        .toggle-pass {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #B4BFCC; padding: 4px;
          display: flex; align-items: center;
          transition: color 0.2s;
        }
        .toggle-pass:hover { color: #185FA5; }

        /* 2-col grid */
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* Error / success */
        .alert {
          border-radius: 10px; padding: 10px 13px;
          font-size: 12px; font-weight: 600;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .alert-error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; }
        .alert-success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; }

        /* Submit */
        .btn-submit {
          width: 100%; padding: 12px;
          border: none; border-radius: 12px;
          font-size: 14px; font-weight: 800;
          color: #fff; cursor: pointer;
          background: linear-gradient(135deg, #0D3B6E 0%, #185FA5 100%);
          box-shadow: 0 4px 16px rgba(13,59,110,0.25);
          transition: all 0.2s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .btn-submit:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(13,59,110,0.35);
          transform: translateY(-1px);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        /* Switch mode */
        .switch-link {
          text-align: center; margin-top: 14px;
          font-size: 12px; color: #8A9AB5;
        }
        .switch-link button {
          background: none; border: none; cursor: pointer;
          color: #185FA5; font-weight: 700; font-size: 12px;
          margin-left: 4px; padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .switch-link button:hover { text-decoration: underline; }

        /* Security badge */
        .security-strip {
          border-top: 1px solid #F1F5FB;
          padding: 10px 24px 16px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          color: #B4BFCC; font-size: 11px; font-weight: 600;
        }
        .security-strip span { color: #C6D2E0; }

        /* spinner */
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Password strength */
        .pw-strength { display: flex; gap: 4px; margin-top: 5px; }
        .pw-bar {
          height: 3px; flex: 1; border-radius: 2px;
          background: #E5EAF2; transition: background 0.3s;
        }
        .pw-bar.weak { background: #EF4444; }
        .pw-bar.medium { background: #F59E0B; }
        .pw-bar.strong { background: #10B981; }
      `}</style>

      <div className="login-root">
        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <div className="panel-left">
          <div className="panel-grid" />

          {/* Logo */}
          <div className="panel-logo">
            <div className="panel-logo-mark">IG</div>
            <div>
              <div className="panel-logo-name">ImmoGest Pro</div>
              <div className="panel-logo-sub">Plateforme CRM Immobilier</div>
            </div>
          </div>

          {/* Body */}
          <div className="panel-body">
            <div className="panel-eyebrow">
              <span className="panel-eyebrow-dot" />
              Agences Immobilières
            </div>

            <h1 className="panel-headline">
              Votre agence,<br />
              <span>pilotée avec précision</span>
            </h1>

            <p className="panel-sub">
              Gérez vos biens, votre équipe, vos clients et vos transactions
              depuis un espace cloud sécurisé, conçu pour les professionnels de l'immobilier.
            </p>

            <div className="feature-list">
              {[
                'Catalogue de biens avec publication instantanée',
                'CRM clients — prospects, pipeline, relances',
                'Agenda & planification des visites terrain',
                'Rapports de performance en temps réel',
                'Gestion documentaire & transactions Kanban',
              ].map((f) => (
                <div key={f} className="feature-item">
                  <div className="feature-check">
                    <Check size={11} color="#F5C518" strokeWidth={3} />
                  </div>
                  <span className="feature-text">{f}</span>
                </div>
              ))}
            </div>

            <div className="stats-grid">
              <StatCard icon={Building2} value="Multi-tenant" label="Données isolées" delay={0} />
              <StatCard icon={Shield} value="100% Sécurisé" label="Chiffrement JWT" delay={80} />
              <StatCard icon={TrendingUp} value="Temps réel" label="Tableau de bord live" delay={160} />
              <StatCard icon={Users} value="Multi-rôles" label="Admin · Agent · Client" delay={240} />
            </div>
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <p className="panel-footer-text">© {new Date().getFullYear()} ImmoGest Pro — Solution SaaS immobilière</p>
          </div>
        </div>

        {/* ── RIGHT PANEL (form) ───────────────────────────────────────── */}
        <div className="panel-right">
          <div className="form-card">

            {/* Mobile logo (only on small screens) */}
            <div className="mobile-logo">
              <div className="mobile-logo-mark">IG</div>
              <div className="mobile-logo-name">ImmoGest Pro</div>
            </div>

            {/* Tabs */}
            <div className="tabs-wrap">
              <div className="tabs" role="tablist">
                <button
                  role="tab"
                  className={`tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => switchMode('login')}
                  aria-selected={mode === 'login'}
                >
                  <Lock size={13} />
                  Se connecter
                </button>
                <button
                  role="tab"
                  className={`tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => switchMode('register')}
                  aria-selected={mode === 'register'}
                >
                  <Sparkles size={13} />
                  Créer mon agence
                </button>
              </div>
            </div>

            {/* Form body */}
            <div className="form-body">
              {/* Error */}
              {error && (
                <div className="alert alert-error" role="alert">
                  <span>⚠</span> {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  <span>✓</span> {success}
                </div>
              )}

              {/* ── LOGIN FORM ── */}
              {mode === 'login' && (
                <>
                  <div className="form-title">Bon retour 👋</div>
                  <div className="form-subtitle">Accédez à votre espace de gestion immobilière</div>

                  <form onSubmit={handleLogin} autoComplete="off" noValidate>
                    <div className="field">
                      <label className="field-label" htmlFor="login-email">Adresse email</label>
                      <div className="field-input-wrap">
                        <Mail size={14} className="field-icon" />
                        <input
                          id="login-email"
                          type="email"
                          className="field-input"
                          placeholder="admin@votre-agence.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          autoComplete="off"
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label" htmlFor="login-password">Mot de passe / Code d'accès</label>
                      <div className="field-input-wrap">
                        <Lock size={14} className="field-icon" />
                        <input
                          id="login-password"
                          type={showLoginPass ? 'text' : 'password'}
                          className="field-input"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          autoComplete="new-password"
                          style={{ paddingRight: '38px' }}
                        />
                        <button
                          type="button"
                          className="toggle-pass"
                          onClick={() => setShowLoginPass(!showLoginPass)}
                          aria-label={showLoginPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button
                      id="btn-login-submit"
                      type="submit"
                      className="btn-submit"
                      disabled={loading || !loginValid}
                    >
                      {loading ? (
                        <><span className="spinner" /> Connexion…</>
                      ) : (
                        <>Accéder à mon espace <ArrowRight size={15} /></>
                      )}
                    </button>
                  </form>

                  <div className="switch-link">
                    Pas encore d'agence ?
                    <button type="button" onClick={() => switchMode('register')}>
                      Créer un compte (14j gratuits)
                    </button>
                  </div>
                </>
              )}

              {/* ── REGISTER FORM ── */}
              {mode === 'register' && (
                <>
                  <div className="form-title">Créer votre agence</div>
                  <div className="form-subtitle">Démarrez votre essai gratuit — aucune carte requise</div>

                  <div className="trial-badge">
                    <div className="trial-badge-icon">
                      <Sparkles size={14} />
                    </div>
                    <div className="trial-badge-text">
                      <strong>Essai gratuit 14 jours</strong> — accès complet, sans engagement
                    </div>
                  </div>

                  <form onSubmit={handleRegister} autoComplete="off" noValidate>
                    <div className="field">
                      <label className="field-label" htmlFor="reg-agency">Nom de votre agence *</label>
                      <div className="field-input-wrap">
                        <Home size={14} className="field-icon" />
                        <input
                          id="reg-agency"
                          type="text"
                          className="field-input"
                          placeholder="Ex: Carthage Prestige Immobilier"
                          value={agencyName}
                          onChange={(e) => setAgencyName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="field-grid">
                      <div className="field">
                        <label className="field-label" htmlFor="reg-name">Votre nom *</label>
                        <div className="field-input-wrap">
                          <User size={14} className="field-icon" />
                          <input
                            id="reg-name"
                            type="text"
                            className="field-input"
                            placeholder="Prénom Nom"
                            value={adminName}
                            onChange={(e) => setAdminName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label className="field-label" htmlFor="reg-phone">Téléphone</label>
                        <div className="field-input-wrap">
                          <Phone size={14} className="field-icon" />
                          <input
                            id="reg-phone"
                            type="tel"
                            className="field-input"
                            placeholder="+216 71 000 000"
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label" htmlFor="reg-email">Email professionnel *</label>
                      <div className="field-input-wrap">
                        <Mail size={14} className="field-icon" />
                        <input
                          id="reg-email"
                          type="email"
                          className="field-input"
                          placeholder="contact@votre-agence.com"
                          value={registerEmail}
                          onChange={(e) => setRegisterEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="field-label" htmlFor="reg-password">Mot de passe administrateur *</label>
                      <div className="field-input-wrap">
                        <Lock size={14} className="field-icon" />
                        <input
                          id="reg-password"
                          type={showRegPass ? 'text' : 'password'}
                          className="field-input"
                          placeholder="Au moins 6 caractères"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          minLength={6}
                          required
                          style={{ paddingRight: '38px' }}
                        />
                        <button
                          type="button"
                          className="toggle-pass"
                          onClick={() => setShowRegPass(!showRegPass)}
                          aria-label={showRegPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showRegPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {/* Password strength indicator */}
                      {registerPassword.length > 0 && (
                        <div className="pw-strength" aria-hidden="true">
                          {[0, 1, 2, 3].map((i) => {
                            const strength = registerPassword.length < 6 ? 1 : registerPassword.length < 10 ? 2 : 3;
                            const cls = i < strength ? (strength === 1 ? 'weak' : strength === 2 ? 'medium' : 'strong') : '';
                            return <div key={i} className={`pw-bar ${cls}`} />;
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      id="btn-register-submit"
                      type="submit"
                      className="btn-submit"
                      disabled={loading || !registerValid}
                      style={{ background: 'linear-gradient(135deg, #185FA5 0%, #1E7FC4 100%)' }}
                    >
                      {loading ? (
                        <><span className="spinner" /> Création de votre agence…</>
                      ) : (
                        <>Démarrer mon agence <ArrowRight size={15} /></>
                      )}
                    </button>
                  </form>

                  <div className="switch-link">
                    Déjà un compte ?
                    <button type="button" onClick={() => switchMode('login')}>
                      Se connecter
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Security strip */}
            <div className="security-strip">
              <Shield size={12} />
              <span>Connexion chiffrée · Données isolées par agence · Hébergé en sécurité</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
