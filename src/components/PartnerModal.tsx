import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Trophy, Zap, Send, ShieldCheck, Sparkles, CheckCircle2, Star, Users } from 'lucide-react';

export const S3EsportLogo: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* S3 eSport Inverted Triangular Crest Logo SVG */}
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]" fill="none">
        <polygon points="10,10 90,10 50,90" stroke="url(#s3Gradient)" strokeWidth="6" fill="rgba(15, 23, 42, 0.8)" />
        <path d="M 28 25 L 72 25 L 45 50 L 68 50 L 38 75" stroke="url(#s3Gradient)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="s3Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export const PartnerModal: React.FC = () => {
  const { partnerModalOpen, setPartnerModalOpen, submitPartnerApplication } = useShop();

  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [channelName, setChannelName] = useState('');
  const [platform, setPlatform] = useState('Twitch');
  const [followerCount, setFollowerCount] = useState('1.000 - 5.000');
  const [socialLink, setSocialLink] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!partnerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail || !channelName || !socialLink) return;

    submitPartnerApplication({
      applicantName,
      applicantEmail,
      channelName,
      platform,
      followerCount,
      socialLink,
      message: message || 'Partnerschafts-Anfrage für Graviq x S3 eSport',
    });

    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setApplicantName('');
    setApplicantEmail('');
    setChannelName('');
    setSocialLink('');
    setMessage('');
    setPartnerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden my-8">
        
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-cyan-950 border-b border-slate-800 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl cursor-pointer"
          >
            ✕
          </button>

          <div className="flex items-center gap-4">
            <S3EsportLogo className="w-14 h-14" />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  ⚡ Offizielles Sponsoring
                </span>
                <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                  S3 eSport Partner
                </span>
                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ⏳ Bald verfügbar
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Graviq x S3 eSport Partnerschaft
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Werde offizieller Partner & profitiere von Gratis Viewer-Boosts, Sponsoring & VIP Support!
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {!submitted ? (
            <>
              {/* Partner Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                  <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Turnier & Team Boost</h4>
                    <p className="text-[11px] text-slate-400">Stream-Guthaben & Rabatte für dein Team.</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                  <Zap className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">VIP Prio-Lieferung</h4>
                    <p className="text-[11px] text-slate-400">Bevorzugter Live-Server Support.</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                  <Star className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Eigenes Promo-Code</h4>
                    <p className="text-[11px] text-slate-400">Verdiene Extra-Guthaben pro Sale.</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Partnerschafts-Bewerbungsformular
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">
                      Dein Name / Team Name: *
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="z.B. S3 Apex Squad oder Max Mustermann"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">
                      Kontakt E-Mail-Adresse: *
                    </label>
                    <input
                      type="email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="z.B. streamer@s3esport.de"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">
                      Streamer / Kanal Name: *
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="z.B. S3_Gaming_TV"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Plattform:</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="Twitch">Twitch</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Esports Team">Esports Team</option>
                      <option value="Sonstiges">Sonstiges</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">Reichweite / Follower:</label>
                    <select
                      value={followerCount}
                      onChange={(e) => setFollowerCount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="500 - 1.000">500 - 1.000 Follower</option>
                      <option value="1.000 - 5.000">1.000 - 5.000 Follower</option>
                      <option value="5.000 - 20.000">5.000 - 20.000 Follower</option>
                      <option value="20.000+">20.000+ Follower / Pro Team</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Link zu deinem Stream / Social Media: *
                  </label>
                  <input
                    type="url"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    placeholder="https://twitch.tv/deinkanal oder https://tiktok.com/@deinname"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">
                    Kurze Vorstellung / Nachricht (Optional):
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Erzähle uns kurz etwas über deine Streams, Spiele oder dein eSports Team..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-2xl cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Partnerschafts-Bewerbung Jetzt Absenden</span>
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">Bewerbung Erfolgreich Eingegangen!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Vielen Dank für deine Bewerbung bei <strong>Graviq x S3 eSport</strong>. Das Team Graviq & S3 eSport prüft deine Angaben und meldet sich innerhalb von 24 Stunden per E-Mail bei dir!
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-1">
                <div className="text-slate-400">Bewerber: <strong className="text-white">{applicantName}</strong></div>
                <div className="text-slate-400">Kanal: <strong className="text-cyan-400">{channelName} ({platform})</strong></div>
                <div className="text-slate-400">Status: <strong className="text-amber-400">In Prüfung 🟡</strong></div>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Schließen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
