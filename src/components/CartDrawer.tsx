import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingCart, Trash2, Tag, ArrowRight, ShieldCheck, Mail, Sparkles, Check } from 'lucide-react';

interface CartDrawerProps {
  onOpenPayPal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenPayPal }) => {
  const {
    cart,
    removeFromCart,
    clearCart,
    cartOpen,
    setCartOpen,
    appliedCoupon,
    applyCouponCode,
    currentUser,
    shopSettings,
  } = useShop();

  const [couponInput, setCouponInput] = useState<string>('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Email Newsletter Subscribe State
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean>(false);

  if (!cartOpen) return null;

  const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const couponDiscount = appliedCoupon ? (rawTotal * appliedCoupon.discountPercent) / 100 : 0;
  const seasonDiscountPercent = shopSettings.seasonDiscountPercent || 0;
  const seasonDiscount = (rawTotal * seasonDiscountPercent) / 100;
  const totalDiscount = couponDiscount + seasonDiscount;
  const finalTotal = Math.max(0, rawTotal - totalDiscount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    setCouponMsg(res);
  };

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    // Automatically apply 10% code
    applyCouponCode('GRAVIQ2026');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Cart Drawer Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white">Dein Warenkorb</h3>
            </div>

            <button
              onClick={() => setCartOpen(false)}
              className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto" />
                <p className="text-slate-400 text-sm">Dein Warenkorb ist derzeit leer.</p>
                <button
                  onClick={() => setCartOpen(false)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Pakete Entdecken
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-900">
                        {item.platform} • {item.amount} {item.unit}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{item.title}</h4>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                      title="Entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 truncate mb-2">
                    Ziel: <strong className="text-slate-200">{item.targetLink}</strong>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-900 pt-2">
                    <span className="text-xs text-slate-500">Menge: {item.quantity}</span>
                    <span className="text-base font-black text-white font-mono">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Newsletter Subscription Popup / Card for 10% discount */}
            {cart.length > 0 && (
              <div className="bg-gradient-to-br from-purple-950/60 to-slate-950 p-4 rounded-2xl border border-purple-800/40 mt-4">
                <div className="flex items-center gap-2 mb-2 text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>10% Extra-Rabatt für E-Mail Abonnenten</span>
                </div>
                {newsletterSubscribed ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800">
                    <Check className="w-4 h-4" />
                    <span>E-Mail abonniert! Code GRAVIQ2026 wurde angewendet.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribeNewsletter} className="flex gap-2">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Deine E-Mail eintragen..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap"
                    >
                      Abonnieren
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Cart Drawer Footer & Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-4">
              {/* Coupon Code Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Gutscheincode (z.B. SOMMER20)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Einlösen
                </button>
              </form>

              {couponMsg && (
                <p className={`text-xs font-semibold ${couponMsg.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {couponMsg.message}
                </p>
              )}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-900">
                <div className="flex justify-between">
                  <span>Zwischensumme:</span>
                  <span className="font-mono text-slate-200">€{rawTotal.toFixed(2)}</span>
                </div>
                {seasonDiscountPercent > 0 && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Event Extra-Rabatt (-{seasonDiscountPercent}%):</span>
                    <span className="font-mono">-€{seasonDiscount.toFixed(2)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Gutschein ({appliedCoupon.code} -{appliedCoupon.discountPercent}%):</span>
                    <span className="font-mono">-€{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-900">
                  <span>Gesamtsumme:</span>
                  <span className="font-mono text-cyan-400 text-xl">€{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => {
                  setCartOpen(false);
                  onOpenPayPal();
                }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-purple-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Jetzt mit PayPal Bezahlen</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PayPal Käuferschutz
                </span>
                <button onClick={clearCart} className="hover:text-rose-400 cursor-pointer">
                  Warenkorb Leeren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
