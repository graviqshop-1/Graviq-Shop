import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  MessageSquare,
  ShieldCheck,
  Zap,
  Ticket,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LifeBuoy,
} from 'lucide-react';
import { S3EsportLogo } from './PartnerModal';

interface FaqModalProps {
  onClose: () => void;
  onOpenDashboardSupport?: () => void;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: React.ReactNode;
}

export const FaqModal: React.FC<FaqModalProps> = ({ onClose, onOpenDashboardSupport }) => {
  const [openId, setOpenId] = useState<string>('discord-login');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqItems: FaqItem[] = [
    {
      id: 'discord-login',
      category: 'login',
      question: 'Wie funktioniert der Discord Login & ist er sicher?',
      answer: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Der Discord-Login ist die sicherste und schnellste Methode, dich auf Graviq-Shop anzumelden. Du benötigst <strong>kein Passwort</strong> und musst dir keine Daten merken!
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Ein Klick verbindet dein vorhandenes Discord-Konto direkt via OAuth2.</li>
            <li>Es wird nur dein öffentlicher Discord-Name, Avatar & deine Discord-ID abgefragt.</li>
            <li>Deine Benutzerdaten werden verschlüsselt in unserer <strong>Firebase Firestore Datenbank</strong> gespeichert.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 's3-esport-partnership',
      category: 'support',
      question: 'S3 eSport Zusammenarbeit & Support-Möglichkeiten',
      answer: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-xl flex items-center gap-3">
            <S3EsportLogo className="w-10 h-10 shrink-0" />
            <div>
              <span className="text-purple-300 font-extrabold block">🤝 Offizielle Kooperation</span>
              <p className="text-[11px] text-slate-300">
                Wir arbeiten in Kürze offiziell mit <strong>S3 eSport</strong> zusammen!
              </p>
            </div>
          </div>
          <p>
            Du benötigst Hilfe zu deiner Bestellung oder hast eine Sponsoring-Anfrage? Wir haben den Support vereinfacht:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong>Website Support-Ticket:</strong> Erstelle ein Live-Ticket direkt in deinem Kunden-Dashboard.</li>
            <li><strong>Discord Support Server:</strong> Wende dich direkt an unser Team & S3 eSport auf Discord.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'no-emails-info',
      category: 'support',
      question: 'Warum erhalte ich keine nervigen E-Mails?',
      answer: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Auf Graviq-Shop verzichten wir bewusst auf unübersichtlichen E-Mail-Spam!
          </p>
          <p className="text-slate-400">
            Alle Rechnungen, Live-Bestellstati und Kundensupport-Antworten stehen dir rund um die Uhr in Echtzeit in deinem <strong>Kunden-Dashboard</strong> oder auf unserem <strong>Discord Support Server</strong> zur Verfügung.
          </p>
        </div>
      ),
    },
    {
      id: 'delivery-speed',
      category: 'order',
      question: 'Wie schnell werden Zuschauer & Follower geliefert?',
      answer: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Nach der Bezahlung via PayPal startet unser System vollautomatisch innerhalb von <strong>1 bis 5 Minuten</strong>.
          </p>
          <p className="text-slate-400">
            Du kannst die Dauer und Anzahl der Live-Zuschauer flexibel mit unserem interaktiven Regler anpassen. Den genauen Fortschritt siehst du in deinem Bestellverlauf.
          </p>
        </div>
      ),
    },
    {
      id: 'payment-methods',
      category: 'order',
      question: 'Welche Zahlungsmethoden werden unterstützt?',
      answer: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Wir unterstützen <strong>PayPal (Guthaben, Kreditkarte, SEPA, Später zahlen)</strong> inklusive vollem <strong>PayPal-Käuferschutz</strong>.
          </p>
          <p className="text-slate-400">
            Nach Absprache auf Discord können im Support-Ticket auch Gutscheincodes & Sondervereinbarungen eingelöst werden.
          </p>
        </div>
      ),
    },
    {
      id: 'create-ticket',
      category: 'support',
      question: 'Wie öffne ich ein Support-Ticket?',
      answer: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            Klicke oben rechts auf dein Profil oder auf das Support-Symbol. Gehe in den Reiter <strong>"Support-Tickets"</strong> und klicke auf <strong>"Neues Ticket Erstellen"</strong>.
          </p>
          <p className="text-slate-400">
            Unser Support-Team und die Moderatoren von S3 eSport antworten dir gewöhnlich innerhalb weniger Minuten.
          </p>
        </div>
      ),
    },
  ];

  const filteredItems = activeCategory === 'all' 
    ? faqItems 
    : faqItems.filter(i => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl relative overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-900/40 border border-purple-500/30 rounded-2xl text-purple-400 shadow-inner">
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Fragen & Antworten (FAQ)
              </h2>
              <p className="text-xs text-slate-400">
                Alles über Discord-Login, Support, S3 eSport Kooperation & Bestellungen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-2xl cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* S3 eSport Banner Announcement */}
        <div className="bg-gradient-to-r from-purple-900/50 via-indigo-950/80 to-cyan-950/50 p-4 border-b border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <S3EsportLogo className="w-8 h-8 shrink-0" />
            <div>
              <span className="bg-purple-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded-full mr-2">
                BALD VERFÜGBAR
              </span>
              <strong className="text-white">Zusammenarbeit mit S3 eSport:</strong>
              <p className="text-slate-300 text-[11px]">
                Support & Fragen beantworten wir direkt im Website-Ticket-System oder im offiziellen Discord!
              </p>
            </div>
          </div>

          {onOpenDashboardSupport && (
            <button
              onClick={() => {
                onClose();
                onOpenDashboardSupport();
              }}
              className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs whitespace-nowrap shadow-md cursor-pointer shrink-0"
            >
              Ticket Öffnen ➔
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-6 py-3 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-purple-600 text-white font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Alle Themen
          </button>
          <button
            onClick={() => setActiveCategory('login')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'login'
                ? 'bg-purple-600 text-white font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            👾 Discord Login
          </button>
          <button
            onClick={() => setActiveCategory('support')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'support'
                ? 'bg-purple-600 text-white font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            💬 Support & S3 eSport
          </button>
          <button
            onClick={() => setActiveCategory('order')}
            className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeCategory === 'order'
                ? 'bg-purple-600 text-white font-extrabold'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            🛒 Lieferung & Bezahlung
          </button>
        </div>

        {/* Accordion FAQ list */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-3">
          {filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenId(isOpen ? '' : item.id)}
                  className="w-full p-4 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{item.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-900 bg-slate-900/30">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Support CTA */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>Deine Frage wurde nicht beantwortet?</span>
          <div className="flex items-center gap-2">
            {onOpenDashboardSupport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDashboardSupport();
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5 text-cyan-400" />
                <span>Website Ticket Erstellen</span>
              </button>
            )}
            <a
              href="https://discord.gg/q8DwT3GsSn"
              target="_blank"
              rel="noreferrer"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Discord Support Server</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
