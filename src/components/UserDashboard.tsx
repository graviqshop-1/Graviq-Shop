import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  User,
  PackageCheck,
  LifeBuoy,
  Key,
  Gift,
  PlusCircle,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
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
    loginWithDiscord,
    logout,
    coupons,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets' | 'settings' | 'vouchers'>('orders');

  // New ticket state
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<Ticket['category']>('bestellung');
  const [ticketMessage, setTicketMessage] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');

  // Selected ticket view thread state
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [replyText, setReplyText] = useState('');

  // Password reset state inside settings
  const [newPass, setNewPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  if (!currentUser) return null;

  const myOrders = orders.filter((o) => o.userEmail.toLowerCase() === currentUser.email.toLowerCase() || o.userId === currentUser.id);
  const myTickets = tickets.filter((t) => t.userEmail.toLowerCase() === currentUser.email.toLowerCase() || t.userId === currentUser.id);

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    const created = createTicket(ticketSubject, ticketCategory, ticketMessage, selectedOrderId);
    setNewTicketModalOpen(false);
    setTicketSubject('');
    setTicketMessage('');
    setActiveTicket(created);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;

    replyTicket(activeTicket.id, replyText);
    setReplyText('');
    // Refresh active ticket reference
    const updated = tickets.find((t) => t.id === activeTicket.id);
    if (updated) setActiveTicket(updated);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass) return;
    setPassSuccess(true);
    setNewPass('');
    setTimeout(() => setPassSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl relative overflow-hidden my-auto">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-purple-900/60 via-slate-900 to-cyan-950 p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-white text-lg sm:text-2xl font-black shadow-lg shrink-0">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                Willkommen, {currentUser.name}! 👋
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="truncate max-w-[150px] sm:max-w-none">{currentUser.email}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 hidden sm:inline-block" />
                <span className="capitalize text-cyan-400 font-bold">Rolle: {currentUser.role}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-2 sm:p-2.5 rounded-2xl cursor-pointer text-sm font-bold shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('orders');
              setActiveTicket(null);
            }}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'orders'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Bestellverlauf ({myOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'tickets'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support-Tickets ({myTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vouchers')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'vouchers'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Gutscheine & Deals</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Passwort & Profil</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Du hast bisher noch keine Bestellungen getätigt.
                </div>
              ) : (
                myOrders.map((ord) => (
                  <div key={ord.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
                      <div>
                        <span className="font-mono text-cyan-400 font-extrabold text-sm">{ord.id}</span>
                        <span className="text-slate-500 text-xs ml-3">
                          {new Date(ord.createdAt).toLocaleString('de-DE')}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase w-fit ${
                          ord.status === 'geliefert'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ord.status === 'in_bearbeitung'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                            : 'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}
                      >
                        {ord.status === 'in_bearbeitung' ? 'In Bearbeitung / Gestartet' : ord.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                          <span>
                            {it.title} ({it.amount} {it.unit})
                          </span>
                          <span className="font-mono text-white">€{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-xs text-slate-400">
                      <span>Ziel: <strong className="text-slate-200">{ord.targetLink}</strong></span>
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
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Deine Kundensupport-Tickets</h3>
                    <button
                      onClick={() => setNewTicketModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Neues Ticket Erstellen</span>
                    </button>
                  </div>

                  {myTickets.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      Keine Support-Tickets vorhanden. Haben Sie eine Frage? Erstelle jetzt ein Ticket!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myTickets.map((tck) => (
                        <div
                          key={tck.id}
                          onClick={() => setActiveTicket(tck)}
                          className="bg-slate-950 hover:bg-slate-900 p-4 rounded-2xl border border-slate-800 cursor-pointer transition-colors flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-bold text-cyan-400">{tck.id}</span>
                              <span className="text-white text-sm font-bold">{tck.subject}</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate max-w-md">
                              {tck.messages[tck.messages.length - 1]?.message}
                            </p>
                          </div>

                          <div className="text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase block mb-1 ${
                                tck.status === 'offen'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : tck.status === 'in_bearbeitung'
                                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {tck.status}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(tck.updatedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Ticket Detail & Live Chat Thread */
                <div>
                  <button
                    onClick={() => setActiveTicket(null)}
                    className="text-xs text-slate-400 hover:text-white mb-4 flex items-center gap-1 cursor-pointer"
                  >
                    ← Zurück zur Ticketliste
                  </button>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-cyan-400">{activeTicket.id}</span>
                        <h3 className="text-lg font-bold text-white">{activeTicket.subject}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        {activeTicket.status}
                      </span>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-2">
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
                                ? 'bg-purple-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                            }`}
                          >
                            <div className="text-[10px] opacity-75 mb-1 font-bold">
                              {m.senderName} ({m.senderRole})
                            </div>
                            <p className="whitespace-pre-wrap">{m.message}</p>
                          </div>
                          <span className="text-[9px] text-slate-500 mt-1">
                            {new Date(m.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
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
                      placeholder="Deine Nachricht an den Support eingeben..."
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
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
              <h3 className="text-lg font-bold text-white mb-2">Aktive Rabattgutscheine</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.filter(c => c.active).map((c) => (
                  <div key={c.code} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
                    <span className="font-mono text-xl font-black text-cyan-400 block tracking-widest uppercase">
                      {c.code}
                    </span>
                    <p className="text-xs text-slate-300 mt-1">{c.description}</p>
                    <span className="inline-block mt-3 px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-xs rounded">
                      -{c.discountPercent}% Rabatt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="max-w-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">Account Informationen</h3>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Name:</span>
                    <span className="text-slate-200 font-bold">{currentUser.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">E-Mail / Account ID:</span>
                    <span className="text-slate-200 font-bold">{currentUser.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Discord Verknüpfung:</span>
                    <span className="text-indigo-400 font-bold">
                      {currentUser.discordUsername || 'Discord Account verknüpft'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discord Konto Info */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-900/40 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>👾 Discord Konto-Status & Support</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deine Benutzerdaten sind dauerhaft mit deinem Discord-Account verknüpft.
                </p>
                <div className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs rounded-xl flex items-center justify-center gap-2 px-3 text-center">
                  <span>🔒 Das Konto kann im Profil nicht erneut verknüpft werden. Bei Verlust des Discord-Zugriffs hilft dir unser Support gerne weiter!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Creating New Support Ticket */}
        {newTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
              <button
                onClick={() => setNewTicketModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-xl font-bold text-white mb-4">Neues Support Ticket</h3>

              <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Betreff:</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="z.B. Frage zu Bestellung GRVQ-88421"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Kategorie:</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as Ticket['category'])}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="bestellung">Bestellung & Lieferung</option>
                    <option value="zahlung">Zahlung / PayPal</option>
                    <option value="technisch">Technisches Problem</option>
                    <option value="sonstiges">Allgemeine Anfrage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Deine Nachricht:</label>
                  <textarea
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Beschreibe deine Anfrage so genau wie möglich..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
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
