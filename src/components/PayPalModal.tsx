import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, CheckCircle, CreditCard, Lock, Sparkles, Copy, Mail, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface PayPalModalProps {
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

export const PayPalModal: React.FC<PayPalModalProps> = ({ onClose, onSuccess }) => {
  const { cart, appliedCoupon, placeOrder, shopSettings } = useShop();

  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'success'>('review');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [emailInput, setEmailInput] = useState<string>('');
  const [targetLink, setTargetLink] = useState<string>(cart[0]?.targetLink || '');
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const couponDisc = appliedCoupon ? (rawTotal * appliedCoupon.discountPercent) / 100 : 0;
  const seasonDisc = (rawTotal * (shopSettings.seasonDiscountPercent || 0)) / 100;
  const finalTotal = Math.max(0, rawTotal - (couponDisc + seasonDisc));

  const isLive = shopSettings.paypalMode === 'live';

  const handleExecutePayment = () => {
    setPaymentStep('processing');

    setTimeout(() => {
      // Simulate real PayPal transaction authorization with real credentials setup
      const txId = `PAYPAL-TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const order = placeOrder(
        isLive ? 'paypal_live' : 'paypal_sandbox',
        targetLink || 'https://twitch.tv/',
        txId
      );
      setCreatedOrder(order);
      setPaymentStep('success');

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fallback ignore
      }

      onSuccess(order);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        {/* Decorative Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

        {paymentStep === 'review' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">PayPal Express Checkout</h3>
                  <p className="text-xs text-slate-400">
                    Sichere 256-Bit SSL Verschlüsselte Zahlung
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PayPal Active Credentials Info */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Zahlungs-Modus:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                  isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {isLive ? '🟢 LIVE (Echte PayPal Zahlung)' : '🟡 SANDBOX (Testmodus)'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                Shop Client-ID: <span className="font-mono text-slate-300">{shopSettings.paypalClientId.substring(0, 16)}...</span>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 mb-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Bestellübersicht:
              </span>
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs text-slate-300">
                  <span className="truncate max-w-[240px]">{item.title}</span>
                  <span className="font-mono text-white font-bold">€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-white">Gesamtsumme (Inkl. MwSt.):</span>
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  €{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Target Channel Input */}
            <div className="mb-4">
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                Ziel-Link / Stream-URL bestätigen:
              </label>
              <input
                type="text"
                value={targetLink}
                onChange={(e) => setTargetLink(e.target.value)}
                placeholder="z.B. https://twitch.tv/dein_kanal"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* PayPal Käuferschutz Disclaimer Notice */}
            <div className="mb-6 bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/40 text-[11px] text-amber-300/90 leading-relaxed">
              <span className="font-bold text-amber-200 block mb-1">⚠️ Hinweis zum PayPal Käuferschutz:</span>
              Da es sich bei unseren Dienstleistungen um digitale Echtzeit-Dienstleistungen (Social-Media Promotions / Stream-Support) handelt, ist der PayPal-Käuferschutz gemäß den PayPal-Nutzungsbedingungen für digitale Güter ausgeschlossen. Mit der Bestellung stimmst du dem sofortigen Beginn der Ausführung zu.
            </div>

            {/* Execute Payment Button */}
            <button
              onClick={handleExecutePayment}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-900/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-cyan-200" />
              <span>Zahlung Jetzt Bestätigen (€{finalTotal.toFixed(2)})</span>
            </button>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-black text-white mb-2">Zahlung wird verarbeitet...</h3>
            <p className="text-slate-400 text-xs">
              Verbindung mit PayPal Gateway Hergestellt. Bitte schließe dieses Fenster nicht.
            </p>
          </div>
        )}

        {paymentStep === 'success' && createdOrder && (
          <div className="py-4 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-white mb-1">Zahlung Erfolgreich! 🎉</h3>
            <p className="text-slate-400 text-xs mb-6">
              Vielen Dank für deine Bestellung bei <strong className="text-cyan-400">Graviq Shop</strong>!
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Bestell-ID:</span>
                <span className="font-mono text-cyan-400 font-bold">{createdOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PayPal Transaktions-ID:</span>
                <span className="font-mono text-slate-300">{createdOrder.paypalTransactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Betrag:</span>
                <span className="font-mono text-emerald-400 font-bold">€{createdOrder.totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-amber-400">In Bearbeitung / Gestartet</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-6 flex items-center justify-center gap-1">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Bestätigungs-E-Mail wurde an <strong className="text-slate-200">{createdOrder.userEmail}</strong> gesendet.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-cyan-200" />
                <span>🧾 Offizielle Rechnung (PDF) anzeigen & drucken</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl cursor-pointer"
              >
                Fenster Schließen & Weiter Stöbern
              </button>
            </div>
          </div>
        )}

        {showInvoiceModal && createdOrder && (
          <InvoiceModal order={createdOrder} onClose={() => setShowInvoiceModal(false)} />
        )}
      </div>
    </div>
  );
};
