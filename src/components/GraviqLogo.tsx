import React from 'react';
import { SeasonTheme } from '../types';

interface GraviqLogoProps {
  season?: SeasonTheme;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const GraviqLogo: React.FC<GraviqLogoProps> = ({
  season = 'sommer',
  size = 'md',
  animated = true,
}) => {
  const sizeClasses = {
    sm: 'h-8 text-lg gap-2',
    md: 'h-10 text-xl gap-2.5',
    lg: 'h-14 text-2xl gap-3',
    xl: 'h-20 text-4xl gap-4',
  };

  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  };

  const getSeasonalColors = () => {
    switch (season) {
      case 'sommer':
        return {
          primary: '#f59e0b', // Amber / Gold
          secondary: '#ec4899', // Pink
          accent: '#06b6d4', // Cyan ocean
          gradient: 'from-amber-400 via-pink-500 to-cyan-400',
          badgeText: '☀️ Sommer Event',
        };
      case 'winter':
        return {
          primary: '#38bdf8', // Ice Blue
          secondary: '#818cf8', // Indigo
          accent: '#e0e7ff', // Snow white
          gradient: 'from-sky-400 via-indigo-400 to-white',
          badgeText: '❄️ Winter Sale',
        };
      case 'halloween':
        return {
          primary: '#f97316', // Orange
          secondary: '#a855f7', // Purple
          accent: '#22c55e', // Toxic green
          gradient: 'from-orange-500 via-purple-600 to-emerald-500',
          badgeText: '🎃 Spooky Event',
        };
      case 'default':
      default:
        return {
          primary: '#8b5cf6', // Electric Purple
          secondary: '#06b6d4', // Cyan
          accent: '#ec4899', // Magenta
          gradient: 'from-purple-500 via-cyan-400 to-pink-500',
          badgeText: '⚡ Graviq Pro',
        };
    }
  };

  const colors = getSeasonalColors();
  const pxSize = iconSizes[size];

  return (
    <div className={`inline-flex items-center ${sizeClasses[size]} font-extrabold tracking-tight group cursor-pointer select-none`}>
      <div className="relative flex items-center justify-center">
        {/* Animated Glow Backdrop */}
        <div
          className={`absolute inset-0 rounded-xl filter blur-md opacity-70 ${
            animated ? 'animate-pulse-glow' : ''
          }`}
          style={{
            background: `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 70%, transparent 100%)`,
          }}
        />

        {/* SVG Logo Mark */}
        <svg
          width={pxSize}
          height={pxSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id={`graviq-grad-${season}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.primary} />
              <stop offset="50%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.accent} />
            </linearGradient>

            <filter id={`glow-${season}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Shield / Diamond Polygon */}
          <polygon
            points="50,5 92,28 92,72 50,95 8,72 8,28"
            fill="#0b0f19"
            stroke={`url(#graviq-grad-${season})`}
            strokeWidth="5"
            strokeLinejoin="round"
          />

          {/* Inner Geometric G / Q Stylized Shape */}
          <path
            d="M32 35 C32 25, 68 25, 68 35 L68 50 C68 62, 58 65, 50 65 C42 65, 32 62, 32 50 Z"
            fill="none"
            stroke={`url(#graviq-grad-${season})`}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Core Energy Bolt */}
          <path
            d="M52 38 L42 52 L54 52 L46 68"
            fill="none"
            stroke={colors.accent}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#glow-${season})`}
          />

          {/* Seasonal Decor Overlay */}
          {season === 'sommer' && (
            <g className="animate-spin" style={{ transformOrigin: '78px 22px', animationDuration: '15s' }}>
              <circle cx="78" cy="22" r="8" fill="#f59e0b" opacity="0.9" />
              <line x1="78" y1="10" x2="78" y2="6" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="78" y1="34" x2="78" y2="38" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="66" y1="22" x2="62" y2="22" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="90" y1="22" x2="94" y2="22" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {season === 'winter' && (
            <g>
              <path d="M50 2 L50 14 M44 8 L56 8 M46 4 L54 12 M46 12 L54 4" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}

          {season === 'halloween' && (
            <g>
              <path d="M72 18 L76 26 L68 26 Z" fill="#f97316" />
            </g>
          )}
        </svg>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent drop-shadow-sm`}>
            GRAVIQ
          </span>
          <span className="text-white font-medium opacity-90">SHOP</span>
        </div>
      </div>
    </div>
  );
};
