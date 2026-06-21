"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const faqs = [
  { id: 1, question: "Siapa saja anggota keluarga yang ditanggung oleh pekerja penerima upah?" },
  { id: 2, question: "Berapa besaran iuran PBI?" },
  { id: 3, question: "Bagaimana jika Kartu Peserta Hilang?" },
  { id: 4, question: "Berapa besaran iuran Peserta PBPU/Mandiri/Perseorangan?" },
  { id: 5, question: "Siapa saja anggota keluarga yang ditanggung oleh pekerja penerima upah?" },
  { id: 6, question: "Berapa besaran iuran PBI?" },
  { id: 7, question: "Bagaimana jika Kartu Peserta Hilang?" },
  { id: 8, question: "Berapa besaran iuran Peserta PBPU/Mandiri/Perseorangan?" },
  { id: 9, question: "Siapa saja anggota keluarga yang ditanggung oleh pekerja penerima upah?" },
  { id: 10, question: "Berapa besaran iuran PBI?" },
  { id: 11, question: "Bagaimana jika Kartu Peserta Hilang?" },
];

export default function FAQPage() {
  useRequireAuth();
  const [search, setSearch] = useState("");

  const filtered = faqs.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="pb-6 pt-6">
          <h1 className="text-white font-bold text-lg text-center">
            Frequently Asked Question (FAQ)
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white px-4 pt-5 pb-6 flex flex-col gap-4">
        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-4 py-2.5 shadow-sm">
          <input
            type="text"
            placeholder="Cari pertanyaan terkait MobileJKN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-gray-700 outline-none placeholder:text-gray-400 bg-transparent"
          />
          <Search className="w-5 h-5 text-[#184087] shrink-0" />
        </div>

        {/* FAQ list */}
        <div className="flex flex-col gap-3 mt-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Pertanyaan tidak ditemukan.
            </p>
          ) : (
            filtered.map((faq) => (
              <Link
                key={faq.id}
                href={`/faq/${faq.id}`}
                className="w-full flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-4 text-left active:bg-gray-50 transition-colors"
              >
                <span className="text-gray-800 text-sm font-medium leading-snug flex-1">
                  {faq.question}
                </span>
                <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



