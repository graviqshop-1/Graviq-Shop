import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Star, MessageSquare, CheckCircle, Coins, Send, ThumbsUp } from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({ productId }) => {
  const { productReviews, addProductReview, currentUser, setAuthModalOpen } = useShop();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const reviews = productReviews.filter((r) => r.productId === productId);
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addProductReview(productId, rating, comment.trim());
    setComment('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="mt-8 border-t border-slate-800/80 pt-6 space-y-6">
      {/* Reviews Summary Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" /> Produkt-Bewertungen & Kundenfeedback ⭐
          </h3>
          <p className="text-xs text-slate-400">
            {reviews.length} {reviews.length === 1 ? 'Bewertung' : 'Bewertungen'} • Durchschnitt: <strong className="text-amber-400">{avgRating} / 5.0</strong>
          </p>
        </div>

        <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs text-amber-300 font-bold">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Schreibe eine Bewertung & erhalte +15 Graviq Coins!</span>
        </div>
      </div>

      {/* Review Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-200">Deine Sterne-Bewertung:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Schreibe ein kurzes Feedback zu diesem Paket (z.B. Schnelligkeit, Bot-Qualität, Support)..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none custom-scrollbar"
          />

          <div className="flex justify-between items-center">
            {submitted ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Danke! +15 Graviq Coins gutgeschrieben.
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Du wirst als verifizierter Kunde gelistet.</span>
            )}

            <button
              type="submit"
              disabled={!comment.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bewertung Absenden (+15 Coins)</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-2">
          <p className="text-xs text-slate-400">Melde dich an, um eine Bewertung abzugeben und Coins zu verdienen!</p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            Jetzt Einloggen
          </button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">Noch keine Bewertungen vorhanden. Sei der Erste!</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-200">{r.userName}</span>
                  {r.verifiedBuyer && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3 h-3" /> Verifizierter Käufer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>
              <span className="text-[10px] text-slate-500 block">
                {new Date(r.createdAt).toLocaleDateString('de-DE')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
