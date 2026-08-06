import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle, CreditCard, Lock, FileText, Mail } from 'lucide-react';
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
  const [targetLink, setTargetLink] = useState<string>(cart[0]?.targetLink || '');
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [sdkLoaded, setSdkLoaded] = useState<boolean>(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const couponDisc = appliedCoupon ? (rawTotal * appliedCoupon.discountPercent) / 100 : 0;
  const seasonDisc = (rawTotal * (shopSettings.seasonDiscountPercent || 0)) / 100;
  const finalTotal = Math.max(0, rawTotal - (couponDisc + seasonDisc));

  const isMaintenance = !!shopSettings.isMaintenanceMode;
  const isLive = shopSettings.paypalMode === 'live' && !isMaintenance;

  // Lade das offizielle PayPal SDK dynamisch beim Öffnen des Modals
  useEffect(() => {
    if (!shopSettings.paypalClientId) {
      setSdkError('Keine PayPal Client-ID in den Shop-Einstellungen gefunden.');
      return;
    }

    // Prüfen, ob das SDK bereits geladen ist
    if (window.paypal) {
      setSdkLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${shopSettings.paypalClientId}&currency=EUR`;
    script.async = true;
    script.onload = () => setSdkLoaded(true);
    script.onerror = () => setSdkError('Fehler beim Laden des PayPal SDKs. Bitte Internetverbindung prüfen.');
    document.body.appendChild(script);
  }, [shopSettings.paypalClientId]);

  // Rendere die PayPal Buttons sobald das SDK da ist
  useEffect(() => {
    if (sdkLoaded && paymentStep === 'review' && window.paypal) {
      // Vorherigen Container leeren falls vorhanden
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';

      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          if (!targetLink) {
            alert('Bitte gib zuerst deinen Ziel-Link / Stream-URL ein!');
            throw new Error('Ziel-Link fehlt');
          }
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: finalTotal.toFixed(2)
              },
              description: 'Graviq Shop - Social Media Service'
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setPaymentStep('processing');
          try {
            const details = await actions.order.capture();
            const txId = details.id || `PAYPAL-TX-${Date.now()}`;
            
            const order = placeOrder(
              isLive ? 'paypal_live' : 'paypal_sandbox',
              targetLink || 'https://twitch.tv/',
              txId
            );
            
            setCreatedOrder(order);
            setPaymentStep('success');

            try {
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
              });
            } catch (e) {
              // ignore
            }

            onSuccess(order);
          } catch (err) {
            console.error('PayPal Capture Error:', err);
            setPaymentStep('review');
            alert('Fehler bei der Zahlungsabwicklung durch PayPal.');
          }
        },
        onError: (err: any) => {
          console.error('PayPal Checkout Error:', err);
          alert('Ein Fehler ist bei der PayPal-Zahlung aufgetreten.');
          setPaymentStep('review');
        }
      }).render('#paypal-button-container');
    }
  }, [sdkLoaded, paymentStep, finalTotal, targetLink, isLive, placeOrder, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

        {paymentStep === 'review' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600/20 text-blue-400 p-2 rounded-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Echter PayPal Checkout</h3>
                  <p className="text-xs text-slate-400">Sichere SSL-Verschlüsselte Zahlung</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>Zahlungs-Modus:</span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                  isLive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {isLive ? '🟢 LIVE (Echte PayPal Zahlung)' : '🟡 SANDBOX (Testmodus)'}
                </span>
              </div>
            </div>

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

            {sdkError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs rounded-xl">
                {sdkError}
              </div>
            )}

            {/* Hier platziert PayPal automatisch den echten Button */}
            <div className="mt-6">
              {!sdkLoaded ? (
                <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Lade sicheres PayPal Checkout...
                </div>
              ) : (
                <div id="paypal-button-container" className="w-full"></div>
              )}
            </div>
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

            <div className="space-y-3">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-cyan-200" />
                <span>Offizielle Rechnung (PDF) anzeigen & drucken</span>
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