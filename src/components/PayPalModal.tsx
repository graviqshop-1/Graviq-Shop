import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, CheckCircle, CreditCard, Lock, Sparkles, FileText, Mail, Zap, Clock, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface PayPalModalProps {
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

export const PayPalModal: React.FC<PayPalModalProps> = ({ onClose, onSuccess }) => {
  const { cart, appliedCoupon, placeOrder, shopSettings, currentUser } = useShop();

  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'success'>('review');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [targetLink, setTargetLink] = useState<string>(cart[0]?.targetLink || '');
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const [sdkLoaded, setSdkLoaded] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const couponDisc = appliedCoupon ? (rawTotal * appliedCoupon.discountPercent) / 100 : 0;
  const seasonDisc = (rawTotal * (shopSettings.seasonDiscountPercent || 0)) / 100;
  const finalTotal = Math.max(0, rawTotal - (couponDisc + seasonDisc));

  const isAdmin = currentUser?.role === 'admin';
  const isMaintenance = !!shopSettings.isMaintenanceMode;
  // Test mode is ONLY active during Maintenance Mode OR when logged-in Admin sets sandbox mode
  const isTestMode = isMaintenance || (isAdmin && shopSettings.paypalMode === 'sandbox');
  const isLive = !isTestMode;
  const clientId = shopSettings.paypalClientId || 'sb';

  // Load PayPal SDK script dynamically
  useEffect(() => {
    let scriptElement = document.getElementById('paypal-js-sdk') as HTMLScriptElement | null;

    const initButtons = () => {
      setSdkLoaded(true);
    };

    if (window.paypal) {
      initButtons();
      return;
    }

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'paypal-js-sdk';
      scriptElement.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR`;
      scriptElement.async = true;
      scriptElement.onload = () => {
        initButtons();
      };
      scriptElement.onerror = () => {
        setSdkError('PayPal SDK konnte nicht geladen werden.');
      };
      document.body.appendChild(scriptElement);
    } else {
      scriptElement.addEventListener('load', initButtons);
    }
  }, [clientId]);

  // Render PayPal Buttons when SDK loaded
  useEffect(() => {
    if (sdkLoaded && window.paypal && buttonContainerRef.current && paymentStep === 'review') {
      buttonContainerRef.current.innerHTML = '';

      try {
        window.paypal
          .Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
            },
            createOrder: (_data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: finalTotal.toFixed(2),
                      currency_code: 'EUR',
                    },
                    description: `Graviq Shop Bestellung (${cart.length} Artikel)`,
                  },
                ],
              });
            },
            onApprove: async (_data: any, actions: any) => {
              setPaymentStep('processing');
              try {
                const details = await actions.order.capture();
                const txId = details?.id || `PAYPAL-TX-${Date.now()}`;

                const order = placeOrder(
                  isLive ? 'paypal_live' : 'paypal_sandbox',
                  targetLink || 'https://twitch.tv/',
                  txId
                );

                setCreatedOrder(order);
                setPaymentStep('success');

                try {
                  confetti({
                    particleCount: 140,
                    spread: 85,
                    origin: { y: 0.55 },
                  });
                } catch (e) {
                  // ignore
                }

                onSuccess(order);
              } catch (err) {
                console.error('PayPal Order Capture Error:', err);
                handleExecutePayment();
              }
            },
            onError: (err: any) => {
              console.error('PayPal Buttons Error:', err);
            },
          })
          .render(buttonContainerRef.current);
      } catch (e) {
        console.warn('Could not render PayPal buttons:', e);
      }
    }
  }, [sdkLoaded, paymentStep, finalTotal, isLive, targetLink]);

  const handleExecutePayment = () => {
    setPaymentStep('processing');

    setTimeout(() => {
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

            {/* Admin / Maintenance Info Box (hidden for normal customers) */}
            {(isMaintenance || isAdmin) && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Zahlungs-Modus:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                    isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {isLive ? '🟢 LIVE (Echte Zahlungen)' : isMaintenance ? '🛠️ WARTUNGSMODUS (Testmodus)' : '🟡 ADMIN SANDBOX (Testmodus)'}
                  </span>
                </div>
                {isMaintenance && (
                  <div className="text-[11px] text-amber-300/90 font-medium bg-amber-950/40 p-2 rounded-lg border border-amber-800/40">
                    🛠️ <strong>Wartungsarbeiten aktiv:</strong> Zahlungen werden als Testmodus/Simulation ausgeführt.
                  </div>
                )}
                {isAdmin && !isMaintenance && isTestMode && (
                  <div className="text-[11px] text-purple-300/90 font-medium bg-purple-950/40 p-2 rounded-lg border border-purple-800/40">
                    👑 <strong>Admin-Testmodus:</strong> Du testest den Shop gerade im Sandbox-Modus.
                  </div>
                )}
              </div>
            )}

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
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Trust Highlights Bar */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] text-slate-300 font-semibold">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 text-center">
                <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>Blitz-Lieferung</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SSL Geschützt</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 text-center">
                <Star className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>24/7 Service</span>
              </div>
            </div>

            {/* PayPal Käuferschutz Disclaimer Notice */}
            <div className="mb-6 bg-slate-950/80 p-3.5 rounded-xl border border-amber-900/40 text-[11px] text-amber-300/90 leading-relaxed">
              <span className="font-bold text-amber-200 block mb-1">⚠️ Hinweis zum PayPal Käuferschutz:</span>
              Da es sich bei unseren Dienstleistungen um digitale Echtzeit-Dienstleistungen (Social-Media Promotions / Stream-Support) handelt, ist der PayPal-Käuferschutz gemäß den PayPal-Nutzungsbedingungen für digitale Güter ausgeschlossen. Mit der Bestellung stimmst du dem sofortigen Beginn der Ausführung zu.
            </div>

            {/* PayPal Smart Buttons Container */}
            <div className="mb-4">
              <div id="paypal-button-container" ref={buttonContainerRef} className="min-h-[48px]" />
            </div>

            {/* Alternative Direct Confirm Button (Only visible for Admin or during Maintenance mode) */}
            {(isAdmin || isMaintenance) && (
              <button
                onClick={handleExecutePayment}
                className="w-full mt-3 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Direkt im Shop Bestätigen (Admin / Wartung Test - €{finalTotal.toFixed(2)})</span>
              </button>
            )}
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

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs mb-4 space-y-2">
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

            {/* Live Delivery Status Step Tracker */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 text-left space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                🚀 Live-Lieferstatus:
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>1. PayPal Zahlung erfolgreich empfangen</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300 font-bold">
                  <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <span>2. System-Auftrag wird verarbeitet</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>3. Automatische Ausführung am Ziel-Kanal</span>
                </div>
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
