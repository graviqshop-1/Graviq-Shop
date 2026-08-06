import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { KeyRound, ShieldCheck, AlertCircle, X, CheckCircle2, RefreshCw } from 'lucide-react';

interface AccountResetModalProps {
  onClose: () => void;
}

export const AccountResetModal: React.FC<AccountResetModalProps> = ({ onClose }) => {
  const { resetCodes, redeemResetCode, loginWithDiscord } = useShop();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRedeemed, setIsRedeemed] = useState(false);

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Bitte gib deinen 16-stelligen Support-Sicherheitscode ein.');
      return;
    }

    const result = redeemResetCode(cleanCode);
    if (result.success) {
      setSuccess(`✅ Sicherheitscode erfolgreich eingelöst! Dein Account (${result.user?.name}) wurde zurückgesetzt & entsperrt.`);
      setIsRedeemed(true);
    } else {
      setError(result.message || 'Ungültiger oder abgelaufener Reset-Code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Account Wiederherstellung
          </h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Gib hier deinen vom Support erhaltenen Sicherheitscode ein, um deinen Discord-Account erneut zu verknüpfen.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3.5 rounded-xl text-xs mb-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
            <p className="text-emerald-300/80 text-[11px] leading-relaxed">
              Dein Code verfällt nach einmaliger Nutzung automatisch. Du kannst dich jetzt direkt mit Discord neu anmelden.
            </p>
          </div>
        )}

        {!isRedeemed ? (
          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">
                Sicherheitscode (z.B. GRAVIQ-RESET-XXXX-XXXX):
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GRAVIQ-RESET-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono text-xs uppercase tracking-wider focus:outline-none focus:border-indigo-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sicherheitscode Jetzt Einlösen</span>
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => {
              onClose();
              loginWithDiscord();
            }}
            className="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Jetzt mit Discord Neu Anmelden</span>
          </button>
        )}

        {/* Support Help info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-slate-400 text-[11px] leading-relaxed">
          <p>Du hast noch keinen Sicherheitscode?</p>
          <p className="text-slate-300">
            Wende dich an den Support unter <strong className="text-cyan-300 select-all">kontakt@graviq-shop.de</strong> oder öffne ein Ticket auf unserem Discord Support Server.
          </p>
        </div>

      </div>
    </div>
  );
};
