"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Building2, Calendar, QrCode } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

export default function TiketKantorCabangPage() {
  useRequireAuth();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  return (
    <div className={`flex flex-col min-h-full bg-gray-100 relative ${showWarning ? "overflow-hidden" : ""}`}>
      {/* Header */}
      <div className="sticky top-0 z-[60]" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <button
            onClick={() => setShowWarning(true)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10"
          >
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-base leading-tight">BPJS Kesehatan KC Bandung</h1>
            <p className="text-white/80 text-xs mt-0.5">Antrean Kantor Cabang</p>
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
          Berikut tiket antrean kantor cabang Anda. Tunjukkan tiket ini saat tiba di kantor cabang BPJS Kesehatan.
        </p>

        {/* TIKET */}
        <div className="bg-white rounded-2xl shadow-sm overflow-visible relative">

          {/* Bagian atas */}
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-[#184087] font-bold text-base text-center">Informasi Antrean</h2>
            <p className="text-gray-400 text-xs text-center mt-0.5">Kode Book: 7834902183471</p>
          </div>

          <div className="px-4 pb-3 grid grid-cols-2 gap-y-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">{typeof window !== "undefined" ? localStorage.getItem("jkn_user_nama") ?? "Pengguna" : "Pengguna"}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pr-1">
              <Calendar className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">23/06/2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">KC Bandung</span>
            </div>
          </div>

          {/* Blue QR section */}
          <div className="mx-3 rounded-xl overflow-hidden" style={{ background: "#46ADDC" }}>
            <div className="flex items-stretch">
              <div className="flex-1 p-3">
                <p className="text-white font-bold text-sm text-center">
                  {typeof window !== "undefined" ? localStorage.getItem("jkn_user_nama") ?? "Pengguna" : "Pengguna"}
                </p>
                <div className="mt-2 bg-white/20 rounded-lg px-2 py-1.5">
                  <p className="text-white/80 text-[10px] text-center">Nomor Antrean</p>
                  <p className="text-white font-bold text-3xl text-center leading-tight">A07</p>
                </div>
              </div>
              <div className="w-px bg-white/30 my-3" />
              <button onClick={() => router.push("/check-in")} className="w-24 flex items-center justify-center p-3 active:opacity-70">
                <QrCode className="w-16 h-16 text-white" strokeWidth={1} />
              </button>
            </div>
          </div>

          {/* Tear separator */}
          <div className="relative flex items-center my-4">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-gray-100 z-10" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-5" />
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-gray-100 z-10" />
          </div>

          {/* Detail */}
          <div className="px-4 pb-5 flex flex-col gap-3">
            <h2 className="text-[#184087] font-bold text-base text-center">Detail Informasi</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: "Keperluan", value: "Perubahan Data Peserta" },
                { label: "Kantor Cabang", value: "BPJS Kesehatan KC Bandung" },
                { label: "Estimasi Dipanggil", value: "10:15" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-gray-700 text-xs font-semibold pl-1">{row.label}</span>
                  <span className="text-gray-700 text-xs pr-1">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-1">
              {[
                { label: "Sisa Antrean", sub: "Jumlah antrean yang belum dipanggil", val: 5, color: "bg-[#E05555]" },
                { label: "Antrean Panggil", sub: "Nomor antrean yang sedang dilayani", val: "A02", color: "bg-[#46ADDC]" },
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

        {/* Tombol aksi */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => setShowWarning(true)}
            className="flex-1 bg-[#E05555] text-white font-bold text-sm py-4 rounded-2xl text-center"
          >
            Batalkan
          </button>
          <button
            onClick={() => router.replace("/")}
            className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-4 rounded-2xl text-center"
          >
            Ke Beranda
          </button>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Batalkan Antrean?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Tiket antrean kantor cabang Anda akan dibatalkan. Anda perlu mendaftar ulang jika masih membutuhkan layanan.
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button
                onClick={() => {
                  const uid = localStorage.getItem("jkn_user_id");
                  if (uid) localStorage.removeItem(`jkn_checkin_done_${uid}`);
                  router.replace("/");
                }}
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
