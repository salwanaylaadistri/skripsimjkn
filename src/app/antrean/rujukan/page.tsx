"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight, Building2, Stethoscope, Calendar } from "lucide-react";
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

const pesertaDummy = "Farah Adillah (0128056381133)";

const rujukanList = [
  { rs: "RS Awal Bros", noRujukan: "0224465768859324", rujukan: "FKTP", poli: "Mata", tanggal: "1 Mei 2026" },
  { rs: "RS Awal Bros", noRujukan: "0224465768859324", rujukan: "FKTP", poli: "Mata", tanggal: "1 Mei 2026" },
  { rs: "RS Awal Bros", noRujukan: "0224465768859324", rujukan: "FKTP", poli: "Mata", tanggal: "1 Mei 2026" },
  { rs: "RS Awal Bros", noRujukan: "0224465768859324", rujukan: "FKTP", poli: "Mata", tanggal: "1 Mei 2026" },
];

export default function AntreanRujukanPage() {
  useRequireAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pesertaList, setPesertaList] = useState<string[]>([pesertaDummy]);
  const [peserta, setPeserta] = useState("");
  useEffect(() => {
    const nama = localStorage.getItem("jkn_user_nama") ?? "Pengguna";
    const nik  = localStorage.getItem("jkn_nik") ?? "-";
    const utama = `${nama} (${nik})`;
    setPesertaList([utama, pesertaDummy]);
    setPeserta(utama);
  }, []);
  const router = useRouter();
  const { userLevel, recordTutorial, recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("antrean"); }, []);
  const searchParams = useSearchParams();
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);

  useEffect(() => {
    if (userLevel === "pemula" && searchParams.get("skipTutorial") !== "true") setTutorialStep(0);
  }, [userLevel, searchParams]);

  const skipTutorial = () => { recordTutorial(); setTutorialStep(null); };
  const nextTutorial = () => {
    recordTutorial();
    if (tutorialStep !== null && tutorialStep < 1) setTutorialStep(tutorialStep + 1);
    else setTutorialStep(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <Link href="/" className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="text-white font-bold text-lg text-center leading-tight px-10">
            Antrean Fasilitas Kesehatan<br />Tingkat Lanjut
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center text-white font-bold text-sm">1</div>
            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">Pilih<br />Rujukan</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-sm">2</div>
            <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">Isi Data</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-sm">3</div>
            <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">Lihat Tiket<br />Antrean</span>
          </div>
        </div>

        {/* Peserta */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 0 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Peserta</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih data peserta yang akan didaftarkan untuk layanan kesehatan.</p>}
          <div className="relative mt-1">
            <button
              onClick={() => tutorialStep === null && setDropdownOpen(!dropdownOpen)}
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

        {/* Info teks */}
        {userLevel === "pemula" && (
          <p className="text-gray-600 text-xs leading-relaxed -mt-2">
            Berikut daftar rujukan yang Anda miliki. Silahkan daftar antrean sesuai dengan rujukan yang akan Anda lakukan.
          </p>
        )}

        {/* Daftar Rujukan */}
        <div className="flex flex-col gap-4">
          {rujukanList.map((item, i) => (
            <div key={i} className={`relative bg-white rounded-2xl shadow-sm ${tutorialStep === 1 && i === 0 ? "z-[25]" : "overflow-hidden"}`}>
              {/* Header card */}
              <div className="px-4 pt-4 pb-2 border-b border-gray-100 text-center">
                <p className="text-gray-900 font-bold text-sm">{item.rs}</p>
                <p className="text-gray-400 text-xs mt-0.5">No. Rujukan: {item.noRujukan}</p>
              </div>

              {/* Info rows */}
              <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-500 text-xs">Rujukan</span>
                  </div>
                  <span className="text-gray-700 text-xs font-medium pr-1">{item.rujukan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-500 text-xs">Poli</span>
                  </div>
                  <span className="text-gray-700 text-xs font-medium pr-1">{item.poli}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#184087] shrink-0" strokeWidth={1.8} />
                    <span className="text-gray-500 text-xs">Tanggal Dirujuk</span>
                  </div>
                  <span className="text-gray-700 text-xs font-medium pr-1">{item.tanggal}</span>
                </div>
              </div>

              {/* Daftar Antrean button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => tutorialStep === null && router.push("/antrean/rujukan/isi-data")}
                  className="w-full bg-[#009B4D] text-white font-bold text-sm py-3 rounded-xl"
                >
                  Daftar Antrean
                </button>
              </div>

              {tutorialStep === 1 && i === 0 && (
                <TutorialPopup
                  title="Pilih Rujukan"
                  desc="Berikut daftar rujukan yang Anda miliki. Pilih rujukan yang sesuai lalu tekan tombol 'Daftar Antrean' untuk melanjutkan proses pendaftaran."
                  visual={
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-4 pt-3 pb-2 border-b border-gray-100 text-center">
                        <p className="text-gray-900 font-bold text-sm">{item.rs}</p>
                        <p className="text-gray-400 text-xs mt-0.5">No. Rujukan: {item.noRujukan}</p>
                      </div>
                      <div className="px-4 py-2 flex flex-col gap-1.5">
                        {[
                          { icon: <Building2 className="w-4 h-4 text-[#184087]" strokeWidth={1.8} />, label: "Rujukan", val: item.rujukan },
                          { icon: <Stethoscope className="w-4 h-4 text-[#184087]" strokeWidth={1.8} />, label: "Poli", val: item.poli },
                          { icon: <Calendar className="w-4 h-4 text-[#184087]" strokeWidth={1.8} />, label: "Tanggal Dirujuk", val: item.tanggal },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">{row.icon}<span className="text-gray-500 text-xs">{row.label}</span></div>
                            <span className="text-gray-700 text-xs font-medium">{row.val}</span>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 pb-3">
                        <div className="w-full bg-[#009B4D] text-white font-bold text-sm py-2.5 rounded-xl text-center">Daftar Antrean</div>
                      </div>
                    </div>
                  }
                  onSkip={skipTutorial}
                  onNext={nextTutorial}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dim overlay saat tutorial aktif */}
      {tutorialStep !== null && (
        <div className="absolute inset-0 bg-black/40 z-[4] pointer-events-none" />
      )}
    </div>
  );
}



