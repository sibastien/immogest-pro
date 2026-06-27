import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore, dashboardPathByRole } from '../../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      const role = useAuthStore.getState().user?.role;
      if (role) navigate(dashboardPathByRole[role]);
    } else {
      setError(result.error ?? 'Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-light flex flex-col items-center justify-center p-4 py-8">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl font-bold">IG</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">ImmoGest Pro</h1>
        <p className="text-gray-500 text-sm mt-1">Connexion à votre espace</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Login form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.tn"
              required
              autoComplete="off"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe / Code d'accès
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
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

          <p className="text-xs text-gray-400 text-center pt-1">
            Agents et clients : connectez-vous avec l'email et le code d'accès
            fournis par votre administrateur.
          </p>
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-6">ImmoGest Pro v1.0</p>
    </div>
  );
};
