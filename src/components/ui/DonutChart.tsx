import React from 'react';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 120,
  thickness = 22,
  centerLabel,
  centerSub,
}) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  let cumulative = 0;
  const slices = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const dash = pct * circumference;
    const offset = circumference - cumulative * circumference;
    cumulative += pct;
    return { ...d, dash, offset, pct };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={thickness}
        />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset + circumference}
            strokeLinecap="butt"
          />
        ))}
        {(centerLabel || centerSub) && (
          <g style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }}>
            {centerLabel && (
              <text
                x={cx}
                y={cy - (centerSub ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fontWeight="600"
                fill="#111827"
              >
                {centerLabel}
              </text>
            )}
            {centerSub && (
              <text
                x={cx}
                y={cy + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#9CA3AF"
              >
                {centerSub}
              </text>
            )}
          </g>
        )}
      </svg>

      <div className="space-y-2 flex-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600 flex-1">{s.label}</span>
            <span className="text-xs font-medium text-gray-800">{s.value}</span>
            <span className="text-xs text-gray-400 w-9 text-right">
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
