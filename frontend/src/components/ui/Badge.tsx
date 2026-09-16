import React from 'react';

type BadgeVariant =
  | 'disponible'
  | 'sous_compromis'
  | 'loue'
  | 'vendu'
  | 'actif'
  | 'a_relancer'
  | 'compromis'
  | 'cloture'
  | 'urgent'
  | 'info'
  | 'gray'
  | 'purple';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  disponible: 'bg-success-light text-success',
  actif: 'bg-success-light text-success',
  sous_compromis: 'bg-warning-light text-warning',
  a_relancer: 'bg-warning-light text-warning',
  loue: 'bg-gray-100 text-gray-500',
  vendu: 'bg-gray-100 text-gray-500',
  cloture: 'bg-gray-100 text-gray-500',
  compromis: 'bg-primary-light text-primary',
  info: 'bg-primary-light text-primary',
  urgent: 'bg-danger-light text-danger',
  purple: 'bg-purple-light text-purple',
  gray: 'bg-gray-100 text-gray-600',
};

const VARIANT_LABELS: Partial<Record<BadgeVariant, string>> = {
  disponible: 'Disponible',
  sous_compromis: 'Sous compromis',
  loue: 'Loué',
  vendu: 'Vendu',
  actif: 'Actif',
  a_relancer: 'À relancer',
  compromis: 'Compromis',
  cloture: 'Clôturé',
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant, label, size = 'md', dot = false }) => {
  const displayLabel = label ?? VARIANT_LABELS[variant] ?? variant;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${VARIANT_CLASSES[variant]}`}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      )}
      {displayLabel}
    </span>
  );
};
