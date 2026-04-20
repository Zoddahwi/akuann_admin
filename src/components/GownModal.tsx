"use client";

import React, { useState } from "react";
import { X, Scissors, Upload, Sparkles } from "lucide-react";

interface GownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GownModal({ isOpen, onClose, onSuccess }: GownModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Bridal Couture",
    subcategory: "Ceremony",
    isCustomizable: true,
    imageUrl: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/gowns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: formData.imageUrl ? [formData.imageUrl] : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSuccess();
      onClose();
    } catch (err) {
      alert("Error saving gown. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-neutral-100 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Scissors size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">New Design</h2>
              <p className="text-xs text-neutral-500">Add a gown to your curation</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-neutral-100 text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Gown Name</label>
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Ethereal Bloom"
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                >
                  <option>Bridal Couture</option>
                  <option>Bridal Robes</option>
                  <option>Bridesmaids Collection</option>
                  <option>Bridal Accessories</option>
                  <option>Luxury Evening & Reception</option>
                  <option>Custom Orders</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Subcategory</label>
                <input 
                  value={formData.subcategory}
                  onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                  placeholder="e.g. Ceremony"
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Base Price (GHS)</label>
              <input 
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Description</label>
              <textarea 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Tell the story of this design..."
                className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Image URL</label>
              <div className="flex gap-2">
                <input 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 italic">Use Unsplash or similar for placeholders</p>
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-4 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Add to Collection"}
            <Sparkles size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
