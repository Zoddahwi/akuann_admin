"use client";
// Forced re-compile to ensure Client Component directive is recognized.

import React, { useState, useEffect } from "react";
import { Scissors, Plus, Star, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import GownModal from "@/components/GownModal";

export default function AdminGownsPage() {
  const [gowns, setGowns] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchGowns = async (page = 1, category = "All") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/gowns?page=${page}&limit=8&category=${category}`);
      const data = await res.json();
      setGowns(data.gowns || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalItems(data.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGowns(currentPage, activeCategory);
  }, [currentPage, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1); // Reset to first page on category change
  };

  const categories = [
    "All",
    "Bridal Couture",
    "Bridal Robes",
    "Bridesmaids Collection",
    "Bridal Accessories",
    "Luxury Evening & Reception",
    "Custom Orders"
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">Collection Management</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Curate your digital boutique. Manage descriptions, pricing, and availability. ({totalItems} items)
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-6 text-sm font-bold text-white transition hover:bg-neutral-800 shadow-lg shadow-neutral-900/10"
        >
          <Plus size={18} />
          New Gown
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-10 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold pb-2 transition-all duration-300 ${
              activeCategory === cat
                ? "border-neutral-900 bg-neutral-900 text-white shadow-md shadow-neutral-400"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="pc-grid">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="pc-card animate-pulse">
              <div className="pc-card__thumb-wrap bg-neutral-100" />
            </div>
          ))}
        </div>
      ) : gowns.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-neutral-200 bg-neutral-50 py-20 text-center text-neutral-500">
          No gowns found in the "{activeCategory}" category.
        </div>
      ) : (
        <>
          <div className="pc-grid">
            {gowns.map((gown) => (
              <div key={gown.id} className="pc-card group">
                {/* Category label */}
                <div className="pc-card__category">
                  {gown.category}
                </div>

                {/* Thumbnail */}
                <div className="pc-card__thumb-stack">
                  <div className="pc-card__thumb-wrap">
                    {gown.images[0] ? (
                      <img src={gown.images[0]} alt={gown.name} className="pc-card__thumb-img" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-300">
                        <Scissors size={40} strokeWidth={1} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Heading */}
                <h2 className="pc-card__heading">{gown.name}</h2>

                {/* Description */}
                <p className="pc-card__desc">{gown.description || "No description provided."}</p>

                {/* Price & Rating row */}
                <div className="pc-card__price-row">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Base Price</span>
                    <span className="text-sm font-bold text-neutral-900">GH₵{gown.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                    <Star size={12} fill="currentColor" />
                    {gown.rating || 5.0}
                  </div>
                </div>

                {/* Admin Actions */}
                <div className="pc-card__btn-group">
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-full bg-neutral-900 py-3 text-xs font-bold text-white transition hover:bg-neutral-800">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50">
                    <Scissors size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`h-10 w-10 rounded-full text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-neutral-900 text-white shadow-lg"
                        : "text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      <GownModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => fetchGowns(currentPage, activeCategory)}
      />
    </div>
  );
}
