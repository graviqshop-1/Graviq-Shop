import React from 'react';
import { useShop } from '../context/ShopContext';
import { Wrench, ShieldAlert, MessageCircle, Lock, Crown, Headphones, Sparkles } from 'lucide-react';

export const MaintenanceOverlay: React.FC = () => {
  const { shopSettings, currentUser, setAuthModalOpen, setAuthModalView } = useShop();

  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'support' || currentUser.role === 'team_graviq');

  if (!shopSettings.isMaintenanceMode) {
    return null;
  }

  // If staff member is logged in, do not block screen with overlay, let them view the site
  if (isStaff) {
    return null;
  }

  const handleOpenStaffLogin = () => {
    setAuthModalView('login');
    setAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar Logo */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-600 to-cyan-500 p-2.5 rounded-2xl shadow-lg shadow-purple-500/20">
            <Wrench className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block">
              GRAVIQ <span className="text-purple-400">x S3 eSport</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
              Live Stream & Esport Boosting Console
            </span>
          </div>
        </div>

        {/* Staff Login Trigger */}
        <button
          onClick={handleOpenStaffLogin}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:border-slate-700"
        >
          <Lock className="w-3.5 h-3.5 text-purple-400" />
          <span>Team & Admin Login</span>
        </button>
      </div>

      {/* Main Content Center Card */}
      <div className="relative z-10 max-w-2xl mx-auto w-full text-center py-12 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-amber-950/50">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Wartungsarbeiten Aktiv
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Wir führen aktuell <br />
          <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Wartungsarbeiten
          </span>{' '}
          durch!
        </h1>

        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-purple-950/60 border border-purple-800/60 rounded-2xl text-purple-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
          </div>
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            {shopSettings.maintenanceMessage ||
              'Der Graviq Shop befindet sich derzeit im Wartungsmodus. Wir führen System-Upgrades & Server-Optimierungen durch!'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs text-slate-400 font-semibold">
            <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              ⚡ Bot Server: Online
            </span>
            <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              🔒 Safe Delivery: Garantiert
            </span>
            <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              💬 Support: 24/7 Aktiv
            </span>
          </div>
        </div>

        {/* Discord Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="https://discord.gg/q8DwT3GsSn"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 text-sm"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Discord Server Beitreten</span>
          </a>

          <button
            onClick={handleOpenStaffLogin}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Als Supporter / Admin Anmelden</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-900">
        © 2026 Graviq x S3 eSport Official. Alle Rechte vorbehalten.
      </div>
    </div>
  );
};
