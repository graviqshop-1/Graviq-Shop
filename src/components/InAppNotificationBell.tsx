import React, { useState, useRef, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Bell, Check, Trash2, Sparkles, Gift, Coins, Package, Ticket as TicketIcon, Zap } from 'lucide-react';

export const InAppNotificationBell: React.FC = () => {
  const {
    inAppNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearInAppNotifications,
    setUpdateModalOpen,
  } = useShop();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = inAppNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'update':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'reward':
        return <Gift className="w-4 h-4 text-pink-400" />;
      case 'coins':
        return <Coins className="w-4 h-4 text-amber-300" />;
      case 'order':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'ticket':
        return <TicketIcon className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        title="Benachrichtigungs-Zentrale & Updates"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-slate-950 shadow-lg animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 font-black text-slate-100 text-sm">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Benachrichtigungen</span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
              >
                Alle gelesen
              </button>
            )}
          </div>

          {inAppNotifications.length === 0 ? (
            <div className="py-6 text-center text-slate-500 space-y-1">
              <p className="text-sm font-bold">Keine Benachrichtigungen</p>
              <p className="text-[11px]">Du bist auf dem neusten Stand! ✨</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {inAppNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    markNotificationAsRead(n.id);
                    if (n.type === 'update') {
                      setUpdateModalOpen(true);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-bold text-slate-200">
                      {getIcon(n.type)}
                      <span className="truncate">{n.title}</span>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{new Date(n.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</span>
                    {!n.read && (
                      <span className="text-indigo-400 font-bold hover:underline flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Gelesen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                setUpdateModalOpen(true);
                setIsOpen(false);
              }}
              className="text-amber-400 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3 h-3" /> v3.2.0 Release Notes 🚀
            </button>
            {inAppNotifications.length > 0 && (
              <button
                onClick={clearInAppNotifications}
                className="text-slate-500 hover:text-rose-400 cursor-pointer transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Löschen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
