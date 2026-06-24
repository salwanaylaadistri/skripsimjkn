"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export default function DebugPage() {
  const router = useRouter();
  const [interactionData, setInteractionData] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [sessionCount, setSessionCount] = useState<string>("");
  const [sessionSent, setSessionSent] = useState<string>("");
  const [currentSession, setCurrentSession] = useState<string>("");
  const [logs, setLogs] = useState<unknown[]>([]);
  const [researchLogs, setResearchLogs] = useState<{ total: number; pemula: number; mahir: number; data: unknown[] } | null>(null);
  const [abLogs, setAbLogs] = useState<{ total: number; grup_a: number; grup_b: number; data: unknown[] } | null>(null);
  const [saveLabel, setSaveLabel] = useState<"pemula" | "mahir">("pemula");
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [resetCountDone, setResetCountDone] = useState(false);
  const [injectStatus, setInjectStatus] = useState<string>("");

  const refresh = () => {
    setUserId(localStorage.getItem("jkn_user_id") ?? "null");
    setSessionCount(localStorage.getItem("jkn_session_count") ?? "null");
    setInteractionData(localStorage.getItem("jkn_interaction_data") ?? "null");
    setSessionSent(sessionStorage.getItem("jkn_session_sent") ?? "null");
    setCurrentSession(sessionStorage.getItem("jkn_current_session") ?? "null");
  };

  useEffect(() => { refresh(); }, []);

  const resetSesi = () => {
    sessionStorage.removeItem("jkn_session_sent");
    sessionStorage.removeItem("jkn_current_session");
    refresh();
    window.dispatchEvent(new Event("jkn_login"));
    router.push("/");
  };

  const resetSessionCount = () => {
    localStorage.setItem("jkn_session_count", "0");
    sessionStorage.removeItem("jkn_current_session");
    refresh();
    setResetCountDone(true);
    setTimeout(() => setResetCountDone(false), 3000);
  };

  const injectFromResearch = async () => {
    const uid = localStorage.getItem("jkn_user_id");
    if (!uid) { setInjectStatus("Tidak ada user yang login."); return; }
    setInjectStatus("Mengambil data...");
    try {
      const res = await fetch(`${BACKEND_URL}/research/by-user/${uid}`);
      if (!res.ok) { setInjectStatus("Data research tidak ditemukan untuk akun ini."); return; }
      const d = await res.json();
      const snapshot = {
        userId: uid,
        sessionCount:          d.session_count,
        sessionDuration:       d.session_duration,
        uniqueFeatureAccessed: d.unique_feature_accessed,
        featureFrequency:      { antrean: d.freq_antrean, riwayat: d.freq_riwayat, perubahan_data: d.freq_perubahan_data },
        taskCompletionRate:    d.task_completion_rate,
        taskTime:              d.task_time,
        errorCount:            d.error_count,
        tutorialAccessed:      d.tutorial_accessed,
        shortcutUsed:          d.shortcut_used,
        freqAntrean:           d.freq_antrean,
        freqRiwayat:           d.freq_riwayat,
        freqPerubahanData:     d.freq_perubahan_data,
        taskAttempted:         0,
        taskCompleted:         0,
        taskTimeTotal:         0,
      };
      localStorage.setItem(`jkn_interaction_data_${uid}`, JSON.stringify(snapshot));
      localStorage.setItem("jkn_owner_id", uid);
      refresh();
      window.dispatchEvent(new Event("jkn_login"));
      setInjectStatus(`Berhasil inject data research (label: ${d.label}) ke jkn_interaction_data_${uid}.`);
    } catch {
      setInjectStatus("Tidak dapat terhubung ke server.");
    }
  };

  const fetchLogs = async () => {
    const res = await fetch(`${BACKEND_URL}/interaction`);
    const data = await res.json();
    setLogs(data.data.slice(0, 5));
  };

  const fetchResearchLogs = async () => {
    const res = await fetch(`${BACKEND_URL}/research`);
    const data = await res.json();
    setResearchLogs(data);
  };

  const fetchAbLogs = async () => {
    const res = await fetch(`${BACKEND_URL}/ab-test`);
    const data = await res.json();
    setAbLogs(data);
  };

  const deleteAbLog = async (id: number) => {
    await fetch(`${BACKEND_URL}/ab-test/${id}`, { method: "DELETE" });
    fetchAbLogs();
  };

  const deleteAllAbLogs = async () => {
    if (!confirm("Hapus SEMUA data A/B test? Tidak bisa dikembalikan.")) return;
    await fetch(`${BACKEND_URL}/ab-test`, { method: "DELETE" });
    fetchAbLogs();
  };

  const saveToResearch = async () => {
    const stored = localStorage.getItem("jkn_interaction_data");
    const uid = localStorage.getItem("jkn_user_id");
    const cnt = localStorage.getItem("jkn_session_count");
    if (!stored) { setSaveStatus("Tidak ada data interaksi di localStorage."); return; }
    const d = JSON.parse(stored);
    const totalFreq = Object.values(d.featureFrequency as Record<string, number>).reduce((a, b) => a + b, 0);
    setSaveStatus("Menyimpan...");
    try {
      const res = await fetch(`${BACKEND_URL}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:                 uid ? parseInt(uid) : null,
          label:                   saveLabel,
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
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setSaveStatus(`Tersimpan ke research_logs (ID: ${result.id}) sebagai ${saveLabel}.`);
        fetchResearchLogs();
      } else {
        setSaveStatus(`Gagal: ${result.detail}`);
      }
    } catch {
      setSaveStatus("Tidak dapat terhubung ke server.");
    }
  };

  const deleteResearchLog = async (id: number) => {
    await fetch(`${BACKEND_URL}/research/${id}`, { method: "DELETE" });
    fetchResearchLogs();
  };

  const fields = [
    { label: "user_id (localStorage)", value: userId, ok: userId !== "null" },
    { label: "session_count (localStorage)", value: sessionCount, ok: sessionCount !== "null" },
    { label: "jkn_session_sent (sessionStorage)", value: sessionSent, ok: sessionSent === "null" },
    { label: "jkn_current_session (sessionStorage)", value: currentSession, ok: currentSession !== "null" },
    { label: "interaction_data (localStorage)", value: interactionData.length > 80 ? interactionData.slice(0, 80) + "..." : interactionData, ok: interactionData !== "null" && interactionData !== "" },
  ];

  return (
    <div className="p-4 flex flex-col gap-4 bg-gray-50 min-h-full text-sm">
      <h1 className="font-bold text-lg text-[#184087]">Debug Panel</h1>

      {/* Status storage */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-700">Status Storage</h2>
          <button onClick={refresh} className="text-xs text-[#46ADDC] underline">Refresh</button>
        </div>
        {fields.map(f => (
          <div key={f.label} className="flex flex-col gap-0.5 border-b border-gray-100 pb-2 last:border-0">
            <span className="text-gray-400 text-[10px]">{f.label}</span>
            <div className="flex items-start gap-2">
              <span className={`text-xs font-mono break-all flex-1 ${f.ok ? "text-green-600" : "text-red-500"}`}>
                {f.value}
              </span>
              <span className="text-base">{f.ok ? "OK" : "!"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tombol reset sesi */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <h2 className="font-bold text-gray-700">Reset Sesi Testing</h2>
        <p className="text-xs text-gray-500">
          Tekan ini sebelum mulai sesi testing baru. Sesi lama dihapus dan diarahkan ke beranda.
        </p>
        <button onClick={resetSesi} className="w-full bg-[#184087] text-white font-bold py-3 rounded-xl text-sm">
          Reset Sesi ke Beranda
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Khusus pengambilan data: reset session_count ke 0 agar tiap akun mulai dari sesi pertama.
        </p>
        <button onClick={resetSessionCount} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl text-sm">
          Reset Session Count ke 0
        </button>
        {resetCountDone && (
          <p className="text-center text-green-600 font-semibold text-sm">✓ Session count berhasil direset ke 0</p>
        )}
      </div>

      {/* Inject Data dari Research Logs */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm border-2 border-[#009B4D]">
        <h2 className="font-bold text-[#009B4D]">Inject Data dari Research Logs</h2>
        <p className="text-xs text-gray-500">
          Ambil data interaksi akun ini dari research_logs dan simpan ke localStorage agar predict bisa jalan tanpa ulang skenario.
        </p>
        <button onClick={injectFromResearch} className="w-full bg-[#009B4D] text-white font-bold py-3 rounded-xl text-sm">
          Inject Data Akun {userId !== "null" ? userId : "?"}
        </button>
        {injectStatus && (
          <p className={`text-xs text-center font-medium ${injectStatus.startsWith("Berhasil") ? "text-green-600" : "text-red-500"}`}>
            {injectStatus}
          </p>
        )}
      </div>

      {/* Simpan ke Research Logs */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-sm border-2 border-[#46ADDC]">
        <h2 className="font-bold text-[#184087]">Simpan Sesi ke Research Data</h2>
        <p className="text-xs text-gray-500">
          Setelah selesai satu skenario, pilih label lalu tekan Simpan. Data interaksi sesi ini akan masuk ke tabel <b>research_logs</b>.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setSaveLabel("pemula")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${saveLabel === "pemula" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-500 border-orange-300"}`}
          >
            Pemula
          </button>
          <button
            onClick={() => setSaveLabel("mahir")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-colors ${saveLabel === "mahir" ? "bg-[#184087] text-white border-[#184087]" : "bg-white text-[#184087] border-[#184087]/30"}`}
          >
            Mahir
          </button>
        </div>
        <button
          onClick={saveToResearch}
          className="w-full bg-[#46ADDC] text-white font-bold py-3 rounded-xl text-sm"
        >
          Simpan Sesi Ini sebagai {saveLabel.toUpperCase()}
        </button>
        {saveStatus && (
          <p className={`text-xs text-center font-medium ${saveStatus.startsWith("Tersimpan") ? "text-green-600" : "text-red-500"}`}>
            {saveStatus}
          </p>
        )}
      </div>

      {/* Research Logs */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-700">Research Logs</h2>
          <button onClick={fetchResearchLogs} className="text-xs bg-[#184087] text-white px-3 py-1 rounded-lg">Muat</button>
        </div>
        {researchLogs && (
          <div className="flex gap-2 text-xs mb-1">
            <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600">Total: <b>{researchLogs.total}</b></span>
            <span className="bg-orange-100 px-2 py-1 rounded-lg text-orange-600">Pemula: <b>{researchLogs.pemula}</b></span>
            <span className="bg-blue-100 px-2 py-1 rounded-lg text-[#184087]">Mahir: <b>{researchLogs.mahir}</b></span>
          </div>
        )}
        {!researchLogs && <p className="text-xs text-gray-400">Tekan "Muat" untuk lihat data research.</p>}
        {researchLogs?.data.map((log: unknown) => {
          const l = log as Record<string, unknown>;
          return (
            <div key={String(l.id)} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>ID: {String(l.id)} | user_id: {String(l.user_id)}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-white text-[10px] ${l.label === "pemula" ? "bg-orange-500" : "bg-[#184087]"}`}>
                    {String(l.label)}
                  </span>
                  <button onClick={() => deleteResearchLog(l.id as number)} className="text-red-400 text-[10px] underline">
                    Hapus
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 mt-1">
                {[
                  ["durasi", `${l.session_duration}s`],
                  ["error", String(l.error_count)],
                  ["tutorial", String(l.tutorial_accessed)],
                  ["shortcut", String(l.shortcut_used)],
                  ["antrean", String(l.freq_antrean)],
                  ["riwayat", String(l.freq_riwayat)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* A/B Test Logs */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-purple-700">A/B Test Logs</h2>
          <div className="flex gap-2">
            <button onClick={fetchAbLogs} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg">Muat</button>
            {abLogs && abLogs.total > 0 && (
              <button onClick={deleteAllAbLogs} className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg">Hapus Semua</button>
            )}
          </div>
        </div>
        {abLogs && (
          <div className="flex gap-2 text-xs mb-1 flex-wrap">
            <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600">Total: <b>{abLogs.total}</b></span>
            <span className="bg-green-100 px-2 py-1 rounded-lg text-green-700">Grup A (Adaptif): <b>{abLogs.grup_a}</b></span>
            <span className="bg-blue-100 px-2 py-1 rounded-lg text-[#184087]">Grup B (Statis): <b>{abLogs.grup_b}</b></span>
          </div>
        )}
        {!abLogs && <p className="text-xs text-gray-400">Tekan "Muat" untuk lihat data A/B testing.</p>}
        {abLogs?.data.map((log: unknown) => {
          const l = log as Record<string, unknown>;
          return (
            <div key={String(l.id)} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>ID: {String(l.id)} | user: {String(l.user_id)}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-white text-[10px] ${l.grup === "A" ? "bg-green-600" : "bg-[#184087]"}`}>
                    Grup {String(l.grup)}
                  </span>
                  <button onClick={() => deleteAbLog(l.id as number)} className="text-red-400 text-[10px] underline">Hapus</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-0.5 mt-1">
                {[
                  ["durasi", `${l.session_duration}s`],
                  ["sesi ke-", String(l.session_count)],
                  ["tutorial", String(l.tutorial_accessed)],
                  ["shortcut", String(l.shortcut_used)],
                  ["antrean", String(l.freq_antrean)],
                  ["riwayat", String(l.freq_riwayat)],
                  ["ubah data", String(l.freq_perubahan_data)],
                  ["task done", String(l.task_completion_rate)],
                  ["error", String(l.error_count)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5 log terakhir dari /interaction */}
      <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-700">5 Data Terakhir (/interaction)</h2>
          <button onClick={fetchLogs} className="text-xs bg-[#009B4D] text-white px-3 py-1 rounded-lg">Ambil</button>
        </div>
        {logs.length === 0 && <p className="text-xs text-gray-400">Tekan "Ambil" untuk muat data dari backend.</p>}
        {logs.map((log: unknown) => {
          const l = log as Record<string, unknown>;
          return (
            <div key={String(l.id)} className="border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>ID: {String(l.id)}</span>
                <span>user_id: {String(l.user_id)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1">
                {[
                  ["durasi", `${l.session_duration}s`],
                  ["sesi ke-", String(l.session_count)],
                  ["fitur unik", String(l.unique_feature_accessed)],
                  ["freq fitur", String(l.feature_frequency)],
                  ["tutorial", String(l.tutorial_accessed)],
                  ["shortcut", String(l.shortcut_used)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-gray-400">{k}</span>
                    <span className={`font-medium ${v === "0" ? "text-orange-400" : "text-gray-700"}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
