﻿"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isAdaptive } from "@/lib/adaptiveFlag";
import Link from "next/link";
import { ChevronLeft, ChevronDown, ShieldAlert, MessageSquare, Lock, Building2, Users, X, ChevronRight, CheckCircle2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

function TutorialPopup({ title, desc, visual, onSkip, onNext }: {
  title: string; desc: string; visual: React.ReactNode; onSkip: () => void; onNext: () => void;
}) {
  return (
    <div className="absolute top-0 left-0 right-0 z-[5] bg-white rounded-2xl px-4 py-4 shadow-xl border-2 border-[#184087] flex flex-col gap-3">
      <p className="text-[#184087] font-bold text-sm">{title}</p>
      <div className="pointer-events-none">{visual}</div>
      <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
      <div className="flex items-center justify-between">
        <button onClick={onSkip} className="text-gray-400 text-xs underline">Skip tutorial</button>
        <button onClick={onNext} className="w-8 h-8 bg-[#184087] rounded-full flex items-center justify-center shrink-0">
          <ChevronRight className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const steps = ["Isi Data", "Persetujuan", "Verifikasi PIN"];

const provinsiList = [
  "Aceh", "Bali", "Banten", "Bengkulu", "DI Yogyakarta", "DKI Jakarta",
  "Gorontalo", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur",
  "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kalimantan Utara",
  "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara",
  "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat",
  "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara",
  "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara",
];

const kotaByProvinsi: Record<string, string[]> = {
  "Aceh": ["Kota Banda Aceh", "Kota Langsa", "Kota Lhokseumawe", "Kota Sabang", "Kota Subulussalam", "Kabupaten Aceh Besar", "Kabupaten Aceh Utara", "Kabupaten Bireuen", "Kabupaten Pidie"],
  "Bali": ["Kota Denpasar", "Kabupaten Badung", "Kabupaten Bangli", "Kabupaten Buleleng", "Kabupaten Gianyar", "Kabupaten Jembrana", "Kabupaten Karangasem", "Kabupaten Klungkung", "Kabupaten Tabanan"],
  "Banten": ["Kota Cilegon", "Kota Serang", "Kota Tangerang", "Kota Tangerang Selatan", "Kabupaten Lebak", "Kabupaten Pandeglang", "Kabupaten Serang", "Kabupaten Tangerang"],
  "Bengkulu": ["Kota Bengkulu", "Kabupaten Bengkulu Selatan", "Kabupaten Bengkulu Tengah", "Kabupaten Bengkulu Utara", "Kabupaten Kepahiang", "Kabupaten Lebong", "Kabupaten Mukomuko", "Kabupaten Rejang Lebong", "Kabupaten Seluma"],
  "DI Yogyakarta": ["Kota Yogyakarta", "Kabupaten Bantul", "Kabupaten Gunungkidul", "Kabupaten Kulon Progo", "Kabupaten Sleman"],
  "DKI Jakarta": ["Jakarta Barat", "Jakarta Pusat", "Jakarta Selatan", "Jakarta Timur", "Jakarta Utara", "Kepulauan Seribu"],
  "Gorontalo": ["Kota Gorontalo", "Kabupaten Bone Bolango", "Kabupaten Gorontalo", "Kabupaten Gorontalo Utara", "Kabupaten Pohuwato"],
  "Jambi": ["Kota Jambi", "Kota Sungai Penuh", "Kabupaten Batanghari", "Kabupaten Bungo", "Kabupaten Kerinci", "Kabupaten Merangin", "Kabupaten Muaro Jambi", "Kabupaten Sarolangun", "Kabupaten Tanjung Jabung Barat", "Kabupaten Tanjung Jabung Timur", "Kabupaten Tebo"],
  "Jawa Barat": ["Kota Bandung", "Kota Bekasi", "Kota Bogor", "Kota Cimahi", "Kota Cirebon", "Kota Depok", "Kota Sukabumi", "Kota Tasikmalaya", "Kabupaten Bandung", "Kabupaten Bekasi", "Kabupaten Bogor", "Kabupaten Ciamis", "Kabupaten Cianjur", "Kabupaten Cirebon", "Kabupaten Garut", "Kabupaten Indramayu", "Kabupaten Karawang", "Kabupaten Kuningan", "Kabupaten Majalengka", "Kabupaten Purwakarta", "Kabupaten Subang", "Kabupaten Sukabumi", "Kabupaten Sumedang", "Kabupaten Tasikmalaya"],
  "Jawa Tengah": ["Kota Magelang", "Kota Pekalongan", "Kota Salatiga", "Kota Semarang", "Kota Solo", "Kota Tegal", "Kabupaten Banyumas", "Kabupaten Batang", "Kabupaten Blora", "Kabupaten Boyolali", "Kabupaten Brebes", "Kabupaten Cilacap", "Kabupaten Demak", "Kabupaten Grobogan", "Kabupaten Jepara", "Kabupaten Karanganyar", "Kabupaten Kebumen", "Kabupaten Kendal", "Kabupaten Klaten", "Kabupaten Kudus", "Kabupaten Magelang", "Kabupaten Pati", "Kabupaten Pekalongan", "Kabupaten Pemalang", "Kabupaten Purbalingga", "Kabupaten Purworejo", "Kabupaten Rembang", "Kabupaten Semarang", "Kabupaten Sragen", "Kabupaten Sukoharjo", "Kabupaten Tegal", "Kabupaten Temanggung", "Kabupaten Wonogiri", "Kabupaten Wonosobo"],
  "Jawa Timur": ["Kota Batu", "Kota Blitar", "Kota Kediri", "Kota Madiun", "Kota Malang", "Kota Mojokerto", "Kota Pasuruan", "Kota Probolinggo", "Kota Surabaya", "Kabupaten Bangkalan", "Kabupaten Banyuwangi", "Kabupaten Blitar", "Kabupaten Bojonegoro", "Kabupaten Bondowoso", "Kabupaten Gresik", "Kabupaten Jember", "Kabupaten Jombang", "Kabupaten Kediri", "Kabupaten Lamongan", "Kabupaten Lumajang", "Kabupaten Madiun", "Kabupaten Magetan", "Kabupaten Malang", "Kabupaten Mojokerto", "Kabupaten Nganjuk", "Kabupaten Ngawi", "Kabupaten Pacitan", "Kabupaten Pamekasan", "Kabupaten Pasuruan", "Kabupaten Ponorogo", "Kabupaten Probolinggo", "Kabupaten Sampang", "Kabupaten Sidoarjo", "Kabupaten Situbondo", "Kabupaten Sumenep", "Kabupaten Trenggalek", "Kabupaten Tuban", "Kabupaten Tulungagung"],
  "Kalimantan Barat": ["Kota Pontianak", "Kota Singkawang", "Kabupaten Bengkayang", "Kabupaten Kapuas Hulu", "Kabupaten Kayong Utara", "Kabupaten Ketapang", "Kabupaten Kubu Raya", "Kabupaten Landak", "Kabupaten Melawi", "Kabupaten Mempawah", "Kabupaten Sambas", "Kabupaten Sanggau", "Kabupaten Sekadau", "Kabupaten Sintang"],
  "Kalimantan Selatan": ["Kota Banjarbaru", "Kota Banjarmasin", "Kabupaten Balangan", "Kabupaten Banjar", "Kabupaten Barito Kuala", "Kabupaten Hulu Sungai Selatan", "Kabupaten Hulu Sungai Tengah", "Kabupaten Hulu Sungai Utara", "Kabupaten Kotabaru", "Kabupaten Tabalong", "Kabupaten Tanah Bumbu", "Kabupaten Tanah Laut", "Kabupaten Tapin"],
  "Kalimantan Tengah": ["Kota Palangka Raya", "Kabupaten Barito Selatan", "Kabupaten Barito Timur", "Kabupaten Barito Utara", "Kabupaten Gunung Mas", "Kabupaten Kapuas", "Kabupaten Katingan", "Kabupaten Kotawaringin Barat", "Kabupaten Kotawaringin Timur", "Kabupaten Lamandau", "Kabupaten Murung Raya", "Kabupaten Pulang Pisau", "Kabupaten Seruyan", "Kabupaten Sukamara"],
  "Kalimantan Timur": ["Kota Balikpapan", "Kota Bontang", "Kota Samarinda", "Kabupaten Berau", "Kabupaten Kutai Barat", "Kabupaten Kutai Kartanegara", "Kabupaten Kutai Timur", "Kabupaten Mahakam Ulu", "Kabupaten Paser", "Kabupaten Penajam Paser Utara"],
  "Kalimantan Utara": ["Kota Tarakan", "Kabupaten Bulungan", "Kabupaten Malinau", "Kabupaten Nunukan", "Kabupaten Tana Tidung"],
  "Kepulauan Bangka Belitung": ["Kota Pangkal Pinang", "Kabupaten Bangka", "Kabupaten Bangka Barat", "Kabupaten Bangka Selatan", "Kabupaten Bangka Tengah", "Kabupaten Belitung", "Kabupaten Belitung Timur"],
  "Kepulauan Riau": ["Kota Batam", "Kota Tanjungpinang", "Kabupaten Bintan", "Kabupaten Karimun", "Kabupaten Kepulauan Anambas", "Kabupaten Lingga", "Kabupaten Natuna"],
  "Lampung": ["Kota Bandar Lampung", "Kota Metro", "Kabupaten Lampung Barat", "Kabupaten Lampung Selatan", "Kabupaten Lampung Tengah", "Kabupaten Lampung Timur", "Kabupaten Lampung Utara", "Kabupaten Mesuji", "Kabupaten Pesawaran", "Kabupaten Pesisir Barat", "Kabupaten Pringsewu", "Kabupaten Tanggamus", "Kabupaten Tulang Bawang", "Kabupaten Tulang Bawang Barat", "Kabupaten Way Kanan"],
  "Maluku": ["Kota Ambon", "Kota Tual", "Kabupaten Buru", "Kabupaten Buru Selatan", "Kabupaten Kepulauan Aru", "Kabupaten Maluku Barat Daya", "Kabupaten Maluku Tengah", "Kabupaten Maluku Tenggara", "Kabupaten Maluku Tenggara Barat", "Kabupaten Seram Bagian Barat", "Kabupaten Seram Bagian Timur"],
  "Maluku Utara": ["Kota Ternate", "Kota Tidore Kepulauan", "Kabupaten Halmahera Barat", "Kabupaten Halmahera Selatan", "Kabupaten Halmahera Tengah", "Kabupaten Halmahera Timur", "Kabupaten Halmahera Utara", "Kabupaten Kepulauan Sula", "Kabupaten Pulau Morotai", "Kabupaten Pulau Taliabu"],
  "Nusa Tenggara Barat": ["Kota Bima", "Kota Mataram", "Kabupaten Bima", "Kabupaten Dompu", "Kabupaten Lombok Barat", "Kabupaten Lombok Tengah", "Kabupaten Lombok Timur", "Kabupaten Lombok Utara", "Kabupaten Sumbawa", "Kabupaten Sumbawa Barat"],
  "Nusa Tenggara Timur": ["Kota Kupang", "Kabupaten Alor", "Kabupaten Belu", "Kabupaten Ende", "Kabupaten Flores Timur", "Kabupaten Kupang", "Kabupaten Lembata", "Kabupaten Malaka", "Kabupaten Manggarai", "Kabupaten Manggarai Barat", "Kabupaten Manggarai Timur", "Kabupaten Nagekeo", "Kabupaten Ngada", "Kabupaten Rote Ndao", "Kabupaten Sabu Raijua", "Kabupaten Sikka", "Kabupaten Sumba Barat", "Kabupaten Sumba Barat Daya", "Kabupaten Sumba Tengah", "Kabupaten Sumba Timur", "Kabupaten Timor Tengah Selatan", "Kabupaten Timor Tengah Utara"],
  "Papua": ["Kota Jayapura", "Kabupaten Biak Numfor", "Kabupaten Jayapura", "Kabupaten Jayawijaya", "Kabupaten Keerom", "Kabupaten Kepulauan Yapen", "Kabupaten Mamberamo Raya", "Kabupaten Merauke", "Kabupaten Mimika", "Kabupaten Nabire", "Kabupaten Sarmi", "Kabupaten Supiori", "Kabupaten Tolikara", "Kabupaten Waropen"],
  "Papua Barat": ["Kota Sorong", "Kabupaten Fakfak", "Kabupaten Kaimana", "Kabupaten Manokwari", "Kabupaten Manokwari Selatan", "Kabupaten Maybrat", "Kabupaten Pegunungan Arfak", "Kabupaten Raja Ampat", "Kabupaten Sorong", "Kabupaten Sorong Selatan", "Kabupaten Tambrauw", "Kabupaten Teluk Bintuni", "Kabupaten Teluk Wondama"],
  "Riau": ["Kota Dumai", "Kota Pekanbaru", "Kabupaten Bengkalis", "Kabupaten Indragiri Hilir", "Kabupaten Indragiri Hulu", "Kabupaten Kampar", "Kabupaten Kepulauan Meranti", "Kabupaten Kuantan Singingi", "Kabupaten Pelalawan", "Kabupaten Rokan Hilir", "Kabupaten Rokan Hulu", "Kabupaten Siak"],
  "Sulawesi Barat": ["Kabupaten Majene", "Kabupaten Mamasa", "Kabupaten Mamuju", "Kabupaten Mamuju Tengah", "Kabupaten Pasangkayu", "Kabupaten Polewali Mandar"],
  "Sulawesi Selatan": ["Kota Makassar", "Kota Palopo", "Kota Parepare", "Kabupaten Bantaeng", "Kabupaten Barru", "Kabupaten Bone", "Kabupaten Bulukumba", "Kabupaten Enrekang", "Kabupaten Gowa", "Kabupaten Jeneponto", "Kabupaten Kepulauan Selayar", "Kabupaten Luwu", "Kabupaten Luwu Timur", "Kabupaten Luwu Utara", "Kabupaten Maros", "Kabupaten Pangkajene dan Kepulauan", "Kabupaten Pinrang", "Kabupaten Sidenreng Rappang", "Kabupaten Sinjai", "Kabupaten Soppeng", "Kabupaten Takalar", "Kabupaten Tana Toraja", "Kabupaten Toraja Utara", "Kabupaten Wajo"],
  "Sulawesi Tengah": ["Kota Palu", "Kabupaten Banggai", "Kabupaten Banggai Kepulauan", "Kabupaten Banggai Laut", "Kabupaten Buol", "Kabupaten Donggala", "Kabupaten Morowali", "Kabupaten Morowali Utara", "Kabupaten Parigi Moutong", "Kabupaten Poso", "Kabupaten Sigi", "Kabupaten Tojo Una-Una", "Kabupaten Toli-Toli"],
  "Sulawesi Tenggara": ["Kota Bau-Bau", "Kota Kendari", "Kabupaten Bombana", "Kabupaten Buton", "Kabupaten Buton Selatan", "Kabupaten Buton Tengah", "Kabupaten Buton Utara", "Kabupaten Kolaka", "Kabupaten Kolaka Timur", "Kabupaten Kolaka Utara", "Kabupaten Konawe", "Kabupaten Konawe Kepulauan", "Kabupaten Konawe Selatan", "Kabupaten Konawe Utara", "Kabupaten Muna", "Kabupaten Muna Barat", "Kabupaten Wakatobi"],
  "Sulawesi Utara": ["Kota Bitung", "Kota Kotamobagu", "Kota Manado", "Kota Tomohon", "Kabupaten Bolaang Mongondow", "Kabupaten Bolaang Mongondow Selatan", "Kabupaten Bolaang Mongondow Timur", "Kabupaten Bolaang Mongondow Utara", "Kabupaten Kepulauan Sangihe", "Kabupaten Kepulauan Siau Tagulandang Biaro", "Kabupaten Kepulauan Talaud", "Kabupaten Minahasa", "Kabupaten Minahasa Selatan", "Kabupaten Minahasa Tenggara", "Kabupaten Minahasa Utara"],
  "Sumatera Barat": ["Kota Bukittinggi", "Kota Padang", "Kota Padang Panjang", "Kota Pariaman", "Kota Payakumbuh", "Kota Sawahlunto", "Kota Solok", "Kabupaten Agam", "Kabupaten Dharmasraya", "Kabupaten Kepulauan Mentawai", "Kabupaten Lima Puluh Kota", "Kabupaten Padang Pariaman", "Kabupaten Pasaman", "Kabupaten Pasaman Barat", "Kabupaten Pesisir Selatan", "Kabupaten Sijunjung", "Kabupaten Solok", "Kabupaten Solok Selatan", "Kabupaten Tanah Datar"],
  "Sumatera Selatan": ["Kota Lubuklinggau", "Kota Pagar Alam", "Kota Palembang", "Kota Prabumulih", "Kabupaten Banyuasin", "Kabupaten Empat Lawang", "Kabupaten Lahat", "Kabupaten Muara Enim", "Kabupaten Musi Banyuasin", "Kabupaten Musi Rawas", "Kabupaten Musi Rawas Utara", "Kabupaten Ogan Ilir", "Kabupaten Ogan Komering Ilir", "Kabupaten Ogan Komering Ulu", "Kabupaten Ogan Komering Ulu Selatan", "Kabupaten Ogan Komering Ulu Timur", "Kabupaten Penukal Abab Lematang Ilir"],
  "Sumatera Utara": ["Kota Binjai", "Kota Gunungsitoli", "Kota Medan", "Kota Padangsidimpuan", "Kota Pematangsiantar", "Kota Sibolga", "Kota Tanjungbalai", "Kabupaten Asahan", "Kabupaten Batubara", "Kabupaten Dairi", "Kabupaten Deli Serdang", "Kabupaten Humbang Hasundutan", "Kabupaten Karo", "Kabupaten Labuhanbatu", "Kabupaten Labuhanbatu Selatan", "Kabupaten Labuhanbatu Utara", "Kabupaten Langkat", "Kabupaten Mandailing Natal", "Kabupaten Nias", "Kabupaten Nias Barat", "Kabupaten Nias Selatan", "Kabupaten Nias Utara", "Kabupaten Padang Lawas", "Kabupaten Padang Lawas Utara", "Kabupaten Pakpak Bharat", "Kabupaten Samosir", "Kabupaten Serdang Bedagai", "Kabupaten Simalungun", "Kabupaten Tapanuli Selatan", "Kabupaten Tapanuli Tengah", "Kabupaten Tapanuli Utara", "Kabupaten Toba"],
};

const faksesData: Record<string, { nama: string; jarak: number; jumlahPeserta: number }[]> = {
  "Kota Medan": [
    { nama: "Klinik Indi Medika", jarak: 0.8, jumlahPeserta: 12450 },
    { nama: "Puskesmas Medan Baru", jarak: 1.2, jumlahPeserta: 34210 },
    { nama: "Klinik Sehat Bersama", jarak: 2.1, jumlahPeserta: 8730 },
    { nama: "RS Awal Bros", jarak: 3.0, jumlahPeserta: 67682 },
    { nama: "Klinik Dharma Sidhi", jarak: 3.4, jumlahPeserta: 67682 },
  ],
  "Kota Pekanbaru": [
    { nama: "Puskesmas Sail", jarak: 0.5, jumlahPeserta: 21300 },
    { nama: "Klinik Harapan Sehat", jarak: 1.8, jumlahPeserta: 9870 },
    { nama: "RS Awal Bros Pekanbaru", jarak: 2.5, jumlahPeserta: 54320 },
  ],
  "Kota Surabaya": [
    { nama: "Puskesmas Wonokromo", jarak: 0.6, jumlahPeserta: 18900 },
    { nama: "Klinik Medika Prima", jarak: 1.4, jumlahPeserta: 11200 },
    { nama: "RS Siloam Surabaya", jarak: 2.8, jumlahPeserta: 72100 },
  ],
};

const defaultFakses = [
  { nama: "Puskesmas Terdekat", jarak: 1.0, jumlahPeserta: 15000 },
  { nama: "Klinik Pratama Sehat", jarak: 2.2, jumlahPeserta: 9500 },
  { nama: "RS Umum Daerah", jarak: 4.5, jumlahPeserta: 45000 },
];

export default function PerubahanFaksesPage() {
  useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userLevel, recordTutorial, recordInteraction, recordTaskCompletion, recordError } = useUserLevel();
  useEffect(() => { recordInteraction("perubahan_data"); }, []);
  const taskStartRef = useRef<number>(Date.now());
  const taskCompletedRef = useRef(false);
  useEffect(() => {
    return () => {
      if (!taskCompletedRef.current) {
        const duration = Math.floor((Date.now() - taskStartRef.current) / 1000);
        recordTaskCompletion(false, duration);
      }
    };
  }, []);
  const [step, setStep] = useState(1);
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  useEffect(() => {
    if (isAdaptive() && userLevel === "pemula") setTutorialStep(0);
  }, [userLevel]);

  const skipTutorial = () => { recordTutorial(); setTutorialStep(null); };
  const nextTutorial = () => {
    recordTutorial();
    if (tutorialStep !== null && tutorialStep < 2) setTutorialStep(tutorialStep + 1);
    else setTutorialStep(null);
  };
  const [provinsi, setProvinsi] = useState("");
  const [kota, setKota] = useState("");
  const [faskes, setFaskes] = useState("");
  const [openDrop, setOpenDrop] = useState<"provinsi" | "kota" | null>(null);
  const [showFaksesSheet, setShowFaksesSheet] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [faksesError, setFaksesError] = useState(false);

  const kotaList = provinsi ? (kotaByProvinsi[provinsi] ?? []).sort() : [];
  const faksesList = kota
    ? (faksesData[kota] ?? defaultFakses).sort((a, b) => a.jarak - b.jarak)
    : [];

  const handlePin = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...pin];
    next[i] = val.slice(-1);
    setPin(next);
    if (val && i < 5) document.getElementById(`pin-${i + 1}`)?.focus();
  };

  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) document.getElementById(`pin-${i - 1}`)?.focus();
  };

  const backTo = searchParams.get("from") === "beranda" ? "/" : "/perubahan-data";
  const handleBack = () => {
    if (step === 1) router.push(backTo);
    else setShowWarning(true);
  };

  const handleProvinsiSelect = (val: string) => {
    setProvinsi(val);
    setKota("");
    setFaskes("");
    setOpenDrop(null);
  };

  const handleKotaSelect = (val: string) => {
    setKota(val);
    setFaskes("");
    setOpenDrop(null);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <button type="button" onClick={handleBack} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <h1 className="text-white font-bold text-lg text-center leading-tight px-10">
            {step === 2 ? "Verifikasi" : "Perubahan Faskes Tingkat Pertama"}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Step indicator */}
        <div className="flex items-start">
          {steps.map((s, i) => {
            const num = i + 1;
            const active = num === step;
            const done = num < step;
            return (
              <div key={s} className="flex items-start flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${done || active ? "bg-[#009B4D] border-[#009B4D] text-white" : "bg-white border-gray-300 text-gray-400"}`}>
                    {done ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : num}
                  </div>
                  <span className={`text-[9px] text-center leading-tight w-14 ${active || done ? "text-gray-600" : "text-gray-400"}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mt-4 mx-0.5 ${done ? "bg-[#009B4D]" : "bg-gray-300"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Isi Data */}
        {step === 1 && (
          <>
            <p className="text-gray-900 font-semibold text-sm leading-snug">
              Perubahan Fasilitas Kesehatan Tingkat Pertama dapat dilakukan minimal 3 bulan sekali.
            </p>

            {/* Provinsi */}
            <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 0 ? "z-[5]" : ""}`}>
              <h2 className="text-[#184087] font-bold text-sm">Provinsi</h2>
              {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih provinsi lokasi fasilitas kesehatan tingkat pertama yang ingin digunakan.</p>}
              <div className="relative mt-1">
                <button
                  onClick={() => tutorialStep === null && setOpenDrop(openDrop === "provinsi" ? null : "provinsi")}
                  className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm font-medium bg-white transition-colors"
                >
                  <span className={provinsi ? "text-gray-700" : "text-gray-400"}>{provinsi || "Pilih Provinsi"}</span>
                  <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "provinsi" ? "rotate-180" : ""}`} />
                </button>
                {openDrop === "provinsi" && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-y-auto max-h-52">
                    {provinsiList.map((p) => (
                      <button key={p} onClick={() => handleProvinsiSelect(p)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${p === provinsi ? "text-[#184087] font-semibold" : "text-gray-700"}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {tutorialStep === 0 && (
                <TutorialPopup
                  title="Provinsi"
                  desc="Pilih provinsi sesuai lokasi fasilitas kesehatan yang diinginkan."
                  visual={
                    <div className="w-full flex items-center justify-between border-2 border-[#184087] rounded-xl px-4 py-3 text-sm font-medium bg-white">
                      <span className="text-gray-400">Pilih Provinsi</span>
                      <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                    </div>
                  }
                  onSkip={skipTutorial}
                  onNext={nextTutorial}
                />
              )}
            </div>

            {/* Kota/Kabupaten */}
            <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 1 ? "z-[5]" : ""}`}>
              <h2 className="text-[#184087] font-bold text-sm">Kota/Kabupaten</h2>
              {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih kota atau kabupaten sesuai wilayah fasilitas kesehatan yang dipilih.</p>}
              <div className="relative mt-1">
                <button
                  onClick={() => { if (provinsi && tutorialStep === null) setOpenDrop(openDrop === "kota" ? null : "kota"); }}
                  className={`w-full flex items-center justify-between border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white ${provinsi ? "border-[#184087]" : "border-gray-200 opacity-50 cursor-not-allowed"}`}
                >
                  <span className={kota ? "text-gray-700" : "text-gray-400"}>{kota || "Pilih Kota/Kabupaten"}</span>
                  <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "kota" ? "rotate-180" : ""}`} />
                </button>
                {openDrop === "kota" && kotaList.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-y-auto max-h-52">
                    {kotaList.map((k) => (
                      <button key={k} onClick={() => handleKotaSelect(k)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${k === kota ? "text-[#184087] font-semibold" : "text-gray-700"}`}>
                        {k}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {tutorialStep === 1 && (
                <TutorialPopup
                  title="Kota/Kabupaten"
                  desc="Pilih kota atau kabupaten sesuai wilayah fasilitas kesehatan yang dipilih."
                  visual={
                    <div className="w-full flex items-center justify-between border-2 border-[#184087] rounded-xl px-4 py-3 text-sm font-medium bg-white">
                      <span className="text-gray-400">Pilih Kota/Kabupaten</span>
                      <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                    </div>
                  }
                  onSkip={skipTutorial}
                  onNext={nextTutorial}
                />
              )}
            </div>

            {/* Fasilitas Kesehatan */}
            <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 2 ? "z-[5]" : ""}`}>
              <h2 className="text-[#184087] font-bold text-sm">Fasilitas Kesehatan</h2>
              {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih fasilitas kesehatan tingkat pertama (FKTP) yang ingin Anda tetapkan sebagai fasilitas kesehatan tingkat pertama.</p>}
              <button
                onClick={() => { if (kota && tutorialStep === null) { setShowFaksesSheet(true); setFaksesError(false); } }}
                className={`w-full flex items-center justify-between border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white mt-1 ${!kota ? "border-gray-200 opacity-50 cursor-not-allowed" : faksesError ? "border-[#E05555]" : "border-[#184087]"}`}
              >
                <span className={faskes ? "text-gray-700" : (faksesError ? "text-[#E05555]" : "text-gray-400")}>{faskes || "Pilih Faskes Tingkat Pertama"}</span>
                <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
              </button>
              {faksesError && <p className="text-[#E05555] text-xs mt-1">Pilih fasilitas kesehatan terlebih dahulu.</p>}
              {tutorialStep === 2 && (
                <TutorialPopup
                  title="Fasilitas Kesehatan"
                  desc="Pilih fasilitas kesehatan tingkat pertama yang akan digunakan."
                  visual={
                    <div className="w-full flex items-center justify-between border-2 border-[#184087] rounded-xl px-4 py-3 text-sm font-medium bg-white">
                      <span className="text-gray-400">Pilih Faskes Tingkat Pertama</span>
                      <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                    </div>
                  }
                  onSkip={skipTutorial}
                  onNext={nextTutorial}
                />
              )}
            </div>
          </>
        )}

        {/* Step 2: Persetujuan */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-8 py-6">
            <ShieldAlert className="w-36 h-36 text-[#184087]" strokeWidth={1.2} />
            <p className="text-gray-900 font-medium text-base text-center leading-relaxed px-4">
              Saya bertanggung jawab penuh terhadap perubahan data Pribadi maupun Anggota Keluarga yang akan dilakukan perubahan data
            </p>
          </div>
        )}

        {/* Step 3: Verifikasi PIN */}
        {step === 3 && (
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <MessageSquare className="w-20 h-20 text-[#184087] absolute top-0 left-0" strokeWidth={1.5} fill="#184087" />
              <div className="absolute bottom-0 right-0 w-9 h-9 bg-[#184087] rounded-full flex items-center justify-center border-4 border-gray-50">
                <Lock className="w-4 h-4 text-white" strokeWidth={2} fill="white" />
              </div>
            </div>
            <h2 className="text-gray-900 font-bold text-lg text-center leading-snug">
              Masukkan PIN Anda saat ini
            </h2>
            {userLevel === "pemula" && (
              <p className="text-gray-500 text-sm text-center leading-relaxed">
                PIN digunakan untuk melakukan verifikasi pada menu perubahan data
              </p>
            )}
            <div className="flex justify-center gap-3 mt-1">
              {pin.map((v, i) => (
                <input
                  key={i}
                  id={`pin-${i}`}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => { handlePin(i, e.target.value); setPinError(""); }}
                  onKeyDown={(e) => handlePinKey(i, e)}
                  className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl bg-white outline-none transition-colors ${pinError ? "border-[#E05555]" : "border-gray-300 focus:border-[#184087]"}`}
                />
              ))}
            </div>
            {pinError && <p className="text-[#E05555] text-xs text-center">{pinError}</p>}
          </div>
        )}

        <div className="flex-1" />

        {step === 2 ? (
          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 bg-[#E05555] text-white font-bold text-base py-4 rounded-2xl">
              Batal
            </button>
            <button onClick={() => setStep(3)}
              className="flex-1 bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl">
              Setuju
            </button>
          </div>
        ) : (
          <button
            onClick={async () => {
              if (step === 1) {
                if (!faskes) { recordError(); setFaksesError(true); return; }
                setStep(2);
              } else {
                // step 3: verifikasi PIN ke backend
                const pinValue = pin.join("");
                if (pinValue.length < 6) { recordError(); setPinError("PIN harus 6 digit."); return; }
                const userId = localStorage.getItem("jkn_user_id");
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/verify-pin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: parseInt(userId ?? "0"), pin: pinValue }),
                  });
                  if (!res.ok) {
                    recordError();
                    setPinError("PIN yang Anda masukkan salah.");
                    setPin(["", "", "", "", "", ""]);
                    document.getElementById("pin-0")?.focus();
                    return;
                  }
                  setPinError("");
                  localStorage.setItem("jkn_faskes", faskes);
                  const duration = Math.floor((Date.now() - taskStartRef.current) / 1000);
                  taskCompletedRef.current = true;
                  recordTaskCompletion(true, duration);
                  setShowSuccess(true);
                } catch {
                  setPinError("Tidak dapat terhubung ke server.");
                }
              }
            }}
            className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
          >
            Verifikasi
          </button>
        )}
      </div>

      {/* Bottom sheet: Pilih Faskes */}
      {showFaksesSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFaksesSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4 max-h-[70%] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <div className="relative flex items-center justify-center">
              <h2 className="text-[#184087] font-bold text-base text-center">Daftar Faskes Tingkat Pertama</h2>
              <button onClick={() => setShowFaksesSheet(false)} className="absolute right-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-gray-400 text-xs text-center -mt-2">Diurutkan berdasarkan jarak terdekat dari lokasi Anda</p>
            <div className="flex flex-col gap-3">
              {faksesList.map((f, i) => (
                <button
                  key={i}
                  onClick={() => { setFaskes(f.nama); setShowFaksesSheet(false); }}
                  className={`bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 text-left active:bg-gray-100 transition-colors border-2 ${faskes === f.nama ? "border-[#184087]" : "border-transparent"}`}
                >
                  <p className="text-gray-900 font-bold text-sm text-center w-full">{f.nama}</p>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#184087]" strokeWidth={1.8} />
                        <span className="text-gray-600 text-sm">Jarak</span>
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{f.jarak} Km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#184087]" strokeWidth={1.8} />
                        <span className="text-gray-600 text-sm">Jumlah Peserta</span>
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{f.jumlahPeserta.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Apakah Anda yakin ingin keluar?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Proses perubahan faskes akan dibatalkan dan Anda akan kembali ke halaman perubahan data
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button onClick={() => router.push(backTo)}
                className="flex-1 bg-[#E05555] text-white font-bold text-sm py-3 rounded-full">
                Keluar
              </button>
              <button onClick={() => setShowWarning(false)}
                className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full">
                Lanjut Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dim overlay saat tutorial aktif */}
      {tutorialStep !== null && (
        <div className="absolute inset-0 bg-black/40 z-[4] pointer-events-none" />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#009B4D]" strokeWidth={1.5} />
            </div>
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Perubahan Faskes Berhasil
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Fasilitas kesehatan tingkat pertama Anda telah berhasil diperbarui
            </p>
            <Link href="/perubahan-data"
              className="w-full bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full text-center mt-1">
              Kembali ke Perubahan Data
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}




