"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const keperluan = [
  "Perubahan Data Peserta",
  "Pengaduan",
  "Informasi Kepesertaan",
  "Lainnya",
];

const kantorList = [
  "BPJS Kesehatan KC Bandung",
  "BPJS Kesehatan KC Jakarta Pusat",
  "BPJS Kesehatan KC Bekasi",
];

export default function AntreanKantorCabangPage() {
  useRequireAuth();
  const router = useRouter();
  const [peserta, setPeserta] = useState("");
  const [openDrop, setOpenDrop] = useState<"keperluan" | "kantor" | null>(null);
  const [selectedKeperluan, setSelectedKeperluan] = useState(keperluan[0]);
  const [selectedKantor, setSelectedKantor] = useState(kantorList[0]);
  const [keterangan, setKeterangan] = useState("");

  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama") ?? "Pengguna";
    const nik = localStorage.getItem("jkn_nik") ?? "-";
    setPeserta(`${nama} (${nik})`);
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10"
          >
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <h1 className="text-white font-bold text-lg text-center leading-tight px-10">
            Antrean Kantor Cabang
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center text-white font-bold text-sm">1</div>
            <span className="text-[10px] text-gray-600 font-medium">Isi Data</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-sm">2</div>
            <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">Lihat Tiket<br />Antrean</span>
          </div>
        </div>

        {/* Peserta */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Peserta</h2>
          <div className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-gray-50">
            {peserta}
          </div>
        </div>

        {/* Keperluan */}
        <div className="flex flex-col gap-1.5 relative">
          <h2 className="text-[#184087] font-bold text-sm">Keperluan</h2>
          <p className="text-gray-500 text-xs">Pilih keperluan kunjungan ke kantor cabang.</p>
          <div className="relative mt-1">
            <button
              onClick={() => setOpenDrop(openDrop === "keperluan" ? null : "keperluan")}
              className="w-full flex items-center justify-between border-2 border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white"
            >
              <span>{selectedKeperluan}</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "keperluan" ? "rotate-180" : ""}`} />
            </button>
            {openDrop === "keperluan" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {keperluan.map((k) => (
                  <button
                    key={k}
                    onClick={() => { setSelectedKeperluan(k); setOpenDrop(null); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${k === selectedKeperluan ? "text-[#184087] font-semibold" : "text-gray-700"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kantor Cabang */}
        <div className="flex flex-col gap-1.5 relative">
          <h2 className="text-[#184087] font-bold text-sm">Kantor Cabang</h2>
          <p className="text-gray-500 text-xs">Pilih kantor cabang BPJS Kesehatan yang akan dikunjungi.</p>
          <div className="relative mt-1">
            <button
              onClick={() => setOpenDrop(openDrop === "kantor" ? null : "kantor")}
              className="w-full flex items-center justify-between border-2 border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white"
            >
              <span>{selectedKantor}</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "kantor" ? "rotate-180" : ""}`} />
            </button>
            {openDrop === "kantor" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {kantorList.map((k) => (
                  <button
                    key={k}
                    onClick={() => { setSelectedKantor(k); setOpenDrop(null); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${k === selectedKantor ? "text-[#184087] font-semibold" : "text-gray-700"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Keterangan */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Keterangan <span className="text-gray-400 font-normal">(opsional)</span></h2>
          <p className="text-gray-500 text-xs">Tambahkan keterangan jika diperlukan.</p>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            rows={3}
            placeholder="Contoh: membawa dokumen perubahan nama..."
            className="mt-1 w-full border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-white resize-none transition-colors"
          />
        </div>

        {/* Simpan */}
        <button
          onClick={() => router.push("/antrean/kantor-cabang/tiket")}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl mt-2"
        >
          Ambil Antrean
        </button>
      </div>
    </div>
  );
}
