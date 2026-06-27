import React from 'react';
import { CallsPanel } from '../../components/CallsPanel';

export const AgentTerrainAppels: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Appels</h2>
        <p className="text-sm text-gray-400">Journal partagé de l'équipe</p>
      </div>
      <CallsPanel />
    </div>
  );
};
