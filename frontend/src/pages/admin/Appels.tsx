import React from 'react';
import { CallsPanel } from '../../components/CallsPanel';

export const AdminAppels: React.FC = () => {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Appels de l'équipe</h2>
        <p className="text-sm text-gray-400">
          Journal partagé — consultez par jour, recherchez par numéro, ou enregistrez un appel
        </p>
      </div>
      <CallsPanel />
    </div>
  );
};
