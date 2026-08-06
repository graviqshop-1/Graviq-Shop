import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { INITIAL_SLIDER_CONFIGS } from '../data/initialData';
import { Sliders, Zap, Check, ShieldCheck, Clock, MessageSquare, ShoppingCart, Lock } from 'lucide-react';
import { PlatformId, CartItem } from '../types';

interface LiveViewerSliderProps {
  embedded?: boolean;
  onClose?: () => void;
}

export const LiveViewerSlider: React.FC<LiveViewerSliderProps> = ({ embedded = false, onClose }) => {
  const { activePlatform, setActivePlatform, addToCart, appliedCoupon } = useShop();

  const [platform, setPlatform] = useState<PlatformId>(activePlatform);
  const [viewers, setViewers] = useState<number>(20);
  const [selectedDuration, setSelectedDuration] = useState<string>('1h');
  const [withChatBots, setWithChatBots] = useState<boolean>(true);
  const [targetChannel, setTargetChannel] = useState<string>('');
  const [targetError, setTargetError] = useState<string>('');

  const config = INITIAL_SLIDER_CONFIGS[platform] || INITIAL_SLIDER_CONFIGS['twitch'];

  // Ensure viewer count is within bounds for selected platform
  const minV = config.minViewers;
  const maxV = config.maxViewers;
  const stepV = config.step;
  const currentViewers = Math.max(minV, Math.min(maxV, viewers));

  // Calculate Base Price
  // e.g. 10 Zuschauern = 20€ for 1 hour.
  // 20 Zuschauern = 40€
  const basePricePerTen = config.basePricePer10;
  const mult = config.durationMultipliers[selectedDuration] || 1.0;

  let calculatedPrice = (currentViewers / 10) * basePricePerTen * mult;
  if (withChatBots) {
    calculatedPrice *= 1.15; // 15% extra for interactive chat bots
  }

  // Discount calculation
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const finalPrice = Math.max(1, calculatedPrice * (1 - discountPercent / 100));

  const durationLabels: Record<string, string> = {
    '30m': '30 Min.',
    '1h': '1 Std.',
    '3h': '3 Std.',
    '6h': '6 Std.',
    '12h': '12 Std.',
    '24h': '24 Std.',
  };

  const platformNames: Record<PlatformId, string> = {
    twitch: 'Twitch',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    instagram: 'Instagram',
  };

  const handleAddToCart = () => {
    if (!targetChannel.trim()) {
      setTargetError('Bitte gib deinen Kanalnamen oder Stream-Link an!');
      return;
    }
    setTargetError('');

    const item: CartItem = {
      id: `live_slider_${Date.now()}`,
      title: `${platformNames[platform]} Live-Zuschauer (${durationLabels[selectedDuration]})`,
      platform,
      category: 'live',
      quantity: 1,
      amount: currentViewers,
      unit: 'Live-Zuschauer',
      price: Number(finalPrice.toFixed(2)),
      targetLink: targetChannel,
      duration: durationLabels[selectedDuration],
      withChatBots,
    };

    addToCart(item);
    if (onClose) onClose();
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${embedded ? '' : 'max-w-3xl w-full mx-auto'}`}>
      {/* Background neon glow line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-amber-400" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
            <Sliders className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Live-Zuschauer Konfigurator
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Wähle deine exakte Zuschaueranzahl per Schieberegler
            </p>
          </div>
        </div>

        {onClose && !embedded && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Platform Switcher inside Slider */}
      <div className="grid grid-cols-4 gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 mb-8">
        {(['twitch', 'tiktok', 'youtube', 'instagram'] as PlatformId[]).map((p) => {
          const isSelected = platform === p;
          return (
            <button
              key={p}
              onClick={() => {
                setPlatform(p);
                const newCfg = INITIAL_SLIDER_CONFIGS[p];
                setViewers(newCfg.minViewers * 2);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === 'twitch' && '👾 Twitch'}
              {p === 'tiktok' && '🎵 TikTok'}
              {p === 'youtube' && '▶️ YouTube'}
              {p === 'instagram' && '📸 Instagram'}
            </button>
          );
        })}
      </div>

      {/* Dynamic Viewer Slider Section */}
      <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-300 text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Zuschaueranzahl (Schieberegler):
          </span>
          <span className="text-2xl sm:text-4xl font-black text-cyan-400 font-mono bg-cyan-950/60 px-4 py-1.5 rounded-2xl border border-cyan-800/50 shadow-inner">
            {currentViewers} <span className="text-xs text-slate-400 font-normal">Zuschauer</span>
          </span>
        </div>

        {/* Range Input Bar */}
        <div className="space-y-3 mb-6">
          <input
            type="range"
            min={minV}
            max={maxV}
            step={stepV}
            value={currentViewers}
            onChange={(e) => setViewers(Number(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>{minV} Zuschauer</span>
            <span>{Math.round((maxV + minV) / 2)} Zuschauer</span>
            <span>{maxV} Zuschauer</span>
          </div>
        </div>

        {/* Quick Stepper Buttons (10, 20, 50, 100, 250, 500) */}
        <div className="flex flex-wrap gap-2">
          {[10, 20, 50, 100, 250, 500].map((v) => {
            if (v < minV || v > maxV) return null;
            return (
              <button
                key={v}
                onClick={() => setViewers(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer border ${
                  currentViewers === v
                    ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {v} {v === 10 ? 'Zuschauer (€20)' : v === 20 ? 'Zuschauer (€40)' : 'Viewers'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration Options */}
      <div className="mb-8">
        <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          Stream-Laufzeit wählen:
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {Object.keys(config.durationMultipliers).map((durKey) => {
            const isSelected = selectedDuration === durKey;
            return (
              <button
                key={durKey}
                onClick={() => setSelectedDuration(durKey)}
                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {durationLabels[durKey]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Options: Interactive Chat Bots */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-white text-sm font-bold block">Interaktiver Chat-Bot & Aktivität</span>
            <span className="text-slate-400 text-xs">Simuliert echte Chat-Nachrichten im Stream (+15%)</span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={withChatBots}
            onChange={(e) => setWithChatBots(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
        </label>
      </div>

      {/* Target Channel Link Input */}
      <div className="mb-8">
        <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
          Stream-Link oder Kanal-Name:
        </label>
        <div className="relative">
          <input
            type="text"
            value={targetChannel}
            onChange={(e) => {
              setTargetChannel(e.target.value);
              if (targetError) setTargetError('');
            }}
            placeholder={
              platform === 'twitch'
                ? 'z.B. https://twitch.tv/dein_kanal oder dein_kanal'
                : platform === 'tiktok'
                ? 'z.B. @dein_tiktok_handle'
                : platform === 'youtube'
                ? 'z.B. https://youtube.com/@dein_kanal'
                : '@dein_instagram_name'
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
        {targetError && <p className="text-rose-400 text-xs font-semibold mt-1.5">{targetError}</p>}
      </div>

      {/* Price Summary & Checkout Action */}
      <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-medium block">Gesamtpreis:</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white font-mono">
              €{finalPrice.toFixed(2)}
            </span>
            {appliedCoupon && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                -{appliedCoupon.discountPercent}% Rabatt
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sofortige Aktivierung bei Live-Stream
          </p>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950/40 hover:shadow-cyan-900/50 transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>In den Warenkorb Legen (€{finalPrice.toFixed(2)})</span>
        </button>
      </div>
    </div>
  );
};
