import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sliders, ShieldCheck, Zap, Star, Users, Flame, Play, Eye } from 'lucide-react';
import { PlatformId } from '../types';

interface HeroSectionProps {
  onOpenLiveSlider: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenLiveSlider }) => {
  const { activePlatform, setActivePlatform, shopSettings } = useShop();

  const platformTitles: Record<PlatformId, string> = {
    twitch: 'Twitch Follower & Live Zuschauer',
    tiktok: 'TikTok Follower, Likes & Views',
    youtube: 'YouTube Abonnenten & High Retention Views',
    instagram: 'Instagram HQ Follower & Likes',
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-20 bg-slate-950 border-b border-slate-900">
      {/* Background glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-600/15 via-cyan-500/15 to-pink-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Live Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold mb-6 shadow-lg shadow-purple-950/40">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300">
              <strong className="text-emerald-400 font-extrabold">100% Live Delivery</strong> — Über 1.450.000+ Stream-Boosts geliefert
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-6">
            Bringe Deinen Stream & Content auf{' '}
            <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              Das Nächste Level
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-xl font-normal leading-relaxed mb-8">
            Der führende Premium-Service für <strong className="text-slate-200">Twitch, TikTok, YouTube & Instagram</strong>.
            Nutze unseren interaktiven <span className="text-cyan-400 font-bold">Live-Zuschauer Schieberegler</span> für flexible Mengen & Minuten-Garantie!
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onOpenLiveSlider}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-base px-8 py-4 rounded-2xl shadow-xl shadow-purple-900/40 hover:shadow-cyan-900/50 transition-all cursor-pointer transform hover:-translate-y-0.5 border border-purple-400/30"
            >
              <Sliders className="w-5 h-5 text-cyan-200 animate-bounce" />
              <span>Interaktiven Zuschauern Slider Öffnen</span>
            </button>

            <a
              href="#packages"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-base px-6 py-4 rounded-2xl border border-slate-800 transition-colors cursor-pointer"
            >
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Pakete Durchsuchen</span>
            </a>
          </div>

          {/* Platform Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(['twitch', 'tiktok', 'youtube', 'instagram'] as PlatformId[]).map((p) => {
              const active = activePlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    active
                      ? 'bg-purple-950/80 text-purple-200 border-purple-500 shadow-lg shadow-purple-950/50 scale-105'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="text-sm">
                    {p === 'twitch' && '👾'}
                    {p === 'tiktok' && '🎵'}
                    {p === 'youtube' && '▶️'}
                    {p === 'instagram' && '📸'}
                  </span>
                  <span className="capitalize">{platformTitles[p]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Express Delivery</h4>
              <p className="text-slate-400 text-[11px]">Start in 2-5 Minuten</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">100% Sicher</h4>
              <p className="text-slate-400 text-[11px]">Kein Passwort nötig</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">Top Qualität</h4>
              <p className="text-slate-400 text-[11px]">HQ Echte Profile</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs font-bold">24/7 Support</h4>
              <p className="text-slate-400 text-[11px]">Deutscher Kundenservice</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
