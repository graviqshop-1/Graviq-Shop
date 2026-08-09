import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles, X, CheckCircle, Zap, ShieldCheck, Coins, Gift, Bell, MessageSquare, Repeat } from 'lucide-react';

export const UpdateReleaseNotesModal: React.FC = () => {
  const { updateModalOpen, setUpdateModalOpen } = useShop();

  if (!updateModalOpen) return null;

  const features = [
    {
      icon: <Coins className="w-5 h-5 text-amber-400" />,
      title: '🪙 Graviq Coins & VIP-Ränge System',
      description: 'Sammle 10 Graviq Coins pro 1,00 € Einkauf. Schalte Bronze, Silber, Gold, Platin & VIP-Legend frei für exklusive Vergünstigungen!',
    },
    {
      icon: <Gift className="w-5 h-5 text-pink-400" />,
      title: '🎁 Daily Login Bonus & Guthaben-Konto',
      description: 'Hole dir täglich 25 Coins & 0,50 € Shop-Guthaben ab. Tausche deine Graviq Coins flexibel in echtes Shop-Guthaben um!',
    },
    {
      icon: <Bell className="w-5 h-5 text-indigo-400" />,
      title: '🔔 Live Benachrichtigungs-Glocke',
      description: 'In-App Notification Center für Live-Updates, Bestellbestätigungen, Coin-Gutschriften & Support-Benachrichtigungen.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      title: '⭐ Kunden- & Support-Bewertungen',
      description: 'Bewerte gekaufte Produkte & erstelle Feedback nach Support-Schließung. Erhalte Coins als Belohnung für dein Feedback!',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-cyan-400" />,
      title: '💼 Supporter Live-Schicht & Quick-Macros',
      description: 'Präsenz-Status (Online, In Schicht, Pause) & 1-Klick Schnellantworten (Quick-Macros) für das Support-Team.',
    },
    {
      icon: <Repeat className="w-5 h-5 text-purple-400" />,
      title: '⚡ 30s Auto-Sync in Google Sheets',
      description: 'Automatische Live-Synchronisation aller Käufe, Nutzer, Reset-Codes & Logs alle 30 Sekunden direkt in Google Sheets.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-950 border border-indigo-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-purple-500 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={() => setUpdateModalOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <Zap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Update v3.2.0 ist Online! 🚀
              </h2>
              <span className="bg-amber-500 text-black font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                NEU
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Entdecke die neusten Gamification-, Supporter- & Sync-Features auf Graviq!
            </p>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
            >
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                {f.icon}
                <span>{f.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setUpdateModalOpen(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 text-white font-extrabold px-6 py-3 rounded-2xl transition-all cursor-pointer shadow-xl flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Jetzt Ausprobieren & Shop Nutzen 🎉</span>
          </button>
        </div>
      </div>
    </div>
  );
};
