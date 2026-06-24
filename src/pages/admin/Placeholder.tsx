import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description?: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({
  title,
  description = 'Cette section sera développée dans une prochaine étape.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
        <Construction size={24} className="text-primary" />
      </div>
      <h2 className="text-base font-semibold text-gray-800 mb-1">{title}</h2>
      <p className="text-sm text-gray-400 max-w-xs">{description}</p>
    </div>
  );
};
