"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const pesertaDummy = "Farah Adillah (0128056381133)";
const poliList = ["Poli Umum", "Poli Gigi"];
const tanggalList = ["Hari ini (28-04-2026)", "Besok (29-04-2026)"];
const tenagaMedisFaskesList = [
  { nama: "Aldhi Nadir", jam: "08:45 - 15:00", diambil: 11, sisa: 2, panggil: 12 },
  { nama: "Aldhi Nadir", jam: "08:45 - 15:00", diambil: 11, sisa: 2, panggil: 12 },
];

export default function AntreanSebelumnyaPage() {
  useRequireAuth();
  const router = useRouter();
  const { recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("antrean"); }, []);

  const [pesertaList, setPesertaList] = useState<string[]>([pesertaDummy]);
  const [peserta, setPeserta] = useState("");
  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama") ?? "Pengguna";
    const nik  = localStorage.getItem("jkn_nik") ?? "-";
    const utama = `${nama} (${nik})`;
    setPesertaList([utama, pesertaDummy]);
    setPeserta(utama);
  }, []);
  const [poli, setPoli] = useState("Poli Umum");
  const [tanggal, setTanggal] = useState("Hari ini (28-04-2026)");
  const [showPesertaSheet, setShowPesertaSheet] = useState(false);
  const [showPoliSheet, setShowPoliSheet] = useState(false);
  const [showTanggalSheet, setShowTanggalSheet] = useState(false);
  const [showTenagaFaskesSheet, setShowTenagaFaskesSheet] = useState(false);
  const [tenagaFaskes, setTenagaFaskes] = useState<string | null>("Aldhi Nadir (08:45 - 15:00)");

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-[60]" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <button type="button" onClick={() => router.push("/")} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-base leading-tight">Puskesmas Mantrijeron</h1>
            <p className="text-white/80 text-xs mt-0.5">0224465768859324</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-[10px] text-gray-600 font-medium">Isi Data</span>
          </div>
          <div className="flex-1 h-0.5 bg-[#009B4D] mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-sm">2</div>
            <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">Lihat Tiket<br />Antrean</span>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-[#EBF4FB] rounded-xl px-4 py-3">
          <span className="text-[#184087] text-xs leading-relaxed">
            Data di bawah diisi otomatis berdasarkan antrean terakhir Anda. Anda dapat mengubah data sesuai kebutuhan.
          </span>
        </div>

        {/* Peserta */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Peserta</h2>
          <button onClick={() => setShowPesertaSheet(true)} className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
            <span className="text-sm text-gray-700">{peserta}</span>
            <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
          </button>
        </div>

        {/* Poli */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Poli/Layanan</h2>
          <button onClick={() => setShowPoliSheet(true)} className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
            <span className="text-sm text-gray-700">{poli}</span>
            <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
          </button>
        </div>

        {/* Tanggal */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Tanggal Kunjungan</h2>
          <button onClick={() => setShowTanggalSheet(true)} className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
            <span className="text-sm text-gray-700">{tanggal}</span>
            <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
          </button>
        </div>

        {/* Tenaga Medis */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Pilih Jadwal dan Tenaga Medis</h2>
          <button onClick={() => setShowTenagaFaskesSheet(true)} className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
            <span className="text-sm text-gray-700">{tenagaFaskes ?? "Pilih Jadwal dan Tenaga Medis"}</span>
            <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
          </button>
        </div>

        <div className="flex-1" />
        <button onClick={() => router.push("/antrean/tiket")} className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl">
          Simpan
        </button>
      </div>

      {/* Bottom sheet: Peserta */}
      {showPesertaSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPesertaSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <h2 className="text-[#184087] font-bold text-base text-center">Pilih Peserta</h2>
            {pesertaList.map(p => (
              <button key={p} onClick={() => { setPeserta(p); setShowPesertaSheet(false); }} className={`rounded-2xl px-4 py-3 text-left text-sm font-medium ${peserta === p ? "bg-[#EBF4FB] text-[#184087] border-2 border-[#184087]" : "bg-gray-50 text-gray-800"}`}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom sheet: Poli */}
      {showPoliSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowPoliSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <h2 className="text-[#184087] font-bold text-base text-center">Pilih Poli/Layanan</h2>
            {poliList.map(p => (
              <button key={p} onClick={() => { setPoli(p); setShowPoliSheet(false); }} className={`rounded-2xl px-4 py-3 text-left text-sm font-medium ${poli === p ? "bg-[#EBF4FB] text-[#184087] border-2 border-[#184087]" : "bg-gray-50 text-gray-800"}`}>{p}</button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom sheet: Tanggal */}
      {showTanggalSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTanggalSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-3">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <h2 className="text-[#184087] font-bold text-base text-center">Pilih Tanggal</h2>
            {tanggalList.map(t => (
              <button key={t} onClick={() => { setTanggal(t); setShowTanggalSheet(false); }} className={`rounded-2xl px-4 py-3 text-left text-sm font-medium ${tanggal === t ? "bg-[#EBF4FB] text-[#184087] border-2 border-[#184087]" : "bg-gray-50 text-gray-800"}`}>{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom sheet: Tenaga Medis */}
      {showTenagaFaskesSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTenagaFaskesSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4 max-h-[70%] overflow-y-auto no-scrollbar">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <h2 className="text-[#184087] font-bold text-base text-center">Daftar Tenaga Medis</h2>
            {tenagaMedisFaskesList.map((t, i) => (
              <button key={i} onClick={() => { setTenagaFaskes(`${t.nama} (${t.jam})`); setShowTenagaFaskesSheet(false); }} className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 text-left active:bg-gray-100">
                <p className="text-gray-900 font-bold text-sm">{t.nama}</p>
                <p className="text-gray-500 text-xs">{t.jam}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>Diambil: <b>{t.diambil}</b></span>
                  <span>Sisa: <b>{t.sisa}</b></span>
                  <span>Dipanggil: <b>{t.panggil}</b></span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



