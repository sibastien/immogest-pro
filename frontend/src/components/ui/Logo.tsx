import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'dark',
  showSubtitle = true,
  subtitle = 'CRM IMMOBILIER',
  className = '',
}) => {
  const isDark = variant === 'dark'; // dark background (e.g. sidebar), so text is white

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const subSizes = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-wider',
    lg: 'text-xs tracking-wider',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized Hexagon + Bee Emblem matching the ImmoGest Pro identity */}
      <div className={`relative ${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Hexagon outline */}
          <path
            d="M24 3.5L42.5 14.2V35.8L24 46.5L5.5 35.8V14.2L24 3.5Z"
            fill="#F5C518"
            stroke="#E0AC00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner cute bee character */}
          <g transform="translate(0, 1)">
            {/* Antennae */}
            <path
              d="M21 16C19.5 13.5 17 13.5 16 14"
              stroke="#1E2230"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="15.5" cy="14" r="1.5" fill="#1E2230" />
            
            <path
              d="M27 16C28.5 13.5 31 13.5 32 14"
              stroke="#1E2230"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="32.5" cy="14" r="1.5" fill="#1E2230" />

            {/* Wings */}
            <path
              d="M17 22C12 20 10 24 13 28C16 30 18 27 18 24"
              fill="#FFFFFF"
              fillOpacity="0.85"
              stroke="#D4A100"
              strokeWidth="1.2"
            />
            <path
              d="M31 22C36 20 38 24 35 28C32 30 30 27 30 24"
              fill="#FFFFFF"
              fillOpacity="0.85"
              stroke="#D4A100"
              strokeWidth="1.2"
            />

            {/* Bee body */}
            <ellipse cx="24" cy="25" rx="8" ry="10" fill="#1E2230" />

            {/* Yellow stripes */}
            <path
              d="M16.8 23C18.5 24.2 21.2 24.8 24 24.8C26.8 24.8 29.5 24.2 31.2 23"
              stroke="#F5C518"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M17.5 27.5C19 28.5 21.4 29 24 29C26.6 29 29 28.5 30.5 27.5"
              stroke="#F5C518"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Eyes */}
            <circle cx="21" cy="19.5" r="1.2" fill="#FFFFFF" />
            <circle cx="27" cy="19.5" r="1.2" fill="#FFFFFF" />

            {/* Stinger */}
            <path
              d="M23 35L24 37.5L25 35"
              stroke="#1E2230"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-extrabold tracking-tight flex items-baseline gap-1 ${titleSizes[size]}`}>
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            ImmoGest
          </span>
          <span className="text-[#F5C518]">
            Pro
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-semibold uppercase ${subSizes[size]} mt-0.5 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
