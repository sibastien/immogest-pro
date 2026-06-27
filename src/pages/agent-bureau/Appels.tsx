import React from 'react';
import { CallsPanel } from '../../components/CallsPanel';

export const AgentBureauAppels: React.FC = () => {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Journal des appels</h2>
        <p className="text-sm text-gray-400">
          Journal partagé de l'équipe — recherchez par numéro, consultez par jour, enregistrez un appel
        </p>
      </div>
      <CallsPanel />
    </div>
  );
};
