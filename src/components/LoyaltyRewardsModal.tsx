import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Coins, Gift, Crown, Trophy, ArrowRight, X, Sparkles, Check, Zap, Wallet } from 'lucide-react';

interface LoyaltyRewardsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const LoyaltyRewardsModal: React.FC<LoyaltyRewardsModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, claimDailyReward, convertCoinsToBalance, loyaltyModalOpen, setLoyaltyModalOpen } = useShop();

  const [coinsToExchange, setCoinsToExchange] = useState<number>(100);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeOpen = isOpen !== undefined ? isOpen : loyaltyModalOpen;
  const activeClose = onClose || (() => setLoyaltyModalOpen(false));

  if (!activeOpen) return null;

  const currentCoins = currentUser?.coins || 0;
  const currentBalance = currentUser?.balance || 0;
  const currentRank = currentUser?.vipRank || 'Bronze';

  const todayStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = currentUser?.lastDailyRewardClaimed === todayStr;

  const handleClaimDaily = () => {
    const res = claimDailyReward();
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleExchangeCoins = () => {
    const res = convertCoinsToBalance(coinsToExchange);
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const getRankBadge = (rank: string) => {
    switch (rank) {
      case 'VIP':
        return <span className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-black px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1"><Crown className="w-4 h-4" /> VIP Legend</span>;
      case 'Platin':
        return <span className="bg-cyan-950 text-cyan-300 border border-cyan-500 font-extrabold px-3 py-1 rounded-full text-xs flex items-center gap-1"><Sparkles className="w-4 h-4 text-cyan-400" /> Platin Level</span>;
      case 'Gold':
        return <span className="bg-amber-950 text-amber-300 border border-amber-500 font-extrabold px-3 py-1 rounded-full text-xs flex items-center gap-1"><Trophy className="w-4 h-4 text-amber-400" /> Gold Level</span>;
      case 'Silber':
        return <span className="bg-slate-800 text-slate-200 border border-slate-600 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">🥈 Silber Level</span>;
      default:
        return <span className="bg-amber-950/60 text-amber-500 border border-amber-800/40 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">🥉 Bronze Member</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 flex items-center justify-center">
      <div className="bg-slate-950 border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl overflow-hidden my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-600" />

        {/* Close Button */}
        <button
          onClick={activeClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20 shrink-0">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Graviq Coins & VIP-Club 👑
            </h2>
            <p className="text-xs text-slate-400">
              Sammle Treuepunkte bei jedem Einkauf, hol dir deinen Daily Bonus & schalte VIP-Vorteile frei!
            </p>
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            feedback.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' : 'bg-rose-950/90 border-rose-500 text-rose-300'
          }`}>
            <Zap className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Balance & Rank Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mb-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Graviq Coins</span>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {currentCoins} <span className="text-xs font-normal text-amber-500">Coins</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">100 Coins = 1,00 € Guthaben</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mb-1">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Shop Guthaben</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono">
              €{currentBalance.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Wird an der Kasse verrechnet</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="text-slate-400 text-xs font-bold flex items-center gap-1.5 mb-1">
              <Crown className="w-4 h-4 text-purple-400" />
              <span>VIP Status</span>
            </div>
            <div className="my-1">
              {getRankBadge(currentRank)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Sammle Coins für Rangupgrades</p>
          </div>
        </div>

        {/* Daily Bonus Section */}
        <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/80 border border-indigo-800/40 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-pink-400 animate-bounce" />
              <div>
                <h3 className="font-extrabold text-white text-sm">Täglicher Login Bonus 🎁</h3>
                <p className="text-xs text-slate-300">Hole dir jeden Tag +25 Graviq Coins & +0,50 € Guthaben ab!</p>
              </div>
            </div>
            <button
              onClick={handleClaimDaily}
              disabled={hasClaimedToday}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all shadow-lg cursor-pointer flex items-center gap-2 ${
                hasClaimedToday
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-400 hover:to-amber-400 text-white border border-pink-400/30 shadow-pink-900/40'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{hasClaimedToday ? 'Heute Bereits Abgeholt ✅' : 'Jetzt Abholen 🎁'}</span>
            </button>
          </div>
        </div>

        {/* Coin Converter Section */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-white text-sm">Coins in Shop-Guthaben Einlösen 🪙</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>Auszuzahlende Coins:</span>
              <span className="text-amber-400 font-mono text-sm">{coinsToExchange} Coins = {(coinsToExchange / 100).toFixed(2)} € Guthaben</span>
            </div>

            <input
              type="range"
              min="100"
              max={Math.max(100, currentCoins)}
              step="50"
              value={coinsToExchange}
              onChange={(e) => setCoinsToExchange(Number(e.target.value))}
              disabled={currentCoins < 100}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400">Verfügbar: <strong className="text-amber-300">{currentCoins} Coins</strong></span>
              <button
                onClick={handleExchangeCoins}
                disabled={currentCoins < 100}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-black font-extrabold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <span>Guthaben Freischalten</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* VIP Ranks Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> VIP Ränge & Exklusive Vorteile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-amber-500">🥉 Bronze</span>
                <span className="text-[10px] text-slate-400 font-mono">0 - 249 Coins</span>
              </div>
              <p className="text-[11px] text-slate-400">Standard Rabatte & Zugriff auf alle Live-Services.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-300">🥈 Silber</span>
                <span className="text-[10px] text-slate-400 font-mono">250 - 499 Coins</span>
              </div>
              <p className="text-[11px] text-slate-400">+2% Extra-Rabatt & 1.1x Daily Multiplikator.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-amber-400">🥇 Gold</span>
                <span className="text-[10px] text-slate-400 font-mono">500 - 999 Coins</span>
              </div>
              <p className="text-[11px] text-slate-400">+5% Extra-Rabatt & Bevorzugte Delivery.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-cyan-400">💎 Platin & VIP Legend</span>
                <span className="text-[10px] text-slate-400 font-mono">1000+ Coins</span>
              </div>
              <p className="text-[11px] text-slate-400">+10% Extra-Rabatt, VIP Discord Rolle & 24/7 Priority Support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
