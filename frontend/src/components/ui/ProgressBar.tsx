import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  size?: 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
}

const COLOR_CLASSES = {
  blue: 'bg-primary',
  green: 'bg-success',
  amber: 'bg-warning',
  red: 'bg-danger',
  purple: 'bg-purple',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
  showLabel = false,
  label,
}) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  const height = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-500">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-gray-700">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-300 ${COLOR_CLASSES[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
