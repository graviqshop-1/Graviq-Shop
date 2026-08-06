import React from 'react';
import { GraviqLogo } from './GraviqLogo';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Lock, Mail, Heart, HelpCircle, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onOpenSupportModal: () => void;
  onOpenLiveSlider: () => void;
  onOpenFaq?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenSupportModal, onOpenLiveSlider, onOpenFaq }) => {
  const { shopSettings } = useShop();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <GraviqLogo season={shopSettings.activeSeason} size="sm" />
            <p className="text-slate-400 text-xs leading-relaxed">
              Graviq Shop ist dein führender Partner für authentisches Wachstum auf Twitch, TikTok, YouTube & Instagram. 100% sicher, blitzschnell & garantiert diskret.
            </p>

            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>System Status: 100% Operational</span>
            </div>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Plattformen</h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><button onClick={onOpenLiveSlider} className="hover:text-cyan-400 transition-colors cursor-pointer">Twitch Live Zuschauer Slider</button></li>
              <li><button onClick={onOpenLiveSlider} className="hover:text-cyan-400 transition-colors cursor-pointer">TikTok Follower & Likes</button></li>
              <li><button onClick={onOpenLiveSlider} className="hover:text-cyan-400 transition-colors cursor-pointer">YouTube Abonnenten & Views</button></li>
              <li><button onClick={onOpenLiveSlider} className="hover:text-cyan-400 transition-colors cursor-pointer">Instagram HQ Follower</button></li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Partnerschaft & Service</h4>
            <ul className="space-y-2.5 text-slate-400">
              {onOpenFaq && (
                <li>
                  <button onClick={onOpenFaq} className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-slate-200">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Fragen & Antworten (FAQ)
                  </button>
                </li>
              )}
              <li>
                <button onClick={onOpenSupportModal} className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Website Support Ticket
                </button>
              </li>
              <li>
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  ⚡ Offizieller S3 eSport Partner
                </span>
              </li>
              <li>
                <a
                  href="https://discord.gg/q8DwT3GsSn"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-300 hover:text-indigo-200 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  💬 Discord Server Beitreten
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Badges & Security */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Sichere Zahlungsarten</h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-bold font-mono text-[11px]">
                  PayPal
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono text-[11px]">
                  Kreditkarte
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono text-[11px]">
                  Sofort
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold font-mono text-[11px]">
                  Paysafecard
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-Bit SSL-Verschlüsselung & Käuferschutz</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 Graviq Shop. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 cursor-pointer">AGB</span>
            <span className="hover:text-slate-300 cursor-pointer">Datenschutz</span>
            <span className="hover:text-slate-300 cursor-pointer">Impressum</span>
            <span className="hover:text-slate-300 cursor-pointer">Widerrufsbelehrung</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
