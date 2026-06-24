import React from 'react';

type AvatarColor = 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';

const COLOR_CLASSES: Record<AvatarColor, string> = {
  blue: 'bg-primary-light text-primary',
  green: 'bg-success-light text-success',
  amber: 'bg-warning-light text-warning',
  red: 'bg-danger-light text-danger',
  purple: 'bg-purple-light text-purple',
  gray: 'bg-gray-100 text-gray-600',
};

const STATUS_COLORS = {
  disponible: 'bg-success',
  en_visite: 'bg-primary',
  bureau: 'bg-warning',
  hors_ligne: 'bg-gray-300',
};

type SizeVariant = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SizeVariant, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-12 h-12', text: 'text-base' },
};

interface AvatarProps {
  initials: string;
  color?: AvatarColor;
  size?: SizeVariant;
  status?: keyof typeof STATUS_COLORS;
  src?: string;
}

const COLORS: AvatarColor[] = ['blue', 'green', 'amber', 'purple', 'red'];

function initialsToColor(initials: string): AvatarColor {
  const code = initials.charCodeAt(0) + (initials.charCodeAt(1) || 0);
  return COLORS[code % COLORS.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color,
  size = 'md',
  status,
  src,
}) => {
  const resolvedColor = color ?? initialsToColor(initials);
  const { container, text } = SIZE_CLASSES[size];

  return (
    <div className="relative inline-flex flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={initials}
          className={`${container} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${container} rounded-full flex items-center justify-center font-medium ${text} ${COLOR_CLASSES[resolvedColor]}`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-white ${STATUS_COLORS[status]}`}
        />
      )}
    </div>
  );
};
