import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  User as UserIcon,
  PackageCheck,
  LifeBuoy,
  Gift,
  PlusCircle,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Wallet,
  Crown,
  Copy,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Ticket } from '../types';

interface UserDashboardProps {
  onClose: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onClose }) => {
  const {
    currentUser,
    orders,
    tickets,
    createTicket,
    replyTicket,
    coupons,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'vouchers' | 'settings'>('orders');

  // New ticket state
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<Ticket['category']>('bestellung');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Selected ticket view thread state
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  if (!currentUser) return null;

  const myOrders = orders.filter(
    (o) =>
      (o.userEmail && o.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      o.userId === currentUser.id
  );
  const myTickets = tickets.filter(
    (t) =>
      (t.userEmail && t.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      t.userId === currentUser.id
  );

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const created = createTicket(ticketSubject, ticketCategory, ticketMessage, selectedOrderId);
    setNewTicketModalOpen(false);
    setTicketSubject('');
    setTicketMessage('');
    setSelectedOrderId('');
    setActiveTicket(created);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    replyTicket(activeTicket.id, replyText);
    setReplyText('');
    const updated = tickets.find((t) => t.id === activeTicket.id);
    if (updated) setActiveTicket(updated);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Top Header Banner */}
        <div className="bg-slate-950/80 p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg shrink-0">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full rounded-[14px] object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white text-xl font-black">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {currentUser.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {currentUser.vipRank || 'Bronze'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span className="truncate">{currentUser.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Quick Stats Pills */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white font-mono">
                  {currentUser.coins ?? 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Coins</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black text-emerald-400 font-mono">
                  €{(currentUser.balance ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-auto sm:ml-0"
              title="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <div className="flex border-b border-slate-800/80 bg-slate-950/40 px-4 sm:px-6 gap-1 overflow-x-auto shrink-0">
          <button
            onClick={() => {
              setActiveTab('orders');
              setActiveTicket(null);
            }}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Bestellungen</span>
            {myOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {myOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tickets'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support-Tickets</span>
            {myTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                {myTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'vouchers'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gutscheine</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profil & Account</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-16 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                  <PackageCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-300">Noch keine Bestellungen</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Sobald du eine Bestellung aufgibst, erscheint dein Status und deine Lieferhistorie hier.
                  </p>
                </div>
              ) : (
                myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-4 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-cyan-400 font-extrabold text-sm tracking-wider">
                          {ord.id}
                        </span>
                        <span className="text-slate-500 text-xs flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ord.createdAt).toLocaleString('de-DE')}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit border ${
                          ord.status === 'geliefert'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : ord.status === 'in_bearbeitung'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        }`}
                      >
                        {ord.status === 'in_bearbeitung' ? 'In Bearbeitung' : ord.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-800/40"
                        >
                          <span className="text-slate-200 font-medium">
                            {it.title} <span className="text-slate-400">({it.amount} {it.unit})</span>
                          </span>
                          <span className="font-mono font-bold text-white">
                            €{(it.price * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs text-slate-400">
                      <div className="truncate max-w-full">
                        Ziel-Link:{' '}
                        <span className="text-slate-200 font-mono underline select-all">
                          {ord.targetLink}
                        </span>
                      </div>
                      <span className="text-sm font-black text-cyan-400 font-mono">
                        Gesamt: €{ord.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === 'tickets' && (
            <div>
              {!activeTicket ? (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                    <div>
                      <h3 className="text-base font-bold text-white">Support-Tickets</h3>
                      <p className="text-xs text-slate-400">
                        Hier kannst du den Status deiner Anfragen einsehen und mit dem Support schreiben.
                      </p>
                    </div>
                    <button
                      onClick={() => setNewTicketModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-purple-600/20"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Neues Ticket Erstellen</span>
                    </button>
                  </div>

                  {myTickets.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/60">
                      <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-sm font-bold text-slate-300">Keine Support-Tickets</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Hast du Fragen zu einer Bestellung oder benötigst Hilfe? Erstelle jederzeit ein Ticket!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myTickets.map((tck) => {
                        const lastMsg = tck.messages[tck.messages.length - 1];
                        return (
                          <div
                            key={tck.id}
                            onClick={() => setActiveTicket(tck)}
                            className="bg-slate-950/60 hover:bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 cursor-pointer transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2.5 mb-1">
                                <span className="font-mono text-xs font-bold text-cyan-400 shrink-0">
                                  {tck.id}
                                </span>
                                <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                  {tck.subject}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-400 truncate">
                                {lastMsg?.message || 'Keine Nachrichten'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                  tck.status === 'offen'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    : tck.status === 'in_bearbeitung'
                                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {tck.status}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(tck.updatedAt).toLocaleTimeString('de-DE', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Ticket Detail & Thread Chat */
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveTicket(null)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium transition-colors"
                  >
                    ← Zurück zur Ticketübersicht
                  </button>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          {activeTicket.id}
                        </span>
                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-xs text-slate-400 capitalize">
                          {activeTicket.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-0.5">
                        {activeTicket.subject}
                      </h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 capitalize">
                      {activeTicket.status}
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                    {activeTicket.messages.map((m) => {
                      const isMe = m.senderId === currentUser.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-purple-600 text-white rounded-tr-none shadow-md'
                                : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                            }`}
                          >
                            <div className="text-[10px] opacity-80 mb-1 font-bold flex items-center gap-1.5">
                              <span>{m.senderName}</span>
                              <span className="text-[9px] opacity-60">({m.senderRole})</span>
                            </div>
                            <p className="whitespace-pre-wrap">{m.message}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1 font-mono">
                            {new Date(m.createdAt).toLocaleTimeString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleReplySubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Deine Antwort eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>Senden</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* VOUCHERS TAB */}
          {activeTab === 'vouchers' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Aktive Gutscheincodes & Deals</h3>
                <p className="text-xs text-slate-400">
                  Kopiere den Code und löse ihn direkt beim Checkout ein.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.filter((c) => c.active).map((c) => (
                  <div
                    key={c.code}
                    className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 relative flex flex-col justify-between gap-3 group hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-lg font-black text-cyan-400 tracking-wider">
                          {c.code}
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px] rounded-full">
                          -{c.discountPercent}% Rabatt
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{c.description}</p>
                    </div>

                    <button
                      onClick={() => copyCouponCode(c.code)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-800 transition-colors cursor-pointer"
                    >
                      {copiedCoupon === c.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Kopiert!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Code kopieren</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-3">Account Details</h3>
                <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Anzeigename:</span>
                    <span className="text-white font-bold">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">E-Mail Adresse:</span>
                    <span className="text-white font-bold font-mono">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/40">
                    <span className="text-slate-400">Benutzer-Rolle:</span>
                    <span className="text-purple-400 font-bold capitalize">{currentUser.role}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">VIP Rang:</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      {currentUser.vipRank || 'Bronze'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discord Link Status */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-indigo-900/30 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Discord Konto-Sicherheit</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deine Daten und Guthaben sind mit deinem Konto gesichert.{' '}
                  {currentUser.discordUsername && (
                    <span className="text-indigo-300 font-semibold">
                      Verknüpft als @{currentUser.discordUsername}.
                    </span>
                  )}
                </p>
                <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-normal">
                  Bei Fragen zur Kontowiederherstellung wende dich bitte über das Support-Ticket System an uns.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Creating New Support Ticket */}
        {newTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setNewTicketModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-purple-400" />
                <span>Neues Support Ticket</span>
              </h3>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Betreff:
                  </label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="z.B. Frage zu meiner Bestellung"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Kategorie:
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as Ticket['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="bestellung">Bestellung & Lieferung</option>
                    <option value="zahlung">Zahlung / PayPal</option>
                    <option value="technisch">Technisches Problem</option>
                    <option value="sonstiges">Allgemeine Anfrage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Nachricht:
                  </label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Beschreibe deine Anliegen so genau wie möglich..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-lg shadow-purple-600/20"
                >
                  Ticket Absenden
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
