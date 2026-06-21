import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

export default function SuratRujukanPage() {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/riwayat" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center">Surat Rujukan</h1>
        </div>
      </div>

      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-4">
        <div className="bg-white border-2 border-[#184087] rounded-2xl p-5 flex flex-col gap-3">
          <h2 className="text-[#184087] font-bold text-base text-center">Surat Rujukan</h2>
          <p className="text-gray-400 text-xs text-center">Gadjah Mada Medical Center Â· 16 April 2026</p>

          {[
            { label: "No. Surat Rujukan", value: "SR-2026-00456" },
            { label: "Nama Pasien", value: typeof window !== "undefined" ? (localStorage.getItem("jkn_user_nama") ?? "-") : "-" },
            { label: "No. BPJS", value: typeof window !== "undefined" ? (localStorage.getItem("jkn_nik") ?? "-") : "-" },
            { label: "Faskes Asal", value: "Gadjah Mada Medical Center" },
            { label: "Faskes Tujuan", value: "RS Awal Bros" },
            { label: "Poli Tujuan", value: "Poli Mata" },
            { label: "Tanggal Rujukan", value: "16 April 2026" },
            { label: "Berlaku Hingga", value: "16 Juli 2026" },
            { label: "Dokter Perujuk", value: "dr. Aldhi Nadir" },
            { label: "Diagnosa", value: "Pemeriksaan general tanpa komplain dan keluhan" },
            { label: "Alasan Rujukan", value: "Diperlukan pemeriksaan lebih lanjut oleh spesialis mata." },
          ].map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">{row.label}</span>
              <span className="text-gray-800 text-xs font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


