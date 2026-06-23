"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, User, Building2, Calendar, Stethoscope, QrCode } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

interface AntreanRujukanData {
  noRujukan: string;
  rs: string;
  tanggal: string;
  tenagaMedis: string;
  nomorAntrean: string;
  estimasi: string;
  kodeBook: string;
}

export default function TiketRujukanPage() {
  useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noRujukan = searchParams.get("noRujukan") ?? "0224465768859324";
  const [showWarning, setShowWarning] = useState(false);
  const [showAlreadyCheckin, setShowAlreadyCheckin] = useState(false);
  const [data, setData] = useState<AntreanRujukanData | null>(null);
  const nama = typeof window !== "undefined" ? localStorage.getItem("jkn_user_nama") ?? "Pengguna" : "Pengguna";

  useEffect(() => {
    const uid = localStorage.getItem("jkn_user_id");
    if (!uid) return;
    const raw = localStorage.getItem(`jkn_antrean_rujukan_${uid}_${noRujukan}`);
    if (raw) setData(JSON.parse(raw));
  }, [noRujukan]);

  const batalkan = () => {
    const uid = localStorage.getItem("jkn_user_id");
    if (uid) {
      localStorage.removeItem(`jkn_antrean_rujukan_${uid}_${noRujukan}`);
      localStorage.removeItem(`jkn_checkin_done_${uid}`);
    }
    router.replace("/");
  };

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
            <h1 className="text-white font-bold text-base leading-tight">{data?.rs ?? "RS Awal Bros"}</h1>
            <p className="text-white/80 text-xs mt-0.5">No. Rujukan: {noRujukan}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4">

        {/* Step indicator — 3 langkah */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">Pilih<br />Rujukan</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#009B4D] mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">Isi Data</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#009B4D] mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center text-white font-bold text-sm">3</div>
            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">Lihat Tiket<br />Antrean</span>
          </div>
        </div>

        {/* Info text */}
        <p className="text-gray-700 text-xs leading-relaxed text-justify px-1">
          Berikut informasi antrean Anda. Lakukan check in di rumah sakit pada hari Anda terdaftar antrean dengan menekan tombol QR dan mengarahkannya ke kode QR di bagian pendaftaran rumah sakit.
        </p>

        {/* TIKET */}
        <div className="bg-white rounded-2xl shadow-sm overflow-visible relative">

          {/* Informasi Antrean */}
          <div className="px-4 pt-4 pb-3">
            <h2 className="text-[#184087] font-bold text-base text-center">Informasi Antrean</h2>
            <p className="text-gray-400 text-xs text-center mt-0.5">Kode Book: {data?.kodeBook ?? "-"}</p>
          </div>

          <div className="px-4 pb-3 grid grid-cols-2 gap-y-2.5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs truncate">{nama}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pr-1">
              <Calendar className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">{data?.tanggal ?? "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">{data?.rs ?? "-"}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pr-1">
              <Stethoscope className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
              <span className="text-gray-700 text-xs">{data?.tenagaMedis?.split(" (")[0] ?? "-"}</span>
            </div>
          </div>

          {/* Blue QR section */}
          <div className="mx-3 rounded-xl overflow-hidden" style={{ background: "#46ADDC" }}>
            <div className="flex items-stretch">
              <div className="flex-1 p-3">
                <p className="text-white font-bold text-sm text-center">{nama}</p>
                <div className="mt-2 bg-white/20 rounded-lg px-2 py-1.5">
                  <p className="text-white/80 text-[10px] text-center">Nomor Antrean Poliklinik</p>
                  <p className="text-white font-bold text-3xl text-center leading-tight">{data?.nomorAntrean ?? "14"}</p>
                </div>
              </div>
              <div className="w-px bg-white/30 my-3" />
              <button
                onClick={() => {
                  const uid = localStorage.getItem("jkn_user_id");
                  if (uid && localStorage.getItem(`jkn_checkin_done_${uid}`)) {
                    setShowAlreadyCheckin(true);
                  } else {
                    router.push("/check-in");
                  }
                }}
                className="w-24 flex items-center justify-center p-3 active:opacity-70"
              >
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

          {/* Detail Informasi */}
          <div className="px-4 pb-5 flex flex-col gap-3">
            <h2 className="text-[#184087] font-bold text-base text-center">Detail Informasi</h2>

            <div className="flex flex-col gap-2">
              {[
                { label: "No. Rujukan", value: noRujukan },
                { label: "Tenaga Medis", value: data?.tenagaMedis ?? "-" },
                { label: "Tanggal Kunjungan", value: data?.tanggal ?? "-" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-gray-700 text-xs pl-1">{row.label}</span>
                  <span className="text-gray-700 text-xs font-medium pr-1 text-right max-w-[60%]">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#009B4D] rounded-full py-2 text-center">
              <span className="text-white font-semibold text-sm">Estimasi Dipanggil: {data?.estimasi ?? "09:30"}</span>
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

      {/* Popup sudah check in */}
      {showAlreadyCheckin && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <div className="w-14 h-14 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#009B4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Anda Sudah Check In
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Anda telah berhasil melakukan check in untuk kunjungan ini. Silakan tunggu hingga nomor antrean Anda dipanggil.
            </p>
            <button
              onClick={() => setShowAlreadyCheckin(false)}
              className="w-full bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full mt-1"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Batalkan Antrean?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Tiket antrean Anda akan dibatalkan. Anda perlu mendaftar ulang jika masih membutuhkan layanan.
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button onClick={batalkan} className="flex-1 bg-[#E05555] text-white font-bold text-sm py-3 rounded-full">
                Ya, Batalkan
              </button>
              <button onClick={() => setShowWarning(false)} className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full">
                Tetap di Sini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
