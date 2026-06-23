"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight, CalendarDays, X } from "lucide-react";
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

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const tenagaMedisList = [
  { nama: "Kevin Yang", jam: "08:45 - 15:00", diambil: 11, sisa: 2, panggil: 12 },
  { nama: "Kevin Yang", jam: "08:45 - 15:00", diambil: 11, sisa: 2, panggil: 12 },
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const cells: { day: number; curr: boolean }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, curr: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, curr: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, curr: false });
  return cells;
}

const RUJUKAN_DATE = new Date(2026, 4, 1); // 1 Mei 2026 â€” tanggal surat rujukan diterbitkan
const MAX_DATE = new Date(RUJUKAN_DATE.getTime() + 89 * 24 * 60 * 60 * 1000); // +90 hari (hari ke-90)

export default function IsiDataRujukanPage() {
  useRequireAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const noRujukan = searchParams.get("noRujukan") ?? "0224465768859324";
  const today = new Date();
  const { userLevel, recordTutorial } = useUserLevel();
  const [tutorialStep, setTutorialStep] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    if (userLevel === "pemula") setTutorialStep(0);
  }, [userLevel]);

  const skipTutorial = () => { recordTutorial(); setTutorialStep(null); };
  const nextTutorial = () => {
    recordTutorial();
    if (tutorialStep !== null && tutorialStep < 2) setTutorialStep(tutorialStep + 1);
    else setTutorialStep(null);
  };
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const [showTenagaSheet, setShowTenagaSheet] = useState(false);
  const [tenagaMedis, setTenagaMedis] = useState<string | null>(null);

  const cells = getCalendarDays(calYear, calMonth);

  const formatDate = (d: { day: number; month: number; year: number }) =>
    `${d.day} ${MONTHS[d.month]} ${d.year}`;

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-6 pt-6">
          <button
            type="button"
            onClick={() => { if (tutorialStep !== null) { setTutorialStep(null); router.push("/antrean/rujukan?skipTutorial=true"); } else setShowWarning(true); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center z-10"
          >
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold text-base leading-tight">RS Awal Bros</h1>
            <p className="text-white/80 text-xs mt-0.5">0224465768859324</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Step indicator */}
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
            <div className="w-8 h-8 rounded-full bg-[#009B4D] flex items-center justify-center text-white font-bold text-sm">2</div>
            <span className="text-[10px] text-gray-600 font-medium text-center leading-tight">Isi Data</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mb-4" />
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 font-bold text-sm">3</div>
            <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">Lihat Tiket<br />Antrean</span>
          </div>
        </div>

        {/* No. Rujukan */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 0 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">No. Rujukan</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Nomor rujukan yang diberikan dari fasilitas kesehatan sebelumnya.</p>}
          <div className="border-2 border-[#184087] rounded-xl px-4 py-3 bg-white mt-1">
            <span className="text-gray-700 text-sm">0224465768859324</span>
          </div>
          {tutorialStep === 0 && (
            <TutorialPopup
              title="No. Rujukan"
              desc="Pastikan nomor rujukan sesuai. Nomor rujukan akan terisi otomatis berdasarkan data rujukan yang dipilih."
              visual={
                <div className="border-2 border-[#184087] rounded-xl px-4 py-3 bg-white">
                  <span className="text-gray-700 text-sm">0224465768859324</span>
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Tanggal Rencana Kunjungan */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 1 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Tanggal Rencana Kunjungan</h2>
          {userLevel === "pemula" ? (
            <p className="text-gray-500 text-xs leading-relaxed">
              Tanggal rencana datang untuk berobat ke faskes rujukan. Pilih tanggal dalam rentang waktu hari pertama surat rujukan diberikan hingga <span className="font-bold">90 hari</span> ke depan.
            </p>
          ) : (
            <p className="text-gray-500 text-xs">Maksimal 90 hari sejak surat rujukan diterbitkan.</p>
          )}
          <button
            onClick={() => tutorialStep === null && setCalOpen(true)}
            className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 bg-white mt-1 transition-colors"
          >
            <span className={`text-sm ${selectedDate ? "text-gray-700" : "text-gray-400"}`}>
              {selectedDate ? formatDate(selectedDate) : "Pilih Tanggal"}
            </span>
            <CalendarDays className="w-5 h-5 text-[#184087] shrink-0" strokeWidth={1.8} />
          </button>
          {tutorialStep === 1 && (
            <TutorialPopup
              title="Tanggal Rencana Kunjungan"
              desc="Tentukan tanggal rencana datang untuk berobat ke faskes rujukan. Pilih tanggal dalam rentang waktu hari pertama surat rujukan diberikan hingga 90 hari ke depan."
              visual={
                <div className="w-full flex items-center justify-between border-2 border-[#184087] rounded-xl px-4 py-3 bg-white">
                  <span className="text-sm text-gray-400">Pilih Tanggal</span>
                  <CalendarDays className="w-5 h-5 text-[#184087] shrink-0" strokeWidth={1.8} />
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        {/* Pilih Jadwal dan Tenaga Medis */}
        <div className={`relative flex flex-col gap-1.5 ${tutorialStep === 2 ? "z-[5]" : ""}`}>
          <h2 className="text-[#184087] font-bold text-sm">Pilih Jadwal dan Tenaga Medis</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Pilih jadwal dengan tenaga medis yang tersedia</p>}
          <button
            onClick={() => tutorialStep === null && setShowTenagaSheet(true)}
            className="w-full flex items-center justify-between border-2 border-gray-300 focus:border-[#184087] rounded-xl px-4 py-3 bg-white mt-1 transition-colors"
          >
            <span className={`text-sm ${tenagaMedis ? "text-gray-700" : "text-gray-400"}`}>
              {tenagaMedis ?? "Pilih Jadwal dan Tenaga Medis"}
            </span>
            <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
          </button>
          {tutorialStep === 2 && (
            <TutorialPopup
              title="Pilih Jadwal dan Tenaga Medis"
              desc="Pilih jadwal pelayanan dan tenaga medis yang tersedia sesuai kebutuhan pelayanan Anda."
              visual={
                <div className="w-full flex items-center justify-between border-2 border-[#184087] rounded-xl px-4 py-3 bg-white">
                  <span className="text-sm text-gray-400">Pilih Jadwal dan Tenaga Medis</span>
                  <ChevronDown className="w-5 h-5 text-[#184087] shrink-0" />
                </div>
              }
              onSkip={skipTutorial}
              onNext={nextTutorial}
            />
          )}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => {
            const uid = localStorage.getItem("jkn_user_id");
            if (uid) {
              localStorage.removeItem(`jkn_checkin_done_${uid}`);
              localStorage.setItem(`jkn_antrean_rujukan_${uid}_${noRujukan}`, JSON.stringify({
                noRujukan,
                rs: "RS Awal Bros",
                tanggal: selectedDate ? formatDate(selectedDate) : "-",
                tenagaMedis: tenagaMedis ?? "-",
                nomorAntrean: "14",
                estimasi: "09:30",
                kodeBook: "2348405734898",
              }));
            }
            router.push(`/antrean/rujukan/tiket?noRujukan=${noRujukan}`);
          }}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
        >
          Simpan
        </button>
      </div>

      {/* Dim overlay saat tutorial aktif */}
      {tutorialStep !== null && (
        <div className="absolute inset-0 bg-black/40 z-[4] pointer-events-none" />
      )}

      {/* Calendar Modal */}
      {calOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-black/40">
          <div className="bg-white rounded-2xl p-5 w-full shadow-xl">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <span className="font-bold text-base text-gray-900">{MONTHS[calMonth]}</span>
              <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-gray-400 text-xs font-medium py-1">{d}</div>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((cell, i) => {
                const isToday = cell.curr && cell.day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                const isSelected = cell.curr && selectedDate?.day === cell.day && selectedDate?.month === calMonth && selectedDate?.year === calYear;
                const isMax = cell.curr && cell.day === MAX_DATE.getDate() && calMonth === MAX_DATE.getMonth() && calYear === MAX_DATE.getFullYear();
                return (
                  <button
                    key={i}
                    onClick={() => { if (cell.curr) { setSelectedDate({ day: cell.day, month: calMonth, year: calYear }); setCalOpen(false); }}}
                    className={`h-9 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                      ${!cell.curr ? "text-gray-300" : ""}
                      ${cell.curr && !isToday && !isSelected && !isMax ? "text-gray-800 hover:bg-gray-100" : ""}
                      ${isToday && !isSelected ? "border-2 border-[#46ADDC] text-[#46ADDC]" : ""}
                      ${isMax && !isSelected ? "bg-[#E05555]/10 text-[#E05555] font-bold" : ""}
                      ${isSelected ? "bg-[#46ADDC] text-white" : ""}
                    `}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
            {/* Legenda */}
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
              <div className="w-3 h-3 rounded-sm bg-[#E05555]/10 border border-[#E05555]/30 shrink-0" />
              <span className="text-[10px] text-gray-500">Batas maksimal kunjungan (90 hari)</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet: Daftar Tenaga Medis */}
      {showTenagaSheet && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTenagaSheet(false)} />
          <div className="relative bg-white rounded-t-3xl px-5 pt-5 pb-8 flex flex-col gap-4 animate-slide-up max-h-[70%] overflow-y-auto no-scrollbar">
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

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Apakah Anda yakin ingin meninggalkan halaman ini?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Perubahan yang Anda buat akan tidak tersimpan dan akan kembali pada halaman sebelumnya
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button
                type="button"
                onClick={() => router.push("/antrean/rujukan?skipTutorial=true")}
                className="flex-1 bg-[#E05555] text-white font-bold text-sm py-3 rounded-full"
              >
                Keluar
              </button>
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full"
              >
                Lanjut Proses
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




