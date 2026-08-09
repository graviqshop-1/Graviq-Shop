import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductReviewsSection } from './ProductReviewsSection';
import { PlatformId, ServiceCategory, ServicePackage, CartItem } from '../types';
import { Check, ShoppingCart, Zap, Flame, Shield, Star, Filter } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { products, activePlatform, setActivePlatform, addToCart } = useShop();

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [modalPackage, setModalPackage] = useState<ServicePackage | null>(null);
  const [targetLinkInput, setTargetLinkInput] = useState<string>('');
  const [targetError, setTargetError] = useState<string>('');

  const filteredProducts = products.filter((p) => {
    if (p.platform !== activePlatform) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    return true;
  });

  const platformNames: Record<PlatformId, string> = {
    twitch: 'Twitch',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    instagram: 'Instagram',
  };

  const handleOpenAddModal = (pkg: ServicePackage) => {
    setModalPackage(pkg);
    setTargetLinkInput('');
    setTargetError('');
  };

  const handleConfirmAddToCart = () => {
    if (!modalPackage) return;
    if (!targetLinkInput.trim()) {
      setTargetError('Bitte gib einen gültigen Profillink oder Benutzernamen an!');
      return;
    }

    const cartItem: CartItem = {
      id: `cart_${modalPackage.id}_${Date.now()}`,
      packageId: modalPackage.id,
      title: modalPackage.title,
      platform: modalPackage.platform,
      category: modalPackage.category,
      quantity: 1,
      amount: modalPackage.amount,
      unit: modalPackage.unit,
      price: modalPackage.price,
      targetLink: targetLinkInput,
    };

    addToCart(cartItem);
    setModalPackage(null);
  };

  return (
    <section id="packages" className="py-16 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              Exklusive Stream Pakete
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {platformNames[activePlatform]} Angebote & Services
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Alle Pakete
            </button>
            <button
              onClick={() => setSelectedCategory('followers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'followers'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Follower & Subs
            </button>
            <button
              onClick={() => setSelectedCategory('likes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'likes'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Likes
            </button>
            <button
              onClick={() => setSelectedCategory('views')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedCategory === 'views'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Aufrufe / Views
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            Keine Pakete in dieser Kategorie gefunden.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-slate-900/90 border rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  pkg.isPopular
                    ? 'border-purple-500 shadow-xl shadow-purple-950/40'
                    : pkg.isBestValue
                    ? 'border-cyan-500 shadow-xl shadow-cyan-950/40'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Popular / Best Value Badges */}
                {pkg.isPopular && (
                  <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" /> Am Beliebtesten
                  </span>
                )}
                {pkg.isBestValue && (
                  <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> Bestes Preis-Leistungs-Verhältnis
                  </span>
                )}

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                    {pkg.deliverySpeed}
                  </div>

                  <h3 className="text-xl font-extrabold text-white mb-2">{pkg.title}</h3>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-black text-white font-mono">
                      €{pkg.price.toFixed(2)}
                    </span>
                    {pkg.originalPrice && (
                      <span className="text-sm text-slate-500 line-through font-mono">
                        €{pkg.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Features checklist */}
                  <ul className="space-y-3 mb-8 border-t border-slate-800/80 pt-6">
                    {pkg.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleOpenAddModal(pkg)}
                  className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    pkg.isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-900/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Jetzt Bestellen (€{pkg.price.toFixed(2)})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Target Link Modal */}
      {modalPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setModalPackage(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">{modalPackage.title}</h3>
            <p className="text-slate-400 text-xs mb-6">
              Menge: <strong className="text-cyan-400">{modalPackage.amount} {modalPackage.unit}</strong> für €{modalPackage.price.toFixed(2)}
            </p>

            <div className="mb-6">
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                Ziel-Link / Kanal-Name:
              </label>
              <input
                type="text"
                value={targetLinkInput}
                onChange={(e) => {
                  setTargetLinkInput(e.target.value);
                  if (targetError) setTargetError('');
                }}
                placeholder="z.B. @dein_benutzername oder https://twitch.tv/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                autoFocus
              />
              {targetError && <p className="text-rose-400 text-xs mt-1 font-semibold">{targetError}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModalPackage(null)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 hover:text-white font-bold rounded-2xl text-xs cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold rounded-2xl text-xs cursor-pointer shadow-lg shadow-purple-900/30"
              >
                In den Warenkorb
              </button>
            </div>

            {/* Product Reviews */}
            <ProductReviewsSection productId={modalPackage.id} />
          </div>
        </div>
      )}
    </section>
  );
};
