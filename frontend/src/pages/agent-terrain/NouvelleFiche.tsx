import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from '../admin/ClientForm';
import { useAuthStore } from '../../store/authStore';

export const AgentTerrainNouvelleFiche: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Nouvelle fiche client</h2>
          <p className="text-sm text-gray-400">Créer un nouveau contact</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <ClientForm
          defaultAgentId={user?.agentId}
          onSuccess={() => navigate('/agent-terrain/clients')}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};
