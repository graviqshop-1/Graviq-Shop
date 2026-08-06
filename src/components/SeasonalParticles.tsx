import React from 'react';
import { SeasonTheme } from '../types';

interface SeasonalParticlesProps {
  season: SeasonTheme;
}

export const SeasonalParticles: React.FC<SeasonalParticlesProps> = ({ season }) => {
  if (season === 'sommer') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Sun Flare top right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-amber-400/25 via-orange-500/15 to-transparent rounded-full blur-3xl animate-sunray" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        
        {/* Glowing Summer Sun Dust & Flares */}
        {Array.from({ length: 22 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-t from-amber-300 via-orange-400 to-pink-400 opacity-60 animate-float shadow-[0_0_10px_rgba(251,191,36,0.5)]"
            style={{
              width: `${(i % 5) * 2 + 4}px`,
              height: `${(i % 5) * 2 + 4}px`,
              top: `${(i * 17) % 95}%`,
              left: `${(i * 23) % 98}%`,
              animationDuration: `${(i % 4) + 5}s`,
              animationDelay: `${(i % 3) * 1.2}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (season === 'winter') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-44 bg-gradient-to-b from-sky-500/15 to-transparent blur-2xl" />
        {/* Falling Snowflakes */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-sky-100 rounded-full blur-[0.3px] animate-snow shadow-[0_0_8px_rgba(186,230,253,0.8)]"
            style={{
              width: `${(i % 4) + 3}px`,
              height: `${(i % 4) + 3}px`,
              left: `${(i * 13) % 100}%`,
              animationDuration: `${(i % 5) + 6}s`,
              animationDelay: `${(i % 4) * 1.5}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (season === 'halloween') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />

        {/* Floating Spooky Embers */}
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-t from-orange-500 to-amber-300 opacity-50 animate-float"
            style={{
              width: `${(i % 3) * 3 + 3}px`,
              height: `${(i % 3) * 3 + 3}px`,
              top: `${(i * 19) % 90}%`,
              left: `${(i * 29) % 95}%`,
              animationDuration: `${(i % 4) + 4}s`,
              animationDelay: `${(i % 3) * 1.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // Default Standard Cyber Neon
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-grid-pattern opacity-40">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
      
      {/* Standard Cyber Neon Sparkles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-400/40 animate-pulse"
          style={{
            width: `${(i % 3) * 2 + 3}px`,
            height: `${(i % 3) * 2 + 3}px`,
            top: `${(i * 23) % 85}%`,
            left: `${(i * 31) % 90}%`,
            animationDuration: `${(i % 3) + 3}s`,
          }}
        />
      ))}
    </div>
  );
};
