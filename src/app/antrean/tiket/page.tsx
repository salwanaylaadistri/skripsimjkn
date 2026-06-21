"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Building2, Calendar, Stethoscope, QrCode } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

export default function TiketAntreanPage() {
  useRequireAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  return (
    <div className={`flex flex-col min-h-full bg-gray-100 relative ${showWarning ? "overflow-hidden" : ""}`}>
      {/* Header */}
      <div className="sticky top-0 z-[60]" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <button onClick={() => setShowWarning(true)} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-base leading-tight">RS Awal Bros</h1>
            <p className="text-white/80 text-xs mt-0.5">0224465768859324</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4">

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-600 font-medium">Isi Data</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#009B4D] mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center text-white font-bold text-sm">2</div>
            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">Lihat Tiket<br />Antrean</span>
          </div>
        </div>

        {/* Info text */}
        <p className="text-gray-700 text-xs leading-relaxed text-justify px-1">
          Berikut informasi antrean Anda. Lakukan check in di rumah sakit pada hari Anda terdaftar antrean dengan menekan tombol QR dan mengarahkannya ke kode QR di bagian pendaftaran rumah sakit.
        </p>

        {/* TIKET â€” satu kesatuan */}
        <div className="bg-white rounded-2xl shadow-sm overflow-visible relative">

          {/* Bagian atas: Informasi Antrean */}
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-[#184087] font-bold text-base text-center">Informasi Antrean</h2>
            <p className="text-gray-400 text-xs text-center mt-0.5">Kode Book: 2348405734898</p>
          </div>

          <div className="px-4 pb-3 grid grid-cols-2 gap-y-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">{localStorage.getItem("jkn_user_nama") ?? "Pengguna"}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pr-1">
              <Calendar className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">18/05/2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">RS Awal Bros</span>
            </div>
            <div className="flex items-center justify-end gap-2 pr-1">
              <Stethoscope className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">Poli Umum</span>
            </div>
          </div>

          {/* Blue QR section */}
          <div className="mx-3 rounded-xl overflow-hidden" style={{ background: "#46ADDC" }}>
            <div className="flex items-stretch">
              <div className="flex-1 p-3">
                <p className="text-white font-bold text-sm text-center">Aldhi Nadir</p>
                <div className="mt-2 bg-white/20 rounded-lg px-2 py-1.5">
                  <p className="text-white/80 text-[10px] text-center">Nomor Antrean Poliklinik</p>
                  <p className="text-white font-bold text-3xl text-center leading-tight">14</p>
                </div>
              </div>
              <div className="w-px bg-white/30 my-3" />
              <div className="w-24 flex items-center justify-center p-3">
                <QrCode className="w-16 h-16 text-white" strokeWidth={1} />
              </div>
            </div>
          </div>

          {/* Tear separator */}
          <div className="relative flex items-center my-4">
            {/* Notch kiri */}
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-gray-100 z-10" />
            {/* Garis putus-putus */}
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-5" />
            {/* Notch kanan */}
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-gray-100 z-10" />
          </div>

          {/* Bagian bawah: Detail Informasi */}
          <div className="px-4 pb-5 flex flex-col gap-3">
            <h2 className="text-[#184087] font-bold text-base text-center">Detail Informasi</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 pl-1">
                <User className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                <span className="text-gray-700 text-xs">Keluhan</span>
              </div>
              <span className="text-gray-700 text-xs font-medium pr-1">Meriang</span>
            </div>

            <div className="bg-[#009B4D] rounded-full py-2 text-center">
              <span className="text-white font-semibold text-sm">Estimasi Dipanggil: 09:30</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { label: "Sisa Antrean", sub: "Jumlah antrean yang belum ditangani dokter", val: 2, color: "bg-[#E05555]" },
                { label: "Antrean Panggil", sub: "Nomor antrean yang sedang ditangani dokter", val: 12, color: "bg-[#46ADDC]" },
              ].map((col) => (
                <div key={col.label} className="flex flex-col items-center gap-1.5">
                  <span className="text-gray-700 text-xs font-semibold text-center leading-tight">{col.label}</span>
                  <span className="text-gray-400 text-[10px] text-center leading-tight">{col.sub}</span>
                  <div className={`${col.color} text-white font-bold text-base w-10 h-10 rounded-lg flex items-center justify-center`}>
                    {col.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kembali ke Beranda */}
        <button
          onClick={() => router.push("/")}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl text-center mt-2"
        >
          Kembali ke Beranda
        </button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Batalkan Antrean?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Data antrean Anda saat ini akan dihapus. Anda perlu mendaftar ulang untuk mendapatkan pelayanan. Jika ingin kembali ke beranda, tekan <span className="font-semibold text-gray-700">Tetap di Sini</span> lalu tekan <span className="font-semibold text-gray-700">Kembali ke Beranda</span>.
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button
                onClick={() => router.push("/antrean")}
                className="flex-1 bg-[#E05555] text-white font-bold text-sm py-3 rounded-full"
              >
                Ya, Batalkan
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full"
              >
                Tetap di Sini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



