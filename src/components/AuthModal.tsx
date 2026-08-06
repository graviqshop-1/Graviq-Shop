import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Bot, ShieldCheck, KeyRound, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Unlock, AlertOctagon, UserX } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    loginWithDiscord,
    shopSettings,
    updateShopSettings,
    setResetModalOpen,
    redeemResetCode,
    authError,
    setAuthError,
  } = useShop();

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showDiscordSetup, setShowDiscordSetup] = useState(false);
  const [customDiscordClientId, setCustomDiscordClientId] = useState(shopSettings.discordClientId || '');

  // Support Code Accordion State
  const [showSupportCodeAccordion, setShowSupportCodeAccordion] = useState(() => {
    return !!(authError && (authError.toLowerCase().includes('gesperrt') || authError.toLowerCase().includes('banned')));
  });
  const [supportCodeInput, setSupportCodeInput] = useState('');

  if (!authModalOpen) return null;

  const handleDiscordClick = () => {
    setError('');
    setSuccessMsg('');
    const launched = loginWithDiscord(customDiscordClientId);
    if (!launched) {
      setShowDiscordSetup(true);
      setError('ℹ️ Bitte gib unten deine Discord Application Client ID ein oder trage sie im Admin-Panel ein.');
    }
  };

  const handleSaveDiscordClientIdAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customDiscordClientId.trim()) {
      setError('Bitte gib deine Discord Application Client ID ein.');
      return;
    }
    updateShopSettings({ discordClientId: customDiscordClientId.trim() });
    const ok = loginWithDiscord(customDiscordClientId.trim());
    if (!ok) {
      setError('Ungültige Client ID.');
    }
  };

  const handleSupportCodeChange = (rawVal: string) => {
    // Strip hyphens and keep alphanumeric/digits
    const clean = rawVal.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (clean.length <= 9 && /^\d*$/.test(clean)) {
      // Auto-format numeric 9-digit code as XXX-XXX-XXX
      if (clean.length > 6) {
        setSupportCodeInput(`${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`);
      } else if (clean.length > 3) {
        setSupportCodeInput(`${clean.slice(0, 3)}-${clean.slice(3)}`);
      } else {
        setSupportCodeInput(clean);
      }
    } else {
      setSupportCodeInput(rawVal.toUpperCase());
    }
  };

  const handleVerifySupportCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!supportCodeInput.trim()) {
      setError('Bitte gib den 9-stelligen Support-Code ein.');
      return;
    }

    const res = redeemResetCode(supportCodeInput);
    if (res.success) {
      setSuccessMsg(`✅ Code verifiziert! ${res.user?.name ? `Willkommen zurück, ${res.user.name}.` : 'Zugang gewährt.'}`);
      setTimeout(() => {
        setAuthModalOpen(false);
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        {/* Header Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-[#5865F2]/20 text-[#5865F2] rounded-2xl border border-[#5865F2]/40 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/20">
            <Bot className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Discord Registrierung & Login
          </h3>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Authentifizierung erfolgt <strong className="text-indigo-400">ausschließlich über Discord</strong> (Sicher & Ohne Passwort).
          </p>
        </div>

        {/* Alert Messages */}
        {authError && (
          <div className="bg-rose-950/90 border-2 border-rose-600 text-rose-200 p-4 rounded-2xl text-xs mb-5 space-y-2 shadow-lg shadow-rose-950/50 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-2 font-black text-rose-400 text-sm">
              <UserX className="w-5 h-5 shrink-0 text-rose-500" />
              <span>Zugriff verweigert / Konto gesperrt</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-slate-200 text-xs">
              {authError}
            </p>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-bold cursor-pointer pt-1"
            >
              Meldung ausblenden
            </button>
          </div>
        )}

        {error && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Primary Discord Login Button */}
        <div className="mb-6 space-y-4">
          <button
            type="button"
            onClick={handleDiscordClick}
            className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-sm py-4 px-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            <span>Jetzt mit Discord Anmelden / Registrieren</span>
          </button>
          <div className="text-center pt-1">
            <a
              href="https://discord.gg/q8DwT3GsSn"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline inline-flex items-center gap-1"
            >
              <span>👉 Dem Discord Server beitreten (Support & Community)</span>
            </a>
          </div>

          {/* Discord Setup Config (if client ID missing) */}
          {showDiscordSetup && (
            <form onSubmit={handleSaveDiscordClientIdAndLogin} className="bg-slate-950 p-4 rounded-2xl border border-indigo-900/60 space-y-3 text-xs">
              <div className="flex justify-between items-center text-indigo-300 font-extrabold">
                <span>⚙️ Discord Client ID Setup</span>
                <button
                  type="button"
                  onClick={() => setShowDiscordSetup(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                <p>1. Erstelle eine kostenlose Discord App im <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">Discord Dev Portal</a>.</p>
                <p>2. Trage bei Redirect URIs folgende Adresse ein:</p>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 font-mono text-[10px] text-cyan-300 select-all break-all">
                  {window.location.origin}/discord-callback.html
                </div>
                <p>3. Trage deine Discord Client ID ein:</p>
              </div>

              <input
                type="text"
                value={customDiscordClientId}
                onChange={(e) => setCustomDiscordClientId(e.target.value)}
                placeholder="z.B. 123456789012345678"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
              />

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Speichern & Discord Login Starten
              </button>
            </form>
          )}

          {/* Accordion Dropdown: Support-Code Eingabe */}
          <div className="border border-indigo-900/40 bg-slate-950 rounded-2xl overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowSupportCodeAccordion(!showSupportCodeAccordion)}
              className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-indigo-300 hover:text-white hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Support-Code eingeben (Discord-Zugang wiederherstellen)</span>
              </div>
              {showSupportCodeAccordion ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showSupportCodeAccordion && (
              <form onSubmit={handleVerifySupportCode} className="p-4 pt-2 border-t border-indigo-900/30 space-y-3 bg-slate-950/80">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hast du vom Graviq Support einen 9-stelligen Freischalt-Code erhalten? Gib ihn hier ein, um dich direkt in dein Konto einzuloggen:
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    9-stelliger Support-Code:
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={supportCodeInput}
                    onChange={(e) => handleSupportCodeChange(e.target.value)}
                    placeholder="z.B. 489-291-039"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-cyan-300 font-mono text-base font-extrabold tracking-widest text-center focus:outline-none focus:border-cyan-400 shadow-inner"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg shadow-indigo-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Code Verifizieren & Konto Freischalten</span>
                </button>
              </form>
            )}
          </div>

          {/* Login Help Notice (Exact requested text) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>Probleme bei der Anmeldung?</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Falls du keinen Zugriff mehr auf deinen Discord-Account hast oder dich nicht mehr anmelden kannst, kontaktiere bitte unseren Support unter <strong className="text-cyan-300 select-all">kontakt@graviq-shop.de</strong>. Unser Team hilft dir schnellstmöglich weiter.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowSupportCodeAccordion(true);
              }}
              className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-800 text-indigo-300 font-bold text-xs rounded-xl border border-indigo-900/50 cursor-pointer flex items-center justify-center gap-2 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Support-Code hier direkt eingeben</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Verschlüsselt • Sichere Verbindung</span>
          </div>
        </div>
      </div>
    </div>
  );
};
