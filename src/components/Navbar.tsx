import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { GraviqLogo } from './GraviqLogo';
import { InAppNotificationBell } from './InAppNotificationBell';
import {
  ShoppingCart,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  HelpCircle,
  Coins,
  Zap,
  Mail,
  CheckCircle,
} from 'lucide-react';
import { PlatformId } from '../types';

interface NavbarProps {
  onOpenLiveSlider: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  onOpenSupportModal: () => void;
  onOpenFaq: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLiveSlider,
  onOpenDashboard,
  onOpenAdmin,
  onOpenSupportModal,
  onOpenFaq,
}) => {
  const {
    currentUser,
    logout,
    cart,
    setCartOpen,
    setAuthModalOpen,
    setAuthModalView,
    activePlatform,
    setActivePlatform,
    shopSettings,
    notifications,
    setUpdateModalOpen,
    setLoyaltyModalOpen,
  } = useShop();

  const [notificationOpen, setNotificationOpen] = useState(false);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const platformIcons: Record<PlatformId, { name: string; icon: string; color: string }> = {
    twitch: { name: 'Twitch', icon: '👾', color: 'from-purple-500 to-indigo-600' },
    tiktok: { name: 'TikTok', icon: '🎵', color: 'from-pink-500 to-cyan-500' },
    youtube: { name: 'YouTube', icon: '▶️', color: 'from-red-600 to-rose-700' },
    instagram: { name: 'Instagram', icon: '📸', color: 'from-amber-500 to-pink-600' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      {/* Top Announcement Bar */}
      {shopSettings.announcementText && (
        <div className="bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
          <span>{shopSettings.announcementText}</span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText('SOMMER20');
              alert('Gutscheincode SOMMER20 kopiert! (-20% Rabatt)');
            }}
            className="bg-black/30 hover:bg-black/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border border-white/20"
          >
            Code Kopieren
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shrink-0 cursor-pointer">
          <GraviqLogo season={shopSettings.activeSeason} size="md" />
        </div>

        {/* Platform Selector Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          {(['twitch', 'tiktok', 'youtube', 'instagram'] as PlatformId[]).map((p) => {
            const isSelected = activePlatform === p;
            return (
              <button
                key={p}
                onClick={() => setActivePlatform(p)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <span>{platformIcons[p].icon}</span>
                <span>{platformIcons[p].name}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Version Update Pill */}
          <button
            onClick={() => setUpdateModalOpen(true)}
            className="hidden sm:flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold cursor-pointer transition-all hover:scale-105 shadow-sm"
            title="v3.2.0 Release Notes anzeigen"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>v3.2.0</span>
          </button>

          {/* Graviq Coins / VIP Club Button */}
          <button
            onClick={() => setLoyaltyModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-purple-600/20 hover:from-amber-500/30 hover:to-purple-600/30 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all shadow-md"
            title="Graviq Coins, Daily Bonus & VIP Rang"
          >
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-mono text-amber-300">{currentUser?.coins || 0}</span>
            <span className="hidden lg:inline text-[10px] bg-amber-500 text-black px-1.5 py-0.2 rounded font-black uppercase">{currentUser?.vipRank || 'Bronze'}</span>
          </button>

          {/* Notification Bell Center */}
          <InAppNotificationBell />

          {/* Email Logs Preview Icon (Admin/Support Only) */}
          {(currentUser?.role === 'admin' || currentUser?.role === 'support') && (
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="System Email Logins & Benachrichtigungen"
              >
                <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cyan-500 text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-ping" />
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <span className="font-bold text-slate-200">System-E-Mails Logs</span>
                    <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono">
                      {notifications.length} Gesendet
                    </span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-slate-500 py-3 text-center text-[11px]">Keine ausstehenden E-Mails</p>
                  ) : (
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.slice(0, 4).map((n) => (
                        <div key={n.id} className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px]">
                          <div className="flex items-center justify-between text-cyan-400 font-semibold mb-1">
                            <span className="truncate max-w-[180px]">{n.subject}</span>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          </div>
                          <p className="text-slate-400 truncate">An: {n.to}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Questions & FAQ Help Quick Link */}
          <button
            onClick={onOpenFaq}
            className="p-2 text-indigo-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-indigo-900/40 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Fragen & Antworten (FAQ) & Hilfe"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Cart Drawer Toggle */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer min-h-[40px]"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            {cartTotalItems > 0 && (
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {cartTotalItems}
              </span>
            )}
          </button>

          {/* User Auth & Profile Menu */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {(currentUser.role === 'admin' || currentUser.role === 'support' || currentUser.role === 'team_graviq') && (
                <button
                  onClick={onOpenAdmin}
                  className={`px-2 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer border ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-950/80 hover:bg-purple-900 text-purple-300 border-purple-700/50'
                      : currentUser.role === 'team_graviq'
                      ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-700/50'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-700/50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>
                    {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'team_graviq' ? 'Team' : 'Support'}
                  </span>
                </button>
              )}

              <button
                onClick={onOpenDashboard}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-[10px] text-white shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
              </button>

              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900/50 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Abmelden"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => {
                  setAuthModalView('login');
                  setAuthModalOpen(true);
                }}
                className="text-xs sm:text-sm font-bold text-indigo-300 hover:text-white px-2 sm:px-3 py-2 cursor-pointer transition-colors"
              >
                <span className="hidden sm:inline">Discord Login</span>
                <span className="sm:hidden">Login</span>
              </button>
              <button
                onClick={() => {
                  setAuthModalView('register');
                  setAuthModalOpen(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold px-2.5 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-900/20 flex items-center gap-1"
              >
                <span className="hidden sm:inline">Mit Discord Registrieren</span>
                <span className="sm:hidden">Registrieren</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Platform Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-900 bg-slate-950 px-2 py-2 overflow-x-auto gap-2">
        {(['twitch', 'tiktok', 'youtube', 'instagram'] as PlatformId[]).map((p) => {
          const isSelected = activePlatform === p;
          return (
            <button
              key={p}
              onClick={() => setActivePlatform(p)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap ${
                isSelected ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 bg-slate-900'
              }`}
            >
              <span>{platformIcons[p].icon}</span>
              <span>{platformIcons[p].name}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
