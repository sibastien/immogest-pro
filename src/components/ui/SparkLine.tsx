import React from 'react';

interface SparkLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  data,
  width = 80,
  height = 32,
  color = '#185FA5',
  filled = true,
}) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * (height - 4) - 2,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
      {filled && (
        <path d={fillPath} fill={color} fillOpacity="0.12" />
      )}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2.5"
        fill={color}
      />
    </svg>
  );
};
