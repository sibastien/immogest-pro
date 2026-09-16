import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PropertyForm } from '../admin/PropertyForm';

// Shared "add a property" screen — reachable by every role (admin, agents,
// coordinatrice). Properties are stored server-side, so any bien created here
// is visible to the whole team.
export const NouveauBien: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-0 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Nouveau bien</h2>
          <p className="text-sm text-gray-400">Ajouter un bien au catalogue partagé</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
        <PropertyForm
          onSuccess={() => navigate(-1)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};
