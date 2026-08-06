import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldAlert, Mail, LogOut, HelpCircle, AlertOctagon } from 'lucide-react';

export const BlockedOverlay: React.FC = () => {
  const { shopSettings, currentUser, logoutUser } = useShop();

  // Check if current user email or IP is blocked
  const userEmail = currentUser?.email?.toLowerCase()?.trim();
  const isEmailBlocked = userEmail && (shopSettings.blockedEmails || [])
    .map((e) => e.toLowerCase().trim())
    .includes(userEmail);

  // Is staff exempt? Admins & Support are exempt so they don't lock themselves out
  const isStaff = currentUser && (currentUser.role === 'admin' || currentUser.role === 'support' || currentUser.role === 'team_graviq');

  if (isStaff || !isEmailBlocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 overflow-y-auto">
      {/* Red Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-red-600/20 border border-red-500/30 p-2.5 rounded-2xl text-red-400">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-black text-white block">
              GRAVIQ <span className="text-red-500">SECURITY SHIELD</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-widest">
              Anti-Spam & Fraud Protection System
            </span>
          </div>
        </div>

        {currentUser && (
          <button
            onClick={logoutUser}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md hover:border-slate-700"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Abmelden</span>
          </button>
        )}
      </div>

      {/* Main Block Banner */}
      <div className="relative z-10 max-w-xl mx-auto w-full text-center py-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-red-950/50">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          Zugriff Verweigert / Account Gesperrt
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Dein Konto wurde <br />
          <span className="bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent">
            Anti-Spam Gesperrt
          </span>
        </h1>

        <div className="bg-slate-900/90 border border-red-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-4 text-left">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <ShieldAlert className="w-7 h-7 text-red-500 shrink-0" />
            <div>
              <h4 className="text-white font-bold text-sm">Sicherheits-Benachrichtigung</h4>
              <p className="text-slate-400 text-xs">Identifikations-E-Mail: <span className="text-red-400 font-mono font-bold">{currentUser?.email}</span></p>
            </div>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Dein Benutzerkonto bzw. deine E-Mail-Adresse wurde vom Graviq Support & Anti-Spam Shield automatisch oder manuell für den Shop gesperrt.
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              Support Kontakt bei Fragen oder Freischaltung:
            </span>
            <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-cyan-300 font-bold text-xs text-center select-all">
              kontakt@graviq-shop.de
            </div>
          </div>
        </div>

        <div className="pt-2">
          {currentUser && (
            <button
              onClick={logoutUser}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Mit anderem Account anmelden</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center text-xs text-slate-500 pt-6 border-t border-slate-900">
         Graviq Shop Anti-Spam Security System. Kontakt: kontakt@graviq-shop.de
      </div>
    </div>
  );
};
