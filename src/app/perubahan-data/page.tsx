"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const staticItemsBase = [
  { label: "NIK", desc: "Nomor NIK yang terdaftar", value: "__NIK__", href: "/perubahan-data/nik" },
  { label: "Segmen Peserta", desc: "Jenis atau kategori kepesertaan peserta saat ini.", value: "Pekerja Penerima Upah", href: "/perubahan-data/segmen" },
  { label: "Alamat Surat", desc: "Alamat domisili yang digunakan untuk keperluan surat-menyurat", value: "Jl. Kalimantan No. 25C, DI Yogyakarta", href: "/perubahan-data/alamat" },
  { label: "Kelas", desc: "Kelas perawatan yang menjadi hak peserta.", value: "II (DUA)", href: "/perubahan-data/kelas" },
];

export default function PerubahanDataPage() {
  useRequireAuth();
  const { userLevel, recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("perubahan_data"); }, []);
  const [userNik, setUserNik] = useState("-");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [peserta, setPeserta] = useState("");
  const [pesertaList, setPesertaList] = useState<string[]>(["Farah Adillah (0128056381133)"]);
  const [nomorHp, setNomorHp] = useState("-");
  const [email, setEmail] = useState("-");
  const [faskes, setFaskes] = useState("Klinik Indi Medika");

  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama") ?? "Pengguna";
    const nik  = localStorage.getItem("jkn_nik") ?? "-";
    const hp   = localStorage.getItem("jkn_nomor_hp") ?? "-";
    const em   = localStorage.getItem("jkn_email") ?? "-";
    const fsk  = localStorage.getItem("jkn_faskes");
    setUserNik(nik);
    if (hp && hp !== "-") setNomorHp(hp);
    if (em) setEmail(em);
    if (fsk) setFaskes(fsk);
    const pesertaUtama = `${nama} (${nik})`;
    setPeserta(pesertaUtama);
    setPesertaList([pesertaUtama, "Farah Adillah (0128056381133)"]);
  }, []);

  const staticItems = staticItemsBase.map((item) =>
    item.value === "__NIK__" ? { ...item, value: userNik } : item
  );

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center">Perubahan Data Peserta</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Peserta dropdown */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Peserta</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih data peserta yang akan didaftarkan untuk layanan kesehatan.</p>}
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

        {/* Data items */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-5 flex flex-col gap-4">
          {/* Item statis */}
          {staticItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-1.5">
              <h2 className="text-[#184087] font-bold text-sm">{item.label}</h2>
              {userLevel === "pemula" && <p className="text-gray-500 text-xs">{item.desc}</p>}
              <Link href={item.href} className="flex items-center justify-between border-2 border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
                <span className="text-gray-700 text-sm">{item.value}</span>
                <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
              </Link>
            </div>
          ))}

          {/* Nomor HP â€” dinamis dari localStorage */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[#184087] font-bold text-sm">Nomor Handphone</h2>
            {userLevel === "pemula" && <p className="text-gray-500 text-xs">Nomor handphone aktif yang terdaftar</p>}
            <Link href="/perubahan-data/nomor-hp" className="flex items-center justify-between border-2 border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
              <span className="text-gray-700 text-sm">{nomorHp}</span>
              <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
            </Link>
          </div>

          {/* Email â€” dinamis dari localStorage */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[#184087] font-bold text-sm">Email</h2>
            {userLevel === "pemula" && <p className="text-gray-500 text-xs">Alamat email peserta yang terdaftar</p>}
            <Link href="/perubahan-data/email" className="flex items-center justify-between border-2 border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
              <span className="text-gray-700 text-sm">{email}</span>
              <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
            </Link>
          </div>

          {/* Faskes â€” dinamis dari localStorage */}
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[#184087] font-bold text-sm">Fasilitas Kesehatan Tingkat I</h2>
            {userLevel === "pemula" && <p className="text-gray-500 text-xs">Fasilitas kesehatan tingkat pertama yang dipilih untuk pelayanan</p>}
            <Link href="/perubahan-data/faskes" className="flex items-center justify-between border-2 border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 transition-colors">
              <span className="text-gray-700 text-sm">{faskes}</span>
              <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



