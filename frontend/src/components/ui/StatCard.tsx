import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  subtitle?: string;
}

const COLOR_CLASSES = {
  blue: { bg: 'bg-primary-light', icon: 'text-primary', value: 'text-primary' },
  green: { bg: 'bg-success-light', icon: 'text-success', value: 'text-success' },
  amber: { bg: 'bg-warning-light', icon: 'text-warning', value: 'text-warning' },
  red: { bg: 'bg-danger-light', icon: 'text-danger', value: 'text-danger' },
  purple: { bg: 'bg-purple-light', icon: 'text-purple', value: 'text-purple' },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  subtitle,
}) => {
  const colors = COLOR_CLASSES[color];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon size={20} className={colors.icon} />
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.positive !== false ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
            }`}
          >
            {trend.value > 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl font-semibold ${colors.value}`}>{value}</div>
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
        {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
};
