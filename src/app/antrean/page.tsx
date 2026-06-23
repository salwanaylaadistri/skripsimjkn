"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, MapPin, Phone, X, ChevronRight } from "lucide-react";

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
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const pesertaDummy = "Farah Adillah (0128056381133)";

const poliList = ["Poli Umum", "Poli Gigi"];

const tanggalList = ["Hari ini (28-04-2026)", "Besok (29-04-2026)"];

const tenagaMedisList = [
  { nama: "Aldhi Nadir", jam: "08:45 - 15:00", diambil: 11, sisa: 2, panggil: 12 },
  { nama: "Aldhi Nadir", jam: "08:45 - 15:00", diambil: 11, sisa: 2, panggil: 12 },
];


type DropdownField = "peserta" | "poli" | "tanggal" | null;

const tutorialSteps = [
  {
    field: "peserta",
    title: "Peserta",
    desc: "Pilih data peserta yang akan menggunakan layanan kesehatan. Pastikan data peserta sudah sesuai sebelum melanjutkan.",
  },
  {
    field: "faskes",
    title: "Faskes Tingkat Pertama",
    desc: "Sistem akan menampilkan fasilitas kesehatan tingkat pertama (FKTP) tempat Anda terdaftar beserta informasi alamat dan kontak fasilitas kesehatan.",
  },
  {
    field: "poli",
    title: "Pilih Poli",
    desc: "Pilih poli atau layanan kesehatan sesuai kebutuhan pemeriksaan Anda agar antrean dapat diproses dengan tepat.",
  },
  {
    field: "tanggal",
    title: "Pilih Tanggal Daftar",
    desc: "Tentukan tanggal pelayanan sesuai jadwal yang tersedia untuk melakukan pemeriksaan di fasilitas kesehatan.",
  },
  {
    field: "tenaga",
    title: "Pilih Jadwal dan Tenaga Medis",
    desc: "Pilih jadwal praktik dan tenaga medis yang tersedia sesuai kebutuhan pelayanan Anda.",
  },
  {
    field: "keluhan",
    title: "Keluhan",
    desc: "Tuliskan keluhan atau alasan kunjungan secara singkat untuk membantu proses pelayanan di fasilitas kesehatan.",
  },
];

export default function AntreanPage() {
  useRequireAuth();
  const router = useRouter();
  const { userLevel, recordTutorial, recordInteraction, recordTaskCompletion, recordError } = useUserLevel();
  useEffect(() => { recordInteraction("antrean"); }, []);

  // Redirect ke tiket jika sudah ada antrean aktif untuk akun ini
  useEffect(() => {
    const uid = localStorage.getItem("jkn_user_id");
    if (uid && localStorage.getItem(`jkn_antrean_faskes_${uid}`)) {
      router.replace("/antrean/tiket");
    }
  }, []);

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
  const [openDrop, setOpenDrop] = useState<DropdownField>(null);
  const [pesertaList, setPesertaList] = useState<string[]>([pesertaDummy]);
  const [peserta, setPeserta] = useState("");
  const [faskes, setFaskes] = useState("Klinik Indi Medika");
  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama") ?? "Pengguna";
    const nik  = localStorage.getItem("jkn_nik") ?? "-";
    const utama = `${nama} (${nik})`;
    setPesertaList([utama, pesertaDummy]);
    setPeserta(utama);
    const savedFaskes = localStorage.getItem("jkn_faskes");
    if (savedFaskes) setFaskes(savedFaskes);
  }, []);
  const [poli, setPoli] = useState("Poli Umum");
  const [tanggal, setTanggal] = useState(tanggalList[0]);
  const [showTenagaSheet, setShowTenagaSheet] = useState(false);
  const [tenagaMedis, setTenagaMedis] = useState<string | null>(null);
  const [tenagaError, setTenagaError] = useState(false);
  const [keluhan, setKeluhan] = useState("");
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  useEffect(() => {
    if (userLevel === "pemula") setTutorialStep(0);
  }, [userLevel]);

  const skipTutorial = () => { recordTutorial(); setTutorialStep(null); };
  const nextTutorial = () => {
    recordTutorial();
    if (tutorialStep !== null && tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialStep(null);
    }
  };

  const toggleDrop = (field: DropdownField) => {
    setOpenDrop((prev) => (prev === field ? null : field));
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center leading-tight px-10">
            Antrean Fasilitas Kesehatan<br />Tingkat Pertama
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
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 0 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Peserta</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih data peserta yang akan didaftarkan untuk layanan kesehatan.</p>}
          <div className="relative mt-1">
            <button
              onClick={() => tutorialStep === null && toggleDrop("peserta")}
              className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors"
            >
              <span>{peserta}</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "peserta" ? "rotate-180" : ""}`} />
            </button>
            {openDrop === "peserta" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {pesertaList.map((p) => (
                  <button key={p} onClick={() => { setPeserta(p); setOpenDrop(null); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${p === peserta ? "text-[#184087] font-semibold" : "text-gray-700"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          {tutorialStep === 0 && (
            <TutorialPopup
              title="Peserta"
              desc="Pilih data peserta yang akan menggunakan layanan kesehatan. Pastikan data peserta sudah sesuai sebelum melanjutkan."
              visual={
                <div className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors">
                  <span>{pesertaList[0]}</span>
                  <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Faskes Tingkat Pertama */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 1 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Faskes Tingkat Pertama</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Menampilkan fasilitas kesehatan tempat Anda terdaftar.</p>}
          <div className="border-2 border-[#184087] rounded-xl bg-white mt-1 overflow-hidden">
            <div className="bg-[#EBF4FB] px-4 py-2.5 text-center">
              <span className="text-[#184087] font-bold text-sm">{faskes}</span>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#184087] shrink-0 mt-0.5" strokeWidth={1.8} />
                <span className="text-gray-500 text-xs w-16 shrink-0">Alamat</span>
                <span className="text-gray-700 text-xs text-right flex-1">Jl. Kaharuddin NST No.183</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                <span className="text-gray-500 text-xs w-16 shrink-0">Telepon</span>
                <span className="text-gray-700 text-xs text-right flex-1">082170678552</span>
              </div>
            </div>
          </div>
          {tutorialStep === 1 && (
            <TutorialPopup
              title="Faskes Tingkat Pertama"
              desc="Sistem akan menampilkan fasilitas kesehatan tingkat pertama (FKTP) tempat Anda terdaftar beserta informasi alamat dan kontak fasilitas kesehatan."
              visual={
                <div className="border-2 border-[#184087] rounded-xl bg-white overflow-hidden">
                  <div className="bg-[#EBF4FB] px-4 py-2.5 text-center">
                    <span className="text-[#184087] font-bold text-sm">{faskes}</span>
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#184087] shrink-0 mt-0.5" strokeWidth={1.8} />
                      <span className="text-gray-500 text-xs w-16 shrink-0">Alamat</span>
                      <span className="text-gray-700 text-xs text-right flex-1">Jl. Kaharuddin NST No.183</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                      <span className="text-gray-500 text-xs w-16 shrink-0">Telepon</span>
                      <span className="text-gray-700 text-xs text-right flex-1">082170678552</span>
                    </div>
                  </div>
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Pilih Poli */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 2 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Pilih Poli</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Tentukan jenis layanan atau poli yang ingin dituju.</p>}
          <div className="relative mt-1">
            <button
              onClick={() => tutorialStep === null && toggleDrop("poli")}
              className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors"
            >
              <span>{poli}</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "poli" ? "rotate-180" : ""}`} />
            </button>
            {openDrop === "poli" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {poliList.map((p) => (
                  <button key={p} onClick={() => { setPoli(p); setOpenDrop(null); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${p === poli ? "text-[#184087] font-semibold" : "text-gray-700"}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          {tutorialStep === 2 && (
            <TutorialPopup
              title="Pilih Poli"
              desc="Pilih poli atau layanan kesehatan sesuai kebutuhan pemeriksaan Anda agar antrean dapat diproses dengan tepat."
              visual={
                <div className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors">
                  <span>Poli Umum</span>
                  <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Pilih Tanggal */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 3 ? "z-40" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Pilih Tanggal Daftar</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih tanggal kunjungan sesuai keinginan Anda.</p>}
          <div className="relative mt-1">
            <button
              onClick={() => tutorialStep === null && toggleDrop("tanggal")}
              className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors"
            >
              <span>{tanggal}</span>
              <ChevronDown className={`w-5 h-5 text-[#184087] transition-transform shrink-0 ${openDrop === "tanggal" ? "rotate-180" : ""}`} />
            </button>
            {openDrop === "tanggal" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                {tanggalList.map((t) => (
                  <button key={t} onClick={() => { setTanggal(t); setOpenDrop(null); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 ${t === tanggal ? "text-[#184087] font-semibold" : "text-gray-700"}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          {tutorialStep === 3 && (
            <TutorialPopup
              title="Pilih Tanggal Daftar"
              desc="Tentukan tanggal pelayanan sesuai jadwal yang tersedia untuk melakukan pemeriksaan di fasilitas kesehatan."
              visual={
                <div className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 font-medium bg-white transition-colors">
                  <span>Hari ini (28-04-2026)</span>
                  <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Pilih Jadwal dan Tenaga Medis */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 4 ? "z-40" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Pilih Jadwal dan Tenaga Medis</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih jadwal dengan tenaga medis yang tersedia</p>}
          <button
            onClick={() => { if (tutorialStep === null) { setShowTenagaSheet(true); setTenagaError(false); } }}
            className={`w-full flex items-center justify-between border-2 rounded-xl px-4 py-3 text-sm font-medium bg-white mt-1 transition-colors ${tenagaError ? "border-[#E05555]" : "border-gray-300 focus:border-[#184087]"}`}
          >
            <span className={tenagaMedis ? "text-gray-700" : (tenagaError ? "text-[#E05555]" : "text-gray-400")}>
              {tenagaMedis ?? "Pilih Tenaga Medis"}
            </span>
            <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
          </button>
          {tenagaError && <p className="text-[#E05555] text-xs mt-1">Pilih jadwal dan tenaga medis terlebih dahulu.</p>}
          {tutorialStep === 4 && (
            <TutorialPopup
              title="Pilih Jadwal dan Tenaga Medis"
              desc="Pilih jadwal praktik dan tenaga medis yang tersedia sesuai kebutuhan pelayanan Anda."
              visual={
                <div className="w-full flex items-center justify-between border-2 border-[#184087] rounded-xl px-4 py-3 text-sm font-medium bg-white">
                  <span className="text-gray-400">Pilih Tenaga Medis</span>
                  <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Keluhan */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 5 ? "z-40" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Keluhan</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Isi keluhan atau alasan berobat secara singkat.</p>}
          <textarea
            value={keluhan}
            onChange={(e) => setKeluhan(e.target.value)}
            rows={4}
            className="mt-1 w-full border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-white resize-none transition-colors"
          />
          {tutorialStep === 5 && (
            <TutorialPopup
              title="Keluhan"
              desc="Tuliskan keluhan atau alasan kunjungan secara singkat untuk membantu proses pelayanan di fasilitas kesehatan."
              visual={
                <div className="w-full border-2 border-[#184087] rounded-xl px-4 py-3 text-sm text-gray-400 bg-white h-20">
                  Contoh: sakit kepala, demam...
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Simpan */}
        <button
          onClick={() => {
            if (!tenagaMedis) {
              recordError();
              setTenagaError(true);
              return;
            }
            const uid = localStorage.getItem("jkn_user_id");
            if (uid) {
              localStorage.removeItem(`jkn_checkin_done_${uid}`);
              localStorage.setItem(`jkn_antrean_faskes_${uid}`, JSON.stringify({
                peserta, poli, tanggal, tenagaMedis, keluhan,
                faskes,
                nomorAntrean: "14",
                estimasi: "09:30",
                kodeBook: "2348405734898",
              }));
            }
            const duration = Math.floor((Date.now() - taskStartRef.current) / 1000);
            taskCompletedRef.current = true;
            recordTaskCompletion(true, duration);
            router.push("/antrean/tiket");
          }}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl mt-2"
        >
          Simpan
        </button>
      </div>


      {/* Dim overlay saat tutorial aktif */}
      {tutorialStep !== null && (
        <div className="absolute inset-0 bg-black/40 z-[4] pointer-events-none" />
      )}

      {/* Bottom sheet: Daftar Tenaga Medis */}
      {showTenagaSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-[430px] mx-auto">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTenagaSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4 animate-slide-up max-h-[70%] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-1" />
            <div className="relative flex items-center justify-center">
              <h2 className="text-[#184087] font-bold text-base text-center">Daftar Tenaga Medis</h2>
              <button onClick={() => setShowTenagaSheet(false)} className="absolute right-0">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {tenagaMedisList.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setTenagaMedis(`${t.nama} (${t.jam})`); setShowTenagaSheet(false); }}
                  className="bg-gray-50 rounded-2xl p-4 flex flex-col gap-3 text-left active:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-gray-900 font-bold text-base">{t.nama}</span>
                    <span className="bg-[#46ADDC] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{t.jam}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Antrean Diambil", sub: "Jumlah antrean yang sudah ditangani dokter", val: t.diambil, color: "bg-[#009B4D]" },
                      { label: "Sisa Antrean", sub: "Jumlah antrean yang belum ditangani dokter", val: t.sisa, color: "bg-[#E05555]" },
                      { label: "Antrean Panggil", sub: "Nomor antrean yang sedang ditangani dokter", val: t.panggil, color: "bg-[#46ADDC]" },
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
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



