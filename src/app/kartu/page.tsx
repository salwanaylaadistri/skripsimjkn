"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const pesertaList = [
  { nama: "Salwa Nayla Adistri", noKartu: "0001651961057" },
  { nama: "Anggota Keluarga 1", noKartu: "0001651961058" },
];


export default function KartuPage() {
  useRequireAuth();
  const { userLevel, recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("kartu"); }, []);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const selected = pesertaList[selectedIndex];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center">
            Kartu Peserta BPJS
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Peserta selector */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-base">Peserta</h2>
          {userLevel === "pemula" && (
            <p className="text-gray-500 text-xs">
              Pilih data peserta yang akan dilihat riwayat pelayanannya
            </p>
          )}
          <div className="relative mt-1">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors"
            >
              <span>{selected.nama} ({selected.noKartu})</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {pesertaList.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedIndex(i); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${i === selectedIndex ? "text-[#184087] font-semibold" : "text-gray-700"}`}
                  >
                    {p.nama} ({p.noKartu})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KIS Card */}
        <div className="flex flex-1 items-center justify-center">
          <img
            src="/images/kartu.png"
            alt="Kartu Indonesia Sehat"
            className="w-full rounded-2xl shadow-md"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Perbesar Kartu button */}
        <button
          onClick={() => setCardModalOpen(true)}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
        >
          Perbesar Kartu
        </button>
      </div>

      {/* Modal overlay */}
      {cardModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          onClick={() => setCardModalOpen(false)}
        >
          <img
            src="/images/kartu.png"
            alt="Kartu Indonesia Sehat"
            className="rounded-2xl"
            style={{
              transform: "rotate(90deg)",
              width: "60vh",
              maxWidth: "60vh",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}




