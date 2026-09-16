import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from '../admin/ClientForm';

export const AgentBureauNouvelleFiche: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={15} className="text-gray-500" />
        </button>
        <div>
          <h2 className="text-base font-semibold text-gray-900">Nouvelle fiche prospect</h2>
          <p className="text-sm text-gray-400">Créer un nouveau contact client</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <ClientForm
          onSuccess={() => navigate('/agent-bureau')}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
};
