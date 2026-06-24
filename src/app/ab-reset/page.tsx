"use client";

import { useEffect, useState } from "react";

const KEEP_KEYS = ["jkn_user_id", "jkn_nik", "jkn_user_nama", "jkn_pin"];

function clearSession() {
  sessionStorage.clear();
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("jkn_") && !KEEP_KEYS.includes(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

function readSessionData(grup: string): Record<string, unknown> | null {
  const uid = localStorage.getItem("jkn_user_id");
  const cnt = localStorage.getItem("jkn_session_count");
  const stored = uid
    ? (localStorage.getItem(`jkn_interaction_data_${uid}`) ?? localStorage.getItem("jkn_interaction_data"))
    : localStorage.getItem("jkn_interaction_data");

  if (!stored || !uid) return null;

  const d = JSON.parse(stored);
  const totalFreq = Object.values(d.featureFrequency as Record<string, number>).reduce((a, b) => a + b, 0);
  return {
    user_id:                 parseInt(uid),
    grup,
    partisipan_ke:           0,
    session_count:           cnt ? parseInt(cnt) : 0,
    session_duration:        d.sessionDuration        ?? 0,
    unique_feature_accessed: d.uniqueFeatureAccessed  ?? 0,
    feature_frequency:       totalFreq                ?? 0,
    task_completion_rate:    d.taskCompletionRate     ?? 0,
    task_time:               d.taskTime               ?? 0,
    error_count:             d.errorCount             ?? 0,
    tutorial_accessed:       d.tutorialAccessed       ?? 0,
    shortcut_used:           d.shortcutUsed           ?? 0,
    freq_antrean:            d.freqAntrean            ?? 0,
    freq_riwayat:            d.freqRiwayat            ?? 0,
    freq_perubahan_data:     d.freqPerubahanData      ?? 0,
  };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function AbResetPage() {

  const [phase, setPhase] = useState<"loading" | "summary" | "done">("loading");
  const [targetGrup, setTargetGrup] = useState<"A" | "B">("A");
  const [nextGrup, setNextGrup] = useState<"A" | "B">("A");
  const [sessionData, setSessionData] = useState<Record<string, unknown> | null>(null);
  const [partisipanKe, setPartisipanKe] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const grup = params.get("grup") === "B" ? "B" : "A";
    const fromEnd = params.get("from") === "end";
    setTargetGrup(grup);

    if (fromEnd) {
      const data = readSessionData(grup);
      setSessionData(data);
      clearSession();
      setPhase("summary");
    } else {
      clearSession();
      setPhase("done");
      const dest = grup === "B" ? "/?adaptive=false" : "/";
      setTimeout(() => { window.location.href = dest; }, 1200);
    }
  }, []);

  const simpanData = async () => {
    if (!partisipanKe || parseInt(partisipanKe) < 1) {
      setSendError("Isi nomor partisipan dulu.");
      return;
    }
    if (!sessionData) {
      setSent(true);
      return;
    }
    setSending(true);
    setSendError("");
    try {
      const payload = { ...sessionData, partisipan_ke: parseInt(partisipanKe) };
      await fetch(`${BACKEND_URL}/ab-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSent(true);
    } catch {
      setSendError("Gagal kirim ke backend. Pastikan backend jalan.");
    } finally {
      setSending(false);
    }
  };

  const lanjutkanPartisipanBaru = () => {
    const dest = nextGrup === "B" ? "/?adaptive=false" : "/";
    if (nextGrup === "B") sessionStorage.setItem("jkn_adaptive", "false");
    window.location.href = dest;
  };

  // ─── Loading ───
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#184087] flex items-center justify-center">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
        <p className="text-[#184087] font-bold text-lg">Memuat data sesi...</p>
      </div>
    );
  }

  // ─── Ringkasan akhir sesi ───
  if (phase === "summary") {
    return (
      <div className="min-h-screen bg-gray-50 px-5 py-8 flex flex-col gap-5">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${sent ? "bg-[#009B4D]" : "bg-[#184087]"}`}>
            {sent ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </div>
          <div className="text-center">
            <p className="text-[#184087] font-bold text-lg">Sesi Selesai</p>
            <p className="text-gray-500 text-sm">
              Grup {targetGrup} ({targetGrup === "A" ? "Adaptif" : "Statis"})
            </p>
          </div>
        </div>

        {/* Ringkasan data */}
        {sessionData ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <p className="text-[#184087] font-bold text-sm">Ringkasan Data Sesi</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {[
                ["Durasi", `${sessionData.session_duration}s`],
                ["Sesi ke-", String(sessionData.session_count)],
                ["Fitur diakses", String(sessionData.unique_feature_accessed)],
                ["Tutorial", String(sessionData.tutorial_accessed)],
                ["Shortcut", String(sessionData.shortcut_used)],
                ["Error", String(sessionData.error_count)],
                ["Freq Antrean", String(sessionData.freq_antrean)],
                ["Freq Riwayat", String(sessionData.freq_riwayat)],
                ["Freq Ubah Data", String(sessionData.freq_perubahan_data)],
                ["Task completion", String(sessionData.task_completion_rate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs border-b border-gray-50 pb-1">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-semibold text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <p className="text-gray-400 text-sm">Tidak ada data interaksi di sesi ini</p>
          </div>
        )}

        {/* Input nomor partisipan + tombol simpan */}
        {!sent ? (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <p className="text-[#184087] font-bold text-sm">Simpan Data</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500">Partisipan ke-</label>
              <input
                type="number"
                min={1}
                value={partisipanKe}
                onChange={(e) => { setPartisipanKe(e.target.value); setSendError(""); }}
                placeholder="Contoh: 1, 2, 3, ..."
                className="border-2 border-gray-200 focus:border-[#184087] rounded-xl px-4 py-3 text-sm outline-none"
              />
              {sendError && <p className="text-red-500 text-xs">{sendError}</p>}
            </div>
            <button
              onClick={simpanData}
              disabled={sending}
              className="w-full bg-[#009B4D] text-white font-bold py-3.5 rounded-xl text-sm disabled:opacity-60"
            >
              {sending ? "Menyimpan..." : "Simpan & Kirim Data →"}
            </button>
          </div>
        ) : (
          <div className="bg-[#009B4D]/10 border border-[#009B4D]/30 rounded-2xl p-4 text-center">
            <p className="text-[#009B4D] font-bold text-sm">Data partisipan {partisipanKe} berhasil disimpan</p>
          </div>
        )}

        {/* Pilih grup partisipan berikutnya — hanya muncul setelah data tersimpan */}
        {sent && (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <p className="text-[#184087] font-bold text-sm">Partisipan Berikutnya — Pilih Grup</p>
            <div className="flex gap-2">
              <button
                onClick={() => setNextGrup("A")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${nextGrup === "A" ? "bg-[#009B4D] text-white border-[#009B4D]" : "bg-white text-[#009B4D] border-[#009B4D]/40"}`}
              >
                Grup A — Adaptif
              </button>
              <button
                onClick={() => setNextGrup("B")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-colors ${nextGrup === "B" ? "bg-[#184087] text-white border-[#184087]" : "bg-white text-[#184087] border-[#184087]/40"}`}
              >
                Grup B — Statis
              </button>
            </div>
            <button
              onClick={lanjutkanPartisipanBaru}
              className="w-full bg-[#184087] text-white font-bold py-3.5 rounded-xl text-sm"
            >
              Mulai Sesi Berikutnya →
            </button>
          </div>
        )}

        <a href="/debug" className="text-center text-[#46ADDC] text-sm underline">
          Lihat semua data di Debug Panel
        </a>
      </div>
    );
  }

  // ─── Done (mode awal sesi, sedang redirect) ───
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <div className="w-16 h-16 rounded-full bg-[#184087] flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[#184087] font-bold text-lg">Sesi direset</p>
        <p className="text-gray-500 text-sm">Mengarahkan ke Grup {targetGrup}...</p>
      </div>
    </div>
  );
}
