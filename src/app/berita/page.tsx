"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { cn } from "@/lib/utils";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const categories = ["Semua", "Gaya Hidup", "Tips Sehat", "Rekomendasi"];

const articles = [
  {
    id: 1,
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    category: "Semua",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
  },
  {
    id: 2,
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    category: "Semua",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
  },
  {
    id: 3,
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    category: "Semua",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
  },
  {
    id: 4,
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    category: "Gaya Hidup",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
  },
];

export default function BeritaPage() {
  useRequireAuth();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === "Semua" || a.category === activeCategory;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div style={{ background: GRADIENT }} className="relative z-10">
        <StatusBar />
        <div className="pb-6 pt-6">
          <h1 className="text-white font-bold text-lg text-center">
            Berita dan Artikel
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white px-4 pt-5 pb-4 flex flex-col gap-4">

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
          <input
            type="text"
            placeholder="Cari berita sesuai dengan keinginanmu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 bg-transparent"
          />
          <Search className="w-5 h-5 text-[#184087] shrink-0" />
        </div>

        {/* Kategori */}
        <div>
          <h2 className="text-[#184087] font-bold text-base mb-3">
            Kategori Berita
          </h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium border",
                  activeCategory === cat
                    ? "bg-[#46ADDC] text-white border-[#46ADDC]"
                    : "bg-white text-[#46ADDC] border-[#46ADDC]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Tidak ada berita ditemukan.
            </p>
          ) : (
            filtered.map((article) => (
              <Link
                key={article.id}
                href={`/berita/${article.id}`}
                className="flex gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm p-3 active:bg-gray-50 transition-colors"
              >
                {/* Gambar */}
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />

                {/* Info */}
                <div className="flex flex-col justify-between flex-1 py-0.5">
                  <p className="text-gray-800 font-semibold text-sm leading-snug line-clamp-3">
                    {article.title}
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="self-start bg-[#46ADDC] text-white text-[10px] font-medium px-3 py-0.5 rounded-full">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



