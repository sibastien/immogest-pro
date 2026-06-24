import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, Users, Phone, MapPin, User } from 'lucide-react';
import { useAuthStore, dashboardPathByRole } from '../../store/authStore';
import type { Role } from '../../types';

interface RoleOption {
  role: Role;
  label: string;
  description: string;
  icon: React.FC<{ size?: number; className?: string }>;
  email: string;
  color: string;
  borderColor: string;
  bgColor: string;
  iconBg: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'admin',
    label: 'Administrateur',
    description: 'Accès complet — gestion globale',
    icon: Shield,
    email: 'admin@immogest.tn',
    color: 'text-primary',
    borderColor: 'border-primary',
    bgColor: 'bg-primary-light',
    iconBg: 'bg-primary',
  },
  {
    role: 'coordinatrice',
    label: 'Coordinatrice',
    description: 'Dispatch, planning, validation C.R.',
    icon: Users,
    email: 'coordinatrice@immogest.tn',
    color: 'text-purple',
    borderColor: 'border-purple',
    bgColor: 'bg-purple-light',
    iconBg: 'bg-purple',
  },
  {
    role: 'agent_bureau',
    label: 'Agent bureau',
    description: 'Prospects, appels, fiches clients',
    icon: Phone,
    email: 'bureau@immogest.tn',
    color: 'text-primary',
    borderColor: 'border-primary',
    bgColor: 'bg-primary-light',
    iconBg: 'bg-primary',
  },
  {
    role: 'agent_terrain',
    label: 'Agent terrain',
    description: 'Visites, comptes-rendus sur mobile',
    icon: MapPin,
    email: 'terrain@immogest.tn',
    color: 'text-success',
    borderColor: 'border-success',
    bgColor: 'bg-success-light',
    iconBg: 'bg-success',
  },
  {
    role: 'client',
    label: 'Client',
    description: 'Suivi dossier, documents, rendez-vous',
    icon: User,
    email: 'client@immogest.tn',
    color: 'text-warning',
    borderColor: 'border-warning',
    bgColor: 'bg-warning-light',
    iconBg: 'bg-warning',
  },
];

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (option: RoleOption) => {
    setSelectedRole(option.role);
    setEmail(option.email);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const role = ROLE_OPTIONS.find((r) => r.email === email)?.role;
      if (role) navigate(dashboardPathByRole[role]);
    } else {
      setError(result.error ?? 'Erreur de connexion');
    }
  };

  const selectedOption = ROLE_OPTIONS.find((r) => r.role === selectedRole);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl font-bold">IG</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">ImmoGest Pro</h1>
        <p className="text-gray-500 text-sm mt-1">Connexion à votre espace</p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Role selection */}
        <div className="p-6 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-4">Sélectionnez votre profil</p>
          <div className="grid grid-cols-5 gap-2">
            {ROLE_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRole === option.role;
              return (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => handleRoleSelect(option)}
                  className={[
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center',
                    isSelected
                      ? `${option.borderColor} ${option.bgColor}`
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? option.iconBg : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={isSelected ? 'text-white' : 'text-gray-400'}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-xs font-medium leading-tight ${
                        isSelected ? option.color : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {selectedOption && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              {selectedOption.description}
            </p>
          )}
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.tn"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
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

          {error && (
            <div className="px-3 py-2 bg-danger-light border border-danger/20 rounded-lg">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>

          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 border-t border-gray-100" />
            <span className="text-xs text-gray-400">Comptes de démo</span>
            <div className="flex-1 border-t border-gray-100" />
          </div>

          <div className="grid grid-cols-1 gap-1">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.role}
                type="button"
                onClick={() => {
                  setEmail(opt.email);
                  setPassword('demo');
                  setSelectedRole(opt.role);
                  setError('');
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xs font-mono text-gray-500 w-52">{opt.email}</span>
                <span className="text-xs text-gray-400">— {opt.label}</span>
              </button>
            ))}
          </div>
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        ImmoGest Pro v1.0 · Mot de passe démo : <span className="font-mono">demo</span>
      </p>
    </div>
  );
};
