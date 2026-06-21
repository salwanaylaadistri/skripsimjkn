"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, Stethoscope, FlaskConical, Pill, FileText, FileCheck } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const pesertaDummy = "Farah Adillah (0128056381133)";

const riwayatList = [
  {
    faskes: "Gadjah Mada Medical Center",
    tanggal: "16 April 2026",
    rating: 4,
    diagnosa: "Pemeriksaan general tanpa komplain dan keluhan",
    keluhan: "Pemeriksaan Mahasiswa KKN",
    terapiObat: "-",
    terapiNonObat: "-",
    rekamMedis: true,
    suratRujukan: true,
  },
  {
    faskes: "Gadjah Mada Medical Center",
    tanggal: "16 April 2026",
    rating: 5,
    diagnosa: "Pemeriksaan general tanpa komplain dan keluhan",
    keluhan: "Pemeriksaan Mahasiswa KKN",
    terapiObat: "Paracetamol 500mg",
    terapiNonObat: "Istirahat cukup",
    rekamMedis: true,
    suratRujukan: null,
  },
  {
    faskes: "Gadjah Mada Medical Center",
    tanggal: "16 April 2026",
    rating: 3,
    diagnosa: "Pemeriksaan general tanpa komplain dan keluhan",
    keluhan: "Pemeriksaan Mahasiswa KKN",
    terapiObat: "-",
    terapiNonObat: "-",
    rekamMedis: true,
    suratRujukan: true,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function RiwayatPage() {
  useRequireAuth();
  const { userLevel, recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("riwayat"); }, []);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState<string[]>([pesertaDummy]);
  const [peserta, setPeserta] = useState("");
  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama") ?? "Pengguna";
    const nik  = localStorage.getItem("jkn_nik") ?? "-";
    const utama = `${nama} (${nik})`;
    setPesertaList([utama, pesertaDummy]);
    setPeserta(utama);
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center">Info Riwayat Pelayanan</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4">

        {/* Peserta */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Peserta</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih data peserta yang akan dilihat riwayat pelayanannya</p>}
          <div className="relative mt-1">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors"
            >
              <span>{peserta}</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {pesertaList.map((p) => (
                  <button key={p} onClick={() => { setPeserta(p); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${p === peserta ? "text-[#184087] font-semibold" : "text-gray-700"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info teks */}
        {userLevel === "pemula" && (
          <p className="text-gray-600 text-xs leading-relaxed text-justify">
            Berikut adalah daftar riwayat pelayanan yang telah Anda lakukan. Anda dapat melihat diagnosa yang diberikan, keluhan yang dialami, terapi obat dan non obat yang butuh dilakukan, rekam medis elektronik, dan surat rujukan jika dirujuk saat pemeriksaan
          </p>
        )}

        {/* Daftar Riwayat */}
        <div className="flex flex-col gap-4">
          {riwayatList.map((item, i) => (
            <div key={i} className="bg-white border-2 border-[#184087] rounded-2xl overflow-hidden">
              {/* Card header */}
              <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-gray-900 font-bold text-sm">{item.faskes}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.tanggal}</p>
                </div>
                <StarRating rating={item.rating} />
              </div>

              <div className="px-4 pb-4 flex flex-col gap-3">
                {/* Diagnosa */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-800 font-semibold text-xs">Diagnosa Pelayanan</span>
                  </div>
                  <p className="text-gray-500 text-xs pl-5">{item.diagnosa}</p>
                </div>

                {/* Keluhan */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-800 font-semibold text-xs">Keluhan</span>
                  </div>
                  <p className="text-gray-500 text-xs pl-5">{item.keluhan}</p>
                </div>

                {/* Terapi Obat */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-800 font-semibold text-xs">Terapi Obat</span>
                  </div>
                  <p className="text-gray-500 text-xs pl-5">{item.terapiObat}</p>
                </div>

                {/* Terapi Non Obat */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-gray-800 font-semibold text-xs pl-5">Terapi Non Obat</span>
                  <p className="text-gray-500 text-xs pl-5">{item.terapiNonObat}</p>
                </div>

                {/* Rekam Medis */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-800 font-semibold text-xs">Rekam Medis Elektronik</span>
                  </div>
                  <Link href="/riwayat/rekam-medis" className="text-[#46ADDC] text-xs underline pl-5">
                    Lihat Rekam Medis
                  </Link>
                </div>

                {/* Surat Rujukan */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-800 font-semibold text-xs">Surat Rujukan</span>
                  </div>
                  {item.suratRujukan ? (
                    <Link href="/riwayat/surat-rujukan" className="text-[#46ADDC] text-xs underline pl-5">
                      Lihat Surat Rujukan
                    </Link>
                  ) : (
                    <p className="text-gray-500 text-xs pl-5">-</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



