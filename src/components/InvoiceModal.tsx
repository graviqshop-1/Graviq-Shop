import React from 'react';
import { Order } from '../types';
import { Download, Printer, ShieldCheck, CheckCircle2, Building, Sparkles } from 'lucide-react';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const invoiceContent = `
============================================================
GRAVIQ DIGITAL MEDIA & S3 ESPORT GAMING NETWORK
OFFIZIELLE RECHNUNG / INVOICE #${order.id}
============================================================
Datum: ${new Date(order.createdAt).toLocaleDateString('de-DE')} ${new Date(order.createdAt).toLocaleTimeString('de-DE')}
Zahlungsart: ${order.paymentMethod.toUpperCase()}
Transaktions-ID: ${order.paypalTransactionId || 'N/A'}

KUNDENDATEN:
------------------------------------------------------------
Name: ${order.userName}
E-Mail: ${order.userEmail}
Ziel-Link: ${order.targetLink}

BESTELLTE POSITIONEN:
------------------------------------------------------------
${order.items
  .map(
    (item, index) =>
      `${index + 1}. ${item.title} (${item.amount} ${item.unit})\n   Menge: ${item.quantity} x €${item.price.toFixed(
        2
      )} = €${(item.price * item.quantity).toFixed(2)}`
  )
  .join('\n')}

------------------------------------------------------------
Zwischensumme: €${(order.totalPrice + (order.discountApplied || 0)).toFixed(2)}
Rabatte / Coupons: -€${(order.discountApplied || 0).toFixed(2)}
Gesamtsumme (Inkl. 19% MwSt.): €${order.totalPrice.toFixed(2)}
Enthaltene 19% MwSt.: €${((order.totalPrice * 19) / 119).toFixed(2)}

ZAHLUNGSSTATUS: BEZAHLT & VERIFIZIERT ✓
============================================================
Vielen Dank für Ihre Bestellung bei Graviq x S3 eSport!
Support: support@graviq.shop | Discord: discord.gg/q8DwT3GsSn
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rechnung_${order.id}_Graviq.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const rawTotal = order.items.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const vatAmount = (order.totalPrice * 19) / 119;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center print:p-0 print:bg-white print:text-black">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:bg-white print:max-w-none print:rounded-none">
        
        {/* Top Header / Action Buttons */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-400 font-mono">RECHNUNG {order.id}</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
              BEZAHLT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Drucken</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Herunterladen</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-xl cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-200 print:text-slate-900 print:p-4">
          
          {/* Company Branding & Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 pb-6 print:border-slate-300 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-black text-white text-sm">
                  G
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white print:text-black">GRAVIQ SHOP</h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Offizieller Partner von <strong>S3 eSport Network</strong>
              </p>
              <p className="text-[11px] text-slate-500 print:text-slate-500 mt-1">
                Digital Streaming & Social Media Enhancement Services
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <div className="text-cyan-400 print:text-slate-900 font-extrabold text-base">RECHNUNG</div>
              <div className="text-slate-300 print:text-slate-800 font-bold">#INV-{order.id}</div>
              <div className="text-slate-400 print:text-slate-600 mt-1">
                Datum: {new Date(order.createdAt).toLocaleDateString('de-DE')}
              </div>
              <div className="text-slate-400 print:text-slate-600">
                Zahlungsart: <span className="uppercase text-white print:text-black font-bold">{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer & Transaction Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 print:bg-slate-100 p-4 rounded-2xl border border-slate-800 print:border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 print:text-slate-500 font-semibold block mb-1">Empfänger / Rechnungsadresse:</span>
              <div className="font-bold text-white print:text-slate-900">{order.userName}</div>
              <div className="text-slate-400 print:text-slate-700">{order.userEmail}</div>
              <div className="text-slate-400 print:text-slate-700 mt-1">
                Ziel-Link: <span className="font-mono text-cyan-400 print:text-slate-900">{order.targetLink}</span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-slate-500 print:text-slate-500 font-semibold block mb-1">Transaktions-Details:</span>
              <div className="text-slate-300 print:text-slate-800">
                PayPal-TX: <span className="font-mono text-white print:text-black font-bold">{order.paypalTransactionId || 'PAYPAL-VERIFIED'}</span>
              </div>
              <div className="text-slate-400 print:text-slate-700 mt-1">
                Status: <strong className="text-emerald-400 print:text-emerald-700 uppercase">Bezahlt & In Bearbeitung</strong>
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Pos.</th>
                  <th className="py-2.5 px-3">Leistung / Paket</th>
                  <th className="py-2.5 px-3 text-center">Menge</th>
                  <th className="py-2.5 px-3 text-right">Einzelpreis</th>
                  <th className="py-2.5 px-3 text-right">Gesamt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                {order.items.map((it, idx) => (
                  <tr key={idx} className="text-slate-200 print:text-slate-800">
                    <td className="py-3 px-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold">
                      {it.title} ({it.amount} {it.unit})
                      {it.duration && <span className="text-slate-400 print:text-slate-600 text-[11px] block">Laufzeit: {it.duration}</span>}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">€{it.price.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white print:text-slate-900">
                      €{(it.price * it.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-slate-800 print:border-slate-300 pt-4 flex flex-col items-end space-y-1 text-xs">
            <div className="flex justify-between w-64 text-slate-400 print:text-slate-600">
              <span>Zwischensumme:</span>
              <span className="font-mono">€{rawTotal.toFixed(2)}</span>
            </div>

            {order.discountApplied && order.discountApplied > 0 && (
              <div className="flex justify-between w-64 text-emerald-400 print:text-emerald-700">
                <span>Rabatt / Gutschein ({order.couponCode || 'Saison-Event'}):</span>
                <span className="font-mono">-€{order.discountApplied.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between w-64 text-slate-500 print:text-slate-500 text-[11px]">
              <span>Enthaltene 19% MwSt.:</span>
              <span className="font-mono">€{vatAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between w-64 pt-2 border-t border-slate-800 print:border-slate-300 text-base font-black text-white print:text-black">
              <span>Gesamtsumme:</span>
              <span className="font-mono text-cyan-400 print:text-slate-900">€{order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Legal & Support Note */}
          <div className="pt-6 border-t border-slate-800/80 print:border-slate-300 text-[11px] text-slate-500 print:text-slate-600 flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-slate-800" />
              <span>Vielen Dank für Ihre Bestellung! S3 eSport & Graviq Quality Guaranteed.</span>
            </div>
            <span>Graviq Support: support@graviq.shop</span>
          </div>

        </div>

      </div>
    </div>
  );
};
