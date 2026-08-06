import React from 'react';
import { useShop } from '../context/ShopContext';
import { S3EsportLogo } from './PartnerModal';
import { Trophy, ShieldCheck, Zap, Sparkles, Star, ArrowRight } from 'lucide-react';

export const PartnerSection: React.FC = () => {
  const { setPartnerModalOpen } = useShop();

  return (
    <section className="py-10 px-4 max-w-7xl mx-auto my-6 relative z-10">
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900/90 to-cyan-950/70 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Ambient background glow */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content & Logo */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 relative z-10 w-full md:w-auto">
          <div className="p-3 bg-slate-900/80 border border-purple-500/40 rounded-2xl shadow-xl shrink-0">
            <S3EsportLogo className="w-14 h-14 sm:w-20 sm:h-20" />
          </div>

          <div className="space-y-2.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                🤝 Official Partnership
              </span>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] sm:text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                S3 eSport x Graviq
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
              Offizielle Partnerschaft mit <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">S3 eSport</span>
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Graviq ist stolzer Hauptpartner von <strong>S3 eSport</strong>. Wir unterstützen professionelle Teams, Content Creator & Streamer mit exklusiven Live-Viewer Paketen, Vorrang-Support & Sponsoring-Programmen!
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4 text-xs text-slate-300 font-medium pt-1">
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-950/40 border border-amber-500/20 sm:bg-transparent sm:border-0 px-2.5 py-1 sm:p-0 rounded-lg">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" /> E-Sport Stream Sponsoring
              </span>
              <span className="flex items-center gap-1.5 text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 sm:bg-transparent sm:border-0 px-2.5 py-1 sm:p-0 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" /> VIP Turnier Prio-Delivery
              </span>
              <span className="flex items-center gap-1.5 text-purple-300 bg-purple-950/40 border border-purple-500/20 sm:bg-transparent sm:border-0 px-2.5 py-1 sm:p-0 rounded-lg">
                <Star className="w-4 h-4 text-purple-400 shrink-0" /> Exclusive Creator Codes
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button (Disabled / Coming Soon) */}
        <div className="shrink-0 w-full md:w-auto relative z-10 flex flex-col items-center md:items-end mt-2 md:mt-0">
          <button
            disabled
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-slate-800/90 text-slate-300 font-extrabold text-sm rounded-2xl border border-amber-500/30 cursor-not-allowed flex flex-col items-center justify-center gap-1 whitespace-nowrap shadow-lg opacity-90 select-none"
          >
            <div className="flex items-center justify-center gap-2 text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Jetzt als Partner Bewerben</span>
              <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
            </div>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-950/90 border border-amber-500/40 px-3 py-0.5 rounded-full flex items-center gap-1">
              ⏳ Bald verfügbar
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
