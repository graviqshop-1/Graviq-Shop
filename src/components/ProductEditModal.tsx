import React, { useState } from 'react';
import { ServicePackage, PlatformId, ServiceCategory } from '../types';
import { useShop } from '../context/ShopContext';
import { Package, X, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductEditModalProps {
  product?: ServicePackage | null; // If null, creating new package
  onClose: () => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, onClose }) => {
  const { addProduct, updateProduct, deleteProduct } = useShop();

  const isEditing = Boolean(product);

  const [title, setTitle] = useState(product?.title || '');
  const [platform, setPlatform] = useState<PlatformId>(product?.platform || 'twitch');
  const [category, setCategory] = useState<ServiceCategory>(product?.category || 'live');
  const [amount, setAmount] = useState<number>(product?.amount || 100);
  const [unit, setUnit] = useState<string>(product?.unit || 'Zuschauer');
  const [price, setPrice] = useState<number>(product?.price || 9.99);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(product?.originalPrice);
  const [deliverySpeed, setDeliverySpeed] = useState<string>(product?.deliverySpeed || 'Instant (1-3 Min)');
  const [isPopular, setIsPopular] = useState<boolean>(product?.isPopular || false);
  const [isBestValue, setIsBestValue] = useState<boolean>(product?.isBestValue || false);
  const [isActive, setIsActive] = useState<boolean>(product?.isActive !== false);

  const [features, setFeatures] = useState<string[]>(
    product?.features || ['24/7 Automatische Delivery', 'High Retention Quality', 'Kein Passwort nötig']
  );
  const [newFeatureInput, setNewFeatureInput] = useState('');

  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    setFeatures([...features, newFeatureInput.trim()]);
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) {
      alert('Bitte fülle Titel und einen gültigen Preis aus!');
      return;
    }

    if (isEditing && product) {
      updateProduct(product.id, {
        title: title.trim(),
        platform,
        category,
        amount: Number(amount),
        unit: unit.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        deliverySpeed: deliverySpeed.trim(),
        isPopular,
        isBestValue,
        isActive,
        features,
      });
    } else {
      const newPkg: ServicePackage = {
        id: `pkg_${platform}_${category}_${Date.now()}`,
        title: title.trim(),
        platform,
        category,
        amount: Number(amount),
        unit: unit.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        deliverySpeed: deliverySpeed.trim(),
        isPopular,
        isBestValue,
        isActive,
        features,
      };
      addProduct(newPkg);
    }

    onClose();
  };

  const handleDelete = () => {
    if (!product) return;
    if (confirm(`Möchtest du das Paket "${product.title}" wirklich löschen?`)) {
      deleteProduct(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl relative overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/20 text-purple-400 p-3 rounded-2xl border border-purple-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {isEditing ? `Paket bearbeiten: ${product?.title}` : 'Neues Paket erstellen'}
              </h3>
              <p className="text-xs text-slate-400">Exklusiver Admin Produkt-Editor (Nur für Administratoren)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Paket Titel *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. 250 Live Zuschauer 1h"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Plattform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformId)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="twitch">Twitch 🟣</option>
                <option value="tiktok">TikTok 🎵</option>
                <option value="youtube">YouTube 🔴</option>
                <option value="instagram">Instagram 📸</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="live">Live Zuschauer 👁️</option>
                <option value="followers">Follower & Subs 👤</option>
                <option value="likes">Likes & Reactions ❤️</option>
                <option value="views">Video Views 🎥</option>
                <option value="chatbots">Chatbots & Chatters 💬</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Liefergeschwindigkeit</label>
              <input
                type="text"
                value={deliverySpeed}
                onChange={(e) => setDeliverySpeed(e.target.value)}
                placeholder="z.B. Instant (1-3 Min)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Menge (Anzahl)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Einheit (Unit)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Zuschauer, Follower, Likes"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Preis (€) *</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Streichpreis (€ Optional)</label>
              <input
                type="number"
                step="0.01"
                value={originalPrice || ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="z.B. 14.99"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-400 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Badges & Active Switch */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Badges & Sichtbarkeit im Shop:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>Aktiv im Shop 🟢</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>"Bestseller" Badge 🔥</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={isBestValue}
                  onChange={(e) => setIsBestValue(e.target.checked)}
                  className="rounded border-slate-700 text-purple-600 focus:ring-0"
                />
                <span>"Bestes Angebot" 👑</span>
              </label>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">Feature Stichpunkte auf der Karte:</span>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {feat}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-slate-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFeatureInput}
                onChange={(e) => setNewFeatureInput(e.target.value)}
                placeholder="Weiteren Vorteil hinzufügen..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Hinzufügen</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Paket Löschen</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
              >
                <Save className="w-4 h-4" />
                <span>Speichern</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
