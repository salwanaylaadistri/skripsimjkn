﻿"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Calendar,
  Clock,
  QrCode,
  Headphones,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import JanjiLayananCarousel from "@/components/home/JanjiLayananCarousel";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const searchData = [
  { label: "Antrean Online", desc: "Ambil nomor antrean layanan kesehatan", href: "/antrean", icon: "/images/logoantre.svg" },
  { label: "Antrean Rujukan", desc: "Daftar antrean faskes rujukan tingkat lanjut", href: "/antrean/rujukan", icon: "/images/logoantre.svg" },
  { label: "Riwayat Pelayanan", desc: "Lihat riwayat layanan kesehatan Anda", href: "/riwayat", icon: "/images/logoriwayat.svg" },
  { label: "Perubahan Data Peserta", desc: "Ubah data peserta JKN Anda", href: "/perubahan-data", icon: "/images/logoubahdata.svg" },
  { label: "Ubah Nomor HP", desc: "Perbarui nomor handphone terdaftar", href: "/perubahan-data/nomor-hp", icon: "/images/logoubahdata.svg" },
  { label: "Ubah Email", desc: "Perbarui alamat email terdaftar", href: "/perubahan-data/email", icon: "/images/logoubahdata.svg" },
  { label: "Ubah Faskes", desc: "Perbarui fasilitas kesehatan tingkat pertama", href: "/perubahan-data/faskes", icon: "/images/logoubahdata.svg" },
  { label: "Check In Kunjungan", desc: "Lakukan check in di hari pelayanan", href: "/check-in", icon: "/images/logoantre.svg" },
  { label: "Info Program JKN", desc: "Lihat informasi terbaru seputar program, layanan, dan manfaat JKN.", href: "/menu-lainnya", icon: "/images/logoinfoprogram.svg" },
  { label: "Telehealth", desc: "Konsultasi kesehatan online dengan tenaga medis secara mudah dan praktis.", href: "/menu-lainnya", icon: "/images/logotelehealth.svg" },
  { label: "Info Riwayat Pelayanan", desc: "Lihat riwayat pelayanan kesehatan dan penggunaan layanan JKN Anda.", href: "/riwayat", icon: "/images/logoriwayat.svg" },
  { label: "Bugar", desc: "Akses fitur kesehatan dan pemantauan aktivitas untuk mendukung hidup lebih sehat.", href: "/menu-lainnya", icon: "/images/logobugarmenu.svg" },
  { label: "NEW Rehab (Cicilan)", desc: "Informasi dan pengajuan program rehabilitasi pembayaran iuran secara bertahap.", href: "/menu-lainnya", icon: "/images/logorehat.svg" },
  { label: "Penambahan Peserta", desc: "Tambahkan anggota keluarga sebagai peserta JKN langsung melalui aplikasi.", href: "/menu-lainnya", icon: "/images/logotambahpeserta.svg" },
  { label: "Info Peserta", desc: "Lihat data kepesertaan, status aktif, dan informasi peserta JKN Anda.", href: "/menu-lainnya", icon: "/images/logoinfopeserta.svg" },
  { label: "SOS", desc: "Akses layanan bantuan darurat saat kondisi mendesak.", href: "/menu-lainnya", icon: "/images/logosos.svg" },
  { label: "Info Lokasi Faskes", desc: "Cari lokasi fasilitas kesehatan terdekat beserta informasi layanan yang tersedia.", href: "/menu-lainnya", icon: "/images/logolokasifaskes.svg" },
  { label: "Pengaduan Layanan JKN", desc: "Sampaikan keluhan, kendala, dan masukan terkait layanan JKN.", href: "/menu-lainnya", icon: "/images/logoaduan.svg" },
  { label: "Skrinning Riwayat Kesehatan", desc: "Lakukan skrinning kesehatan untuk melihat risiko dan riwayat kondisi kesehatan Anda.", href: "/menu-lainnya", icon: "/images/logoskrinning.svg" },
  { label: "Info Ketersediaan Tempat Tidur", desc: "Lihat informasi ketersediaan tempat tidur rumah sakit secara real-time.", href: "/menu-lainnya", icon: "/images/logoinfotempattidur.svg" },
  { label: "Info Jadwal Tindakan Operasi", desc: "Periksa jadwal tindakan operasi dan informasi pelayanan yang tersedia.", href: "/menu-lainnya", icon: "/images/logooperasi.svg" },
  { label: "Info Iuran", desc: "Lihat informasi tagihan, riwayat pembayaran, dan status iuran JKN Anda.", href: "/menu-lainnya", icon: "/images/logoiuran.svg" },
  { label: "Pendaftaran Auto Debit", desc: "Aktifkan pembayaran iuran otomatis agar tagihan JKN dibayar tepat waktu.", href: "/menu-lainnya", icon: "/images/logoautodebit.svg" },
  { label: "Info Iuran Pembayaran", desc: "Lihat rincian tagihan dan informasi pembayaran iuran JKN Anda.", href: "/menu-lainnya", icon: "/images/logobayariuran.svg" },
  { label: "Info Virtual Account", desc: "Akses nomor virtual account untuk memudahkan pembayaran iuran JKN.", href: "/menu-lainnya", icon: "/images/logoinfova.svg" },
  { label: "Minum Obat", desc: "Atur pengingat jadwal minum obat agar konsumsi obat lebih teratur.", href: "/menu-lainnya", icon: "/images/logoobat.svg" },
  { label: "Tren Penyakit Daerah", desc: "Lihat informasi tren penyakit yang sedang meningkat di wilayah tertentu.", href: "/menu-lainnya", icon: "/images/logotrensakit.svg" },
  { label: "BPJS Keliling", desc: "Cari jadwal dan lokasi layanan BPJS Keliling terdekat.", href: "/menu-lainnya", icon: "/images/logobpjskeliling.svg" },
  { label: "E-Commerce", desc: "Akses layanan dan produk kesehatan yang terhubung dengan platform digital.", href: "/menu-lainnya", icon: "/images/logoecommerce.svg" },
];

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const features = [
  {
    id: "antrean",
    title: "Pendaftaran Pelayanan (Antrean)",
    description: "Ambil nomor antrean layanan kesehatan secara online agar lebih cepat dan praktis.",
    imageSrc: "/images/logoantre.svg",
    href: "/antrean",
    useSheet: true,
  },
  {
    id: "riwayat",
    title: "Info Riwayat Pelayanan",
    description: "Lihat riwayat layanan kesehatan Anda dengan cepat.",
    imageSrc: "/images/logoriwayat.svg",
    href: "/riwayat",
    useSheet: false,
  },
  {
    id: "perubahan-data",
    title: "Perubahan Data Peserta",
    description: "Ubah data peserta dengan mudah langsung dari aplikasi.",
    imageSrc: "/images/logoubahdata.svg",
    href: "/perubahan-data",
    useSheet: false,
  },
  {
    id: "menu-lainnya",
    title: "Menu Lainnya",
    description: "Telusuri berbagai fitur MobileJKN lainnya.",
    imageSrc: "/images/logomenulainnya.svg",
    href: "/menu-lainnya",
    useSheet: false,
  },
];

const jenisList = [
  { label: "Faskes Tingkat Pertama", icon: "/images/logolokasifaskes.svg", href: "/antrean" },
  { label: "Faskes Rujukan Tingkat Lanjut", icon: "/images/logoinfotempattidur.svg", href: "/antrean/rujukan" },
  { label: "Kantor Cabang", icon: "/images/logoinfopeserta.svg", href: "/antrean/kantor-cabang" },
];

const TERMS_PAGES = [
  {
    title: "Syarat dan Ketentuan\nPenggunaan MobileJKN",
    points: [
      "Aplikasi MobileJKN hanya dapat digunakan oleh peserta JKN-KIS yang telah terdaftar dan memiliki akun aktif.",
      "Pengguna wajib menjaga kerahasiaan kata sandi dan PIN akun. Segala aktivitas yang dilakukan melalui akun merupakan tanggung jawab pengguna.",
      "Data pribadi yang diberikan harus sesuai dengan identitas resmi yang terdaftar di Dukcapil dan BPJS Kesehatan.",
      "Pengguna dilarang menggunakan aplikasi ini untuk tujuan yang melanggar hukum, menyebarkan informasi palsu, atau merugikan pihak lain.",
      "BPJS Kesehatan berhak membekukan atau menonaktifkan akun yang terbukti melakukan pelanggaran ketentuan penggunaan.",
    ],
  },
  {
    title: "Persetujuan Peserta\n(Informed Consent)",
    points: [
      "Pengguna menyatakan bahwa data yang diberikan adalah benar dan dapat dipertanggungjawabkan.",
      "Pengguna memahami bahwa perubahan data akan memengaruhi informasi kepesertaan yang tersimpan dalam sistem.",
      "Pengguna menyetujui penggunaan data sesuai dengan ketentuan layanan yang berlaku.",
      "Pengguna bertanggung jawab atas segala konsekuensi dari perubahan data yang dilakukan.",
    ],
    closing: "Dengan ini, saya menyatakan setuju untuk melanjutkan proses perubahan data.",
  },
];

export default function BerandaPage() {
  const [userName, setUserName] = useState("Pengguna");
  const [showAntreanSheet, setShowAntreanSheet] = useState(false);
  const [showSebelumnyaInfo, setShowSebelumnyaInfo] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof searchData>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { userLevel, setUserLevel, recordShortcut, featureOrder, isPredicting } = useUserLevel();

  // Mapping feature_order dari RFR ke id dominan
  const rfr2dominant = (f: string): "antrean" | "riwayat" | "ubah-data" => {
    if (f === "riwayat") return "riwayat";
    if (f === "perubahan_data") return "ubah-data";
    return "antrean";
  };

  const [dominanFeature, setDominanFeature] = useState<"antrean" | "riwayat" | "ubah-data">("antrean");

  const [antreanAktif, setAntreanAktif] = useState<{ faskes: string; tanggal: string; estimasi: string; nomorAntrean: string; jenisAntrean: "faskes" | "rujukan" } | null>(null);
  const [sudahCheckin, setSudahCheckin] = useState(false);

  const refreshAntreanState = () => {
    const uid = localStorage.getItem("jkn_user_id");
    if (!uid) { setAntreanAktif(null); setSudahCheckin(false); return; }

    setSudahCheckin(!!localStorage.getItem(`jkn_checkin_done_${uid}`));

    const raw = localStorage.getItem(`jkn_antrean_faskes_${uid}`);
    if (raw) {
      const d = JSON.parse(raw);
      setAntreanAktif({ faskes: d.faskes, tanggal: d.tanggal, estimasi: d.estimasi, nomorAntrean: d.nomorAntrean, jenisAntrean: "faskes" });
      return;
    }
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`jkn_antrean_rujukan_${uid}_`)) {
        const rd = JSON.parse(localStorage.getItem(key)!);
        setAntreanAktif({ faskes: rd.rs, tanggal: rd.tanggal, estimasi: rd.estimasi, nomorAntrean: rd.nomorAntrean, jenisAntrean: "rujukan" });
        return;
      }
    }
    setAntreanAktif(null);
  };

  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama");
    if (nama) {
      const singkat = nama.split(" ").slice(0, 2).join(" ");
      setUserName(singkat);
    }
    refreshAntreanState();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshAntreanState();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", refreshAntreanState);
    window.addEventListener("jkn_checkin", refreshAntreanState);
    window.addEventListener("jkn_login", refreshAntreanState);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", refreshAntreanState);
      window.removeEventListener("jkn_checkin", refreshAntreanState);
      window.removeEventListener("jkn_login", refreshAntreanState);
    };
  }, []);

  // Saat featureOrder dari RFR berubah, update dominanFeature otomatis
  useEffect(() => {
    if (featureOrder && featureOrder.length > 0) {
      setDominanFeature(rfr2dominant(featureOrder[0]));
    }
  }, [featureOrder]);
  const [showTerms, setShowTerms] = useState(false);
  const [termsPage, setTermsPage] = useState(0);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Buat PIN
  const [showSetPin, setShowSetPin] = useState(false);
  const [pinStep, setPinStep] = useState<1 | 2>(1);
  const [pin1, setPin1] = useState(["", "", "", "", "", ""]);
  const [pin2, setPin2] = useState(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const pin1Refs = useRef<(HTMLInputElement | null)[]>([]);
  const pin2Refs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (
    index: number, value: string,
    pin: string[], setPin: (p: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    setPinError("");
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handlePinKeyDown = (
    index: number, e: React.KeyboardEvent,
    pin: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handlePinLanjut = async () => {
    if (pinStep === 1) {
      if (pin1.some(d => d === "")) { setPinError("Masukkan 6 digit PIN."); return; }
      setPinStep(2);
      setPin2(["", "", "", "", "", ""]);
      setTimeout(() => pin2Refs.current[0]?.focus(), 100);
    } else {
      if (pin2.some(d => d === "")) { setPinError("Masukkan 6 digit PIN konfirmasi."); return; }
      if (pin1.join("") !== pin2.join("")) { setPinError("PIN tidak cocok, coba lagi."); setPin2(["", "", "", "", "", ""]); setTimeout(() => pin2Refs.current[0]?.focus(), 100); return; }
      setPinLoading(true);
      try {
        const userId = localStorage.getItem("jkn_user_id");
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/set-pin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: parseInt(userId!), pin: pin1.join("") }),
        });
        if (!res.ok) { setPinError("Gagal menyimpan PIN, coba lagi."); return; }
        localStorage.setItem("jkn_has_pin", "1");
        setShowSetPin(false);
      } catch { setPinError("Tidak dapat terhubung ke server."); }
      finally { setPinLoading(false); }
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("jkn_user_id")) {
      router.replace("/login");
      return;
    }
    if (sessionStorage.getItem("from_login") === "1") {
      sessionStorage.removeItem("from_login");
      const termsAgreed = localStorage.getItem("jkn_terms_agreed") === "1";
      const hasPin = localStorage.getItem("jkn_has_pin") === "1";
      if (!termsAgreed) {
        setShowTerms(true);
      } else if (!hasPin) {
        // Terms sudah, tapi PIN belum Ã¢â‚¬â€ langsung ke modal PIN
        setPinStep(1);
        setPin1(["","","","","",""]);
        setPin2(["","","","","",""]);
        setPinError("");
        setShowSetPin(true);
      }
    }
  }, []);
  const [termsCompleted, setTermsCompleted] = useState(true); // bypass sementara untuk test mobile

  const requireTerms = (action: () => void) => {
    if (termsCompleted) action();
    else { setShowTerms(true); setTermsPage(0); setTermsAgreed(false); }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const q = searchQuery.toLowerCase();
      setSearchResults(searchData.filter(s => s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)));
      setSearchLoading(false);
    }, 600);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [searchQuery]);


  return (
    <div className="flex flex-col min-h-full relative">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header + Greeting (gradient) Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="pb-10" style={{ background: GRADIENT }}>
        <StatusBar />

        {/* Logo | Search | CS Icon */}
        <div className="flex items-center gap-2 mb-5 px-3 mt-5">
          <Image
            src="/images/logomjkn.svg"
            alt="Mobile JKN"
            width={32}
            height={22}
            className="object-contain shrink-0"
          />
          <div ref={searchRef} className="flex-1 min-w-0 relative">
            <div className="bg-white rounded-full flex items-center gap-2 px-3 py-2 shadow-sm">
              {searchLoading
                ? <Loader2 className="w-4 h-4 text-[#46ADDC] shrink-0 animate-spin" />
                : <Search className="w-4 h-4 text-gray-400 shrink-0" />
              }
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Cari layanan..."
                className="flex-1 min-w-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="shrink-0">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Dropdown hasil search */}
            {searchFocused && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden">
                {searchLoading ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-5">
                    <Loader2 className="w-4 h-4 text-[#46ADDC] animate-spin" />
                    <span className="text-gray-400 text-sm">Mencari layanan...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 px-4 py-3 active:bg-gray-50 border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                          <Image src={item.icon} alt={item.label} width={28} height={28} className="object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-sm font-semibold leading-tight">{item.label}</p>
                          <p className="text-gray-400 text-xs leading-tight mt-0.5 truncate">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 px-4 py-5">
                    <Search className="w-6 h-6 text-gray-300" />
                    <span className="text-gray-400 text-sm">Layanan tidak ditemukan</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <a
            href="https://bpjs-kesehatan.go.id/user-manual-mobile-jkn/video_mjkn.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0"
          >
            <Headphones className="w-5 h-5 text-white" strokeWidth={1.5} />
          </a>
        </div>

        {/* Greeting */}
        <div className="px-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-white font-bold text-xl">Hi, {userName}.</h1>
            <span className="bg-[#009B4D] text-white text-xs font-semibold px-3 py-0.5 rounded-full shrink-0">
              Aktif
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-white/75 text-sm">
              Semua Keluarga Anda Terlindungi (Aktif)
            </p>
            <div className="flex items-center gap-1.5">
              {isPredicting ? (
                <div className="flex items-center gap-1.5 bg-white/15 border border-white/30 rounded-full px-3 py-1 animate-pulse">
                  <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span className="text-white text-[10px] font-semibold">Menyesuaikan...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setDominanFeature(dominanFeature === "antrean" ? "riwayat" : dominanFeature === "riwayat" ? "ubah-data" : "antrean")}
                    className="flex items-center gap-1 bg-white/20 border border-white/40 rounded-full px-2.5 py-1"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                    <span className="text-white text-[10px] font-semibold">
                      {dominanFeature === "antrean" ? "Antrean" : dominanFeature === "riwayat" ? "Riwayat" : "Ubah Data"}
                    </span>
                  </button>
                  <button
                    onClick={() => setUserLevel(userLevel === "pemula" ? "mahir" : "pemula")}
                    className="flex items-center gap-1 bg-white/20 border border-white/40 rounded-full px-2.5 py-1"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${userLevel === "mahir" ? "bg-green-300" : "bg-yellow-300"}`} />
                    <span className="text-white text-[10px] font-semibold">{userLevel === "pemula" ? "Pemula" : "Mahir"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ White content area Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="flex-1 bg-white -mt-5 rounded-t-3xl px-4 pt-5 pb-4 flex flex-col gap-4">

        {/* Main feature card -- berubah sesuai fitur dominan */}
        {isPredicting ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-4 animate-pulse">
            <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-gray-100 rounded-full w-2/3" />
              <div className="h-3 bg-gray-100 rounded-full w-full" />
              <div className="h-3 bg-gray-100 rounded-full w-4/5" />
              <div className="flex gap-2 mt-1">
                <div className="h-7 bg-gray-100 rounded-full w-28" />
                <div className="h-7 bg-gray-100 rounded-full w-36" />
              </div>
            </div>
          </div>
        ) : dominanFeature === "antrean" ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <Image src="/images/logoantre.svg" alt="Antrean Online" width={80} height={80} className="object-contain" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#184087] font-bold text-base mb-1">Antrean Online</h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">Untuk kunjungan lebih efisien tanpa harus menunggu lama.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => requireTerms(() => { recordShortcut(); setShowAntreanSheet(true); })} className="self-start bg-[#009B4D] text-white text-xs font-semibold px-4 py-1.5 rounded-full">Ambil Antrean</button>
                <button onClick={() => requireTerms(() => { recordShortcut(); setShowSebelumnyaInfo(true); })} className="self-start bg-[#46ADDC] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Ambil Antrean Sebelumnya</button>
              </div>
            </div>
          </div>
        ) : dominanFeature === "riwayat" ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <Image src="/images/logoriwayat.svg" alt="Riwayat Pelayanan" width={80} height={80} className="object-contain" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#184087] font-bold text-base mb-1">Riwayat Pelayanan</h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">Akses riwayat layanan kesehatan Anda dengan lebih mudah.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => requireTerms(() => { recordShortcut(); router.push("/riwayat"); })} className="bg-[#009B4D] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Semua Riwayat</button>
                <button onClick={() => requireTerms(() => { recordShortcut(); router.push("/riwayat/sebelumnya"); })} className="bg-[#46ADDC] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Pelayanan Sebelumnya</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center shrink-0">
              <Image src="/images/logoubahdata.svg" alt="Ubah Data" width={80} height={80} className="object-contain" />
            </div>
            <div className="flex-1">
              <h2 className="text-[#184087] font-bold text-base mb-1">Ubah Data</h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">Kelola dan perbarui data Anda secara praktis melalui aplikasi.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => requireTerms(() => { recordShortcut(); router.push("/perubahan-data/faskes?from=beranda"); })} className="bg-[#46ADDC] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Ubah Data Faskes</button>
                <button onClick={() => requireTerms(() => { recordShortcut(); router.push("/perubahan-data"); })} className="bg-[#009B4D] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Eksplor Data Anda</button>
              </div>
            </div>
          </div>
        )}

        {/* Card antrean aktif — hanya tampil jika ada antrean */}
        {antreanAktif && (
          sudahCheckin ? (
            /* Sudah check in — reminder jadwal tanpa QR */
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: GRADIENT }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/25 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {antreanAktif.jenisAntrean === "rujukan" ? "Rujukan Tingkat Lanjut" : "Faskes Tingkat Pertama"}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm leading-snug mb-3">
                  Anda sudah check in. Silakan tunggu hingga nomor antrean dipanggil.
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={1.5} />
                    <span className="text-white text-xs">{antreanAktif.faskes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={1.5} />
                    <span className="text-white text-xs">{antreanAktif.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={1.5} />
                    <span className="text-white text-xs">No. Antrean {antreanAktif.nomorAntrean} · Estimasi {antreanAktif.estimasi}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Belum check in — ada QR untuk check in */
            <button onClick={() => requireTerms(() => router.push("/check-in?from=beranda"))} className="w-full text-left">
              <div
                className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:opacity-90 transition-opacity"
                style={{ background: GRADIENT }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/25 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {antreanAktif.jenisAntrean === "rujukan" ? "Rujukan Tingkat Lanjut" : "Faskes Tingkat Pertama"}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm leading-snug mb-3">
                    Lakukan check in untuk kunjungan Anda dengan detail berikut.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={1.5} />
                      <span className="text-white text-xs">{antreanAktif.faskes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={1.5} />
                      <span className="text-white text-xs">{antreanAktif.tanggal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={1.5} />
                      <span className="text-white text-xs">Estimasi: {antreanAktif.estimasi}</span>
                    </div>
                  </div>
                </div>
                <div className="w-px self-stretch bg-white/40 mx-1 shrink-0" />
                <QrCode className="w-16 h-16 text-white/85 shrink-0" strokeWidth={1} />
              </div>
            </button>
          )
        )}

        {/* Feature Grid â€” urutan dari RFR (featureOrder) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[...features].sort((a, b) => {
            const rfrId = (id: string) => id === "perubahan-data" ? "perubahan_data" : id;
            const ia = featureOrder.indexOf(rfrId(a.id));
            const ib = featureOrder.indexOf(rfrId(b.id));
            const ra = ia === -1 ? 99 : ia;
            const rb = ib === -1 ? 99 : ib;
            return ra - rb;
          }).map((feature) => (
            <button
              key={feature.id}
              onClick={() => requireTerms(() => {
                if (feature.useSheet) setShowAntreanSheet(true);
                else router.push(feature.href);
              })}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors shrink-0 w-[88px]"
            >
              <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <Image src={feature.imageSrc} alt={feature.title} width={48} height={48} className="object-contain" />
              </div>
              <p className="text-[#184087] font-semibold text-[9px] leading-tight text-center min-h-[34px]">{feature.title}</p>
              {userLevel === "pemula" && (
                <p className="text-gray-500 text-[8px] leading-tight text-center">{feature.description}</p>
              )}
            </button>
          ))}
        </div>

        {/* Janji Layanan */}
        <JanjiLayananCarousel />
      </div>

      {/* Bottom sheet: Pilih Jenis Antrean */}
      {showAntreanSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto">
          <div className="absolute inset-0 bg-black/10" onClick={() => setShowAntreanSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4 animate-slide-up">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <h2 className="text-[#184087] font-bold text-base text-center">Pilih Jenis Antrean</h2>
            <div className="flex flex-col gap-3">
              {jenisList.map((j) => (
                <button
                  key={j.label}
                  onClick={() => { setShowAntreanSheet(false); router.push(j.href); }}
                  className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3.5 active:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center shrink-0">
                    <img src={j.icon} alt={j.label} className="w-9 h-9 object-contain" />
                  </div>
                  <span className="flex-1 text-left text-gray-800 text-sm font-medium">{j.label}</span>
                  <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Popup info: Ambil Antrean Sebelumnya */}
      {showSebelumnyaInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-10 bg-black/40 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-5 flex flex-col items-center gap-2.5 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-sm text-center leading-snug">
              Ambil Antrean Sebelumnya
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Pengambilan antrean yang sama seperti sebelumnya hanya berlaku pada antrean layanan fasilitas kesehatan tingkat pertama
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button
                onClick={() => setShowSebelumnyaInfo(false)}
                className="flex-1 bg-[#E05555] text-white font-bold text-sm py-2.5 rounded-full"
              >
                Batal
              </button>
              <button
                onClick={() => { setShowSebelumnyaInfo(false); router.push("/antrean/sebelumnya?type=faskes"); }}
                className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-2.5 rounded-full"
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syarat & Ketentuan Ã¢â‚¬â€ muncul hanya saat pertama login */}
      {showTerms && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 bg-black/50 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl w-full shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: "80vh" }}>
            {/* Title */}
            <div className="px-5 pt-5 pb-3 text-center">
              <h2 className="text-[#184087] font-bold text-base leading-snug whitespace-pre-line">
                {TERMS_PAGES[termsPage].title}
              </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              <ol className="flex flex-col gap-3 list-decimal list-outside pl-4">
                {TERMS_PAGES[termsPage].points.map((p, i) => (
                  <li key={i} className="text-gray-700 text-xs leading-relaxed">{p}</li>
                ))}
              </ol>
              {"closing" in TERMS_PAGES[termsPage] && (
                <p className="text-gray-700 text-xs leading-relaxed mt-3">
                  {(TERMS_PAGES[termsPage] as { closing: string }).closing}
                </p>
              )}
            </div>

            {/* Checkbox Saya Setuju */}
            <div className="px-5 py-3 border-t border-gray-100">
              <label className="flex items-center gap-2.5 cursor-pointer" onClick={() => setTermsAgreed(v => !v)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${termsAgreed ? "bg-[#184087] border-[#184087]" : "bg-white border-gray-400"}`}>
                  {termsAgreed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700 text-sm">Saya Setuju</span>
              </label>
            </div>

            {/* Tombol navigasi */}
            <div className="px-5 pb-5 pt-2 flex gap-2">
              <button
                onClick={() => {
                  if (termsPage > 0) { setTermsPage(p => p - 1); setTermsAgreed(false); }
                  else { setShowTerms(false); setTermsPage(0); setTermsAgreed(false); }
                }}
                className="flex-1 bg-[#E05555] text-white font-bold text-sm py-3 rounded-full"
              >
                {termsPage === 0 ? "Tutup" : "Sebelumnya"}
              </button>
              <button
                disabled={!termsAgreed}
                onClick={() => {
                  if (!termsAgreed) return;
                  if (termsPage < TERMS_PAGES.length - 1) {
                    setTermsPage(p => p + 1);
                    setTermsAgreed(false);
                  } else {
                    setTermsCompleted(true);
                    setShowTerms(false);
                    setTermsPage(0);
                    setTermsAgreed(false);
                    // Simpan terms_agreed ke backend dan localStorage
                    const userId = localStorage.getItem("jkn_user_id");
                    if (userId) {
                      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/agree-terms/${userId}`, { method: "POST" })
                        .catch(() => {});
                      localStorage.setItem("jkn_terms_agreed", "1");
                    }
                    // Langsung tampilkan modal PIN karena pengguna baru belum punya PIN
                    setPinStep(1);
                    setPin1(["","","","","",""]);
                    setPin2(["","","","","",""]);
                    setPinError("");
                    setShowSetPin(true);
                  }
                }}
                className={`flex-1 font-bold text-sm py-3 rounded-full transition-colors ${
                  !termsAgreed ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-[#009B4D] text-white"
                }`}
              >
                {termsPage === TERMS_PAGES.length - 1 ? "Setuju" : "Selanjutnya"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Modal Buat PIN Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {showSetPin && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center px-6 max-w-[430px] mx-auto">
          <div className="bg-white rounded-3xl w-full px-6 py-8 flex flex-col items-center gap-5 shadow-2xl">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-[#184087]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#184087]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            {/* Judul */}
            <div className="text-center">
              <h2 className="text-[#184087] font-bold text-lg">
                {pinStep === 1 ? "Buat PIN Baru" : "Konfirmasi PIN"}
              </h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                {pinStep === 1
                  ? "Buat PIN 6 digit untuk keamanan akun Mobile JKN Anda."
                  : "Masukkan kembali PIN yang sama untuk konfirmasi."}
              </p>
            </div>

            {/* Input PIN */}
            <div className="flex gap-3">
              {(pinStep === 1 ? pin1 : pin2).map((val, i) => (
                <input
                  key={i}
                  ref={el => { (pinStep === 1 ? pin1Refs : pin2Refs).current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={e => handlePinChange(i, e.target.value, pinStep === 1 ? pin1 : pin2, pinStep === 1 ? setPin1 : setPin2, pinStep === 1 ? pin1Refs : pin2Refs)}
                  onKeyDown={e => handlePinKeyDown(i, e, pinStep === 1 ? pin1 : pin2, pinStep === 1 ? pin1Refs : pin2Refs)}
                  className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 focus:border-[#184087] rounded-xl bg-white outline-none transition-colors"
                />
              ))}
            </div>

            {/* Error */}
            {pinError && <p className="text-red-500 text-xs text-center -mt-2">{pinError}</p>}

            {/* Step indicator */}
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#184087]" />
              <div className={`w-2 h-2 rounded-full ${pinStep === 2 ? "bg-[#184087]" : "bg-gray-300"}`} />
            </div>

            {/* Tombol */}
            <button
              disabled={pinLoading}
              onClick={handlePinLanjut}
              className="w-full bg-[#009B4D] text-white font-bold text-base py-3.5 rounded-2xl disabled:opacity-60"
            >
              {pinLoading ? "Menyimpan..." : pinStep === 1 ? "Lanjut" : "Simpan PIN"}
            </button>

            {pinStep === 2 && (
              <button
                onClick={() => { setPinStep(1); setPin2(["","","","","",""]); setPinError(""); }}
                className="text-gray-400 text-xs underline -mt-2"
              >
                Kembali ubah PIN
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


