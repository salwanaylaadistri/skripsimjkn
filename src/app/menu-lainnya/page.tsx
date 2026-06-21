"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const menuItems = [
  {
    image: "/images/logoinfoprogram.svg",
    title: "Info Program JKN",
    desc: "Lihat informasi terbaru seputar program, layanan, dan manfaat JKN.",
    baru: false,
  },
  {
    image: "/images/logotelehealth.svg",
    title: "Telehealth",
    desc: "Konsultasi kesehatan online dengan tenaga medis secara mudah dan praktis.",
    baru: false,
  },
  {
    image: "/images/logoriwayat.svg",
    title: "Info Riwayat Pelayanan",
    desc: "Lihat riwayat pelayanan kesehatan dan penggunaan layanan JKN Anda.",
    baru: false,
  },
  {
    image: "/images/logobugarmenu.svg",
    title: "Bugar",
    desc: "Akses fitur kesehatan dan pemantauan aktivitas untuk mendukung hidup lebih sehat.",
    baru: true,
  },
  {
    image: "/images/logorehat.svg",
    title: "NEW Rehab (Cicilan)",
    desc: "Informasi dan pengajuan program rehabilitasi pembayaran iuran secara bertahap.",
    baru: true,
  },
  {
    image: "/images/logotambahpeserta.svg",
    title: "Penambahan Peserta",
    desc: "Tambahkan anggota keluarga sebagai peserta JKN langsung melalui aplikasi.",
    baru: false,
  },
  {
    image: "/images/logoinfopeserta.svg",
    title: "Info Peserta",
    desc: "Lihat data kepesertaan, status aktif, dan informasi peserta JKN Anda.",
    baru: false,
  },
  {
    image: "/images/logosos.svg",
    title: "SOS",
    desc: "Akses layanan bantuan darurat saat kondisi mendesak.",
    baru: false,
  },
  {
    image: "/images/logolokasifaskes.svg",
    title: "Info Lokasi Faskes",
    desc: "Cari lokasi fasilitas kesehatan terdekat beserta informasi layanan yang tersedia.",
    baru: false,
  },
  {
    image: "/images/logoubahdata.svg",
    title: "Perubahan Data Peserta",
    desc: "Ubah dan perbarui data kepesertaan JKN Anda secara online.",
    baru: false,
  },
  {
    image: "/images/logoaduan.svg",
    title: "Pengaduan Layanan JKN",
    desc: "Sampaikan keluhan, kendala, dan masukan terkait layanan JKN.",
    baru: false,
  },
  {
    image: "/images/logoskrinning.svg",
    title: "Skrinning Riwayat Kesehatan",
    desc: "Lakukan skrinning kesehatan untuk melihat risiko dan riwayat kondisi kesehatan Anda.",
    baru: false,
  },
  {
    image: "/images/logoantre.svg",
    title: "Pendaftaran Pelayanan (Antrean)",
    desc: "Daftar antrean pelayanan kesehatan secara online lebih mudah dan cepat.",
    baru: false,
  },
  {
    image: "/images/logoinfotempattidur.svg",
    title: "Info Ketersediaan Tempat Tidur",
    desc: "Lihat informasi ketersediaan tempat tidur rumah sakit secara real-time.",
    baru: false,
  },
  {
    image: "/images/logooperasi.svg",
    title: "Info Jadwal Tindakan Operasi",
    desc: "Periksa jadwal tindakan operasi dan informasi pelayanan yang tersedia.",
    baru: false,
  },
  {
    image: "/images/logoiuran.svg",
    title: "Info Iuran",
    desc: "Lihat informasi tagihan, riwayat pembayaran, dan status iuran JKN Anda.",
    baru: false,
  },
  {
    image: "/images/logoautodebit.svg",
    title: "Pendaftaran Auto Debit",
    desc: "Aktifkan pembayaran iuran otomatis agar tagihan JKN dibayar tepat waktu.",
    baru: false,
  },
  {
    image: "/images/logobayariuran.svg",
    title: "Info Iuran Pembayaran",
    desc: "Lihat rincian tagihan dan informasi pembayaran iuran JKN Anda.",
    baru: false,
  },
  {
    image: "/images/logoinfova.svg",
    title: "Info Virtual Account",
    desc: "Akses nomor virtual account untuk memudahkan pembayaran iuran JKN.",
    baru: false,
  },
  {
    image: "/images/logoobat.svg",
    title: "Minum Obat",
    desc: "Atur pengingat jadwal minum obat agar konsumsi obat lebih teratur.",
    baru: true,
  },
  {
    image: "/images/logotrensakit.svg",
    title: "Tren Penyakit Daerah",
    desc: "Lihat informasi tren penyakit yang sedang meningkat di wilayah tertentu.",
    baru: true,
  },
  {
    image: "/images/logobpjskeliling.svg",
    title: "BPJS Keliling",
    desc: "Cari jadwal dan lokasi layanan BPJS Keliling terdekat.",
    baru: true,
  },
  {
    image: "/images/logoecommerce.svg",
    title: "E-Commerce",
    desc: "Akses layanan dan produk kesehatan yang terhubung dengan platform digital.",
    baru: true,
  },
];

export default function MenuLainnyaPage() {
  useRequireAuth();
  const { userLevel, recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("menu_lainnya"); }, []);
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center">Menu Lainnya</h1>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 bg-white px-5 pt-6 pb-6">
        <div className="grid grid-cols-4 gap-y-4 gap-x-3">
          {menuItems.map((item, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-2 flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 flex items-center justify-center mt-1">
                <img src={item.image} alt={item.title} className="w-12 h-12 object-contain" />
              </div>
              <p className="text-[#184087] font-bold text-[9px] text-center leading-tight min-h-[24px]">
                {item.title}
              </p>
              {userLevel === "pemula" && (
                <p className="text-gray-500 text-[8px] text-center leading-tight">
                  {item.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



