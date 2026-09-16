import React from 'react';

interface BarDataPoint {
  label: string;
  value: number;
  value2?: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  color?: string;
  color2?: string;
  label?: string;
  label2?: string;
  formatValue?: (v: number) => string;
  showGrid?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 160,
  color = '#185FA5',
  color2,
  label,
  label2,
  formatValue = (v) => String(v),
  showGrid = true,
}) => {
  const max = Math.max(...data.flatMap((d) => [d.value, d.value2 ?? 0]));
  const padded = max * 1.15;
  const barWidth = color2 ? 8 : 16;
  const gap = color2 ? 4 : 8;
  const groupW = color2 ? barWidth * 2 + gap : barWidth;
  const paddingX = 8;
  const paddingY = 12;
  const chartH = height - paddingY * 2;
  const totalW = data.length * (groupW + 12) + paddingX * 2;

  const toY = (v: number) => chartH - (v / padded) * chartH + paddingY;

  const gridLines = [0.25, 0.5, 0.75, 1].map((p) => ({
    y: toY(p * padded),
    label: formatValue(Math.round(p * padded)),
  }));

  return (
    <div className="w-full">
      {(label || label2) && (
        <div className="flex items-center gap-4 mb-3">
          {label && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
              {label}
            </span>
          )}
          {label2 && color2 && (
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color2 }} />
              {label2}
            </span>
          )}
        </div>
      )}
      <svg
        viewBox={`0 0 ${totalW} ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
        aria-hidden
      >
        {/* Grid */}
        {showGrid &&
          gridLines.map((g, i) => (
            <line
              key={i}
              x1={paddingX}
              y1={g.y}
              x2={totalW - paddingX}
              y2={g.y}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingX + i * (groupW + 12);
          const barH1 = Math.max(2, (d.value / padded) * chartH);
          const barH2 = d.value2 ? Math.max(2, (d.value2 / padded) * chartH) : 0;

          return (
            <g key={i}>
              {/* Bar 1 */}
              <rect
                x={x}
                y={toY(d.value)}
                width={barWidth}
                height={barH1}
                rx="3"
                fill={color}
                opacity={0.9}
              />
              {/* Bar 2 */}
              {d.value2 !== undefined && color2 && (
                <rect
                  x={x + barWidth + gap}
                  y={toY(d.value2)}
                  width={barWidth}
                  height={barH2}
                  rx="3"
                  fill={color2}
                  opacity={0.85}
                />
              )}
              {/* Label */}
              <text
                x={x + groupW / 2}
                y={height - 1}
                textAnchor="middle"
                fontSize="10"
                fill="#9CA3AF"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
