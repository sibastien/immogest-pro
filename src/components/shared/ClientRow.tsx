import React from 'react';
import { Phone, Mail, ChevronRight } from 'lucide-react';
import type { Client } from '../../types';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

const TYPE_LABELS: Record<Client['type'], string> = {
  acheteur: 'Acheteur',
  locataire: 'Locataire',
  proprietaire: 'Propriétaire',
};

const SOURCE_LABELS: Record<Client['source'], string> = {
  appel: 'Appel',
  web: 'Web',
  email: 'Email',
  passage: 'Passage',
  recommandation: 'Reco.',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  mubawab: 'Mubawab',
};

interface ClientRowProps {
  client: Client;
  onClick?: () => void;
}

export const ClientRow: React.FC<ClientRowProps> = ({ client, onClick }) => {
  const initials = client.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
    >
      <Avatar initials={initials} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-gray-900 truncate">{client.name}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{TYPE_LABELS[client.type]}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Phone size={11} />
            {client.phone}
          </span>
          {client.email && (
            <span className="flex items-center gap-1 hidden sm:flex">
              <Mail size={11} />
              {client.email}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400 hidden md:block">
          {SOURCE_LABELS[client.source]}
        </span>
        <Badge
          variant={
            client.status === 'actif'
              ? 'actif'
              : client.status === 'a_relancer'
              ? 'a_relancer'
              : client.status === 'compromis'
              ? 'compromis'
              : 'cloture'
          }
          size="sm"
        />
        <ChevronRight size={14} className="text-gray-300" />
      </div>
    </div>
  );
};
