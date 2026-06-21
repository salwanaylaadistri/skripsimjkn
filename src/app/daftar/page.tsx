﻿"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCw, MessageSquare, CalendarDays } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const steps = ["Isi Data Diri", "Verifikasi Wajah", "Data Akun", "Verifikasi OTP"];

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

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

function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const FACE_STEPS = [
  { text: "Posisikan muka pada rangka bulat pada layar", border: "border-red-400" },
  { text: "Posisikan muka pada rangka bulat pada layar", border: "border-red-400" },
  { text: "Silahkan hadap ke arah kanan", border: "border-green-400" },
  { text: "Silahkan hadap ke arah kanan", border: "border-green-400" },
  { text: "Silahkan kedipkan mata sembari tersenyum", border: "border-red-400" },
  { text: "Silahkan kedipkan mata sembari tersenyum", border: "border-red-400" },
  { text: "Silahkan buka mata dan tersenyum", border: "border-green-400" },
  { text: "Silahkan buka mata dan tersenyum", border: "border-green-400" },
];

export default function DaftarPage() {
  const router = useRouter();

  // Step 1: Data Diri
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const today = new Date();
  const [calOpen, setCalOpen] = useState(false);
  const [calPickerMode, setCalPickerMode] = useState<"date" | "month-year">("date");
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<{ day: number; month: number; year: number } | null>(null);
  const cells = getCalendarDays(calYear, calMonth);
  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };
  const formatDate = (d: { day: number; month: number; year: number }) => `${d.day} ${MONTHS[d.month]} ${d.year}`;
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha);

  // Step 2: Face
  const [faceStarted, setFaceStarted] = useState(false);
  const [faceStep, setFaceStep] = useState(0);
  const faceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  // Step 3: Data Akun
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 4: OTP
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpKode, setOtpKode] = useState("");
  const [otpError, setOtpError] = useState("");

  const generateOtp = () => String(Math.floor(1000 + Math.random() * 9000));

  const [step, setStep] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Errors per field
  const [errNik, setErrNik] = useState("");
  const [errNama, setErrNama] = useState("");
  const [errTanggal, setErrTanggal] = useState("");
  const [errCaptcha, setErrCaptcha] = useState("");
  const [errNoHp, setErrNoHp] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [errConfirmPassword, setErrConfirmPassword] = useState("");

  const validateStep1 = () => {
    let valid = true;
    setErrNik(""); setErrNama(""); setErrTanggal(""); setErrCaptcha("");

    if (!nik) { setErrNik("NIK tidak boleh kosong."); valid = false; }
    else if (nik.length !== 16) { setErrNik("NIK harus terdiri dari 16 digit."); valid = false; }

    if (!nama.trim()) { setErrNama("Nama lengkap tidak boleh kosong."); valid = false; }

    if (!selectedDate) { setErrTanggal("Tanggal lahir tidak boleh kosong."); valid = false; }
    else {
      const tgl = new Date(selectedDate.year, selectedDate.month, selectedDate.day);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (tgl >= todayStart) { setErrTanggal("Tanggal lahir tidak boleh lebih dari atau sama dengan hari ini."); valid = false; }
    }

    if (!captchaInput) { setErrCaptcha("Kode captcha tidak boleh kosong."); valid = false; }
    else if (captchaInput !== captchaCode) { setErrCaptcha("Kode captcha yang Anda masukkan salah."); valid = false; }

    return valid;
  };

  const validateStep3 = () => {
    let valid = true;
    setErrNoHp(""); setErrEmail(""); setErrPassword(""); setErrConfirmPassword("");

    if (!noHp) { setErrNoHp("Nomor handphone tidak boleh kosong."); valid = false; }

    if (!email) { setErrEmail("Alamat email tidak boleh kosong."); valid = false; }
    else if (!email.endsWith("@gmail.com")) { setErrEmail("Alamat email harus diakhiri dengan @gmail.com."); valid = false; }

    if (!password) { setErrPassword("Password tidak boleh kosong."); valid = false; }

    if (!confirmPassword) { setErrConfirmPassword("Konfirmasi password tidak boleh kosong."); valid = false; }
    else if (password && confirmPassword !== password) { setErrConfirmPassword("Konfirmasi password tidak cocok."); valid = false; }

    return valid;
  };

  const handleRegister = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const tanggalLahir = selectedDate
        ? `${selectedDate.year}-${String(selectedDate.month + 1).padStart(2, "0")}-${String(selectedDate.day).padStart(2, "0")}`
        : "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nik,
          nama,
          tanggal_lahir: tanggalLahir,
          nomor_hp: noHp,
          email,
          password,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        const detail: string = err.detail || "";
        if (detail.includes("NIK")) { setErrNik(detail); setStep(1); }
        else if (detail.includes("handphone")) { setErrNoHp(detail); setStep(3); }
        else if (detail.includes("email")) { setErrEmail(detail); setStep(3); }
        else setErrorMsg(detail || "Pendaftaran gagal, coba lagi.");
        return;
      }
      router.push("/login");
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 1) router.push("/login");
    else setShowWarning(true);
  };

  // Auto-scroll year list so selected year aligns with selected month row
  useEffect(() => {
    if (calPickerMode === "month-year") {
      setTimeout(() => {
        const el = document.getElementById(`cal-year-${calYear}`);
        if (el && yearListRef.current) {
          const container = yearListRef.current;
          // Align selected year with the selected month row (approx center of visible area)
          const itemTop = el.offsetTop;
          const containerHeight = container.clientHeight;
          const itemHeight = el.clientHeight;
          container.scrollTop = itemTop - containerHeight / 2 + itemHeight / 2;
        }
      }, 0);
    }
  }, [calPickerMode]);

  // Face recognition auto-advance
  useEffect(() => {
    if (faceStarted && faceStep < FACE_STEPS.length) {
      faceTimer.current = setTimeout(() => setFaceStep(s => s + 1), 1200);
    }
    return () => { if (faceTimer.current) clearTimeout(faceTimer.current); };
  }, [faceStarted, faceStep]);

  const handleOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 3) document.getElementById(`daftar-otp-${i + 1}`)?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`daftar-otp-${i - 1}`)?.focus();
  };

  const faceComplete = faceStep >= FACE_STEPS.length;
  const currentFace = FACE_STEPS[Math.min(faceStep, FACE_STEPS.length - 1)];

  return (
    <div className="flex flex-col min-h-full bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-[60]" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative px-4 pb-5 pt-5">
          <button onClick={handleBack} className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <h1 className="text-white font-bold text-base text-center">
            {step === 2 ? "Verifikasi Wajah" : "Pendaftaran Pengguna MobileJKN"}
          </h1>
        </div>
      </div>

      {/* Step indicator */}
      {step !== 2 && (
        <div className="px-4 pt-5">
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
                    <span className={`text-[8px] text-center leading-tight w-12 ${active || done ? "text-gray-600" : "text-gray-400"}`}>{s}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 mt-4 mx-0.5 ${done ? "bg-[#009B4D]" : "bg-gray-300"}`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 flex flex-col ${step !== 2 ? "px-4 pt-5 pb-6 gap-5" : ""}`}>

        {/* â”€â”€ Step 1: Isi Data Diri â”€â”€ */}
        {step === 1 && (
          <>
            <div className="text-center">
              <h2 className="text-[#184087] font-bold text-lg">Selamat Datang di MobileJKN</h2>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">Silahkan isi data diri Anda dengan<br />benar dan lengkap</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* NIK */}
              <div className="flex flex-col gap-1">
                <h3 className="text-[#184087] font-bold text-sm">Nomor Induk Kependudukan (NIK)</h3>
                <p className="text-gray-500 text-xs">Nomor Induk Kependudukan yang terdaftar di Dukcapil</p>
                <input
                  type="tel" inputMode="numeric" maxLength={16}
                  value={nik} onChange={e => { setNik(e.target.value.replace(/\D/g, "")); setErrNik(""); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none bg-white mt-1 ${errNik ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                />
                {errNik && <p className="text-red-500 text-xs mt-0.5">{errNik}</p>}
              </div>

              {/* Nama */}
              <div className="flex flex-col gap-1">
                <h3 className="text-[#184087] font-bold text-sm">Nama Lengkap</h3>
                <p className="text-gray-500 text-xs">Nama lengkap sesuai identitas resmi yang terdaftar di Dukcapil.</p>
                <input
                  type="text"
                  value={nama} onChange={e => { setNama(e.target.value); setErrNama(""); }}
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none bg-white mt-1 ${errNama ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                />
                {errNama && <p className="text-red-500 text-xs mt-0.5">{errNama}</p>}
              </div>

              {/* Tanggal Lahir */}
              <div className="flex flex-col gap-1">
                <h3 className="text-[#184087] font-bold text-sm">Tanggal Lahir</h3>
                <p className="text-gray-500 text-xs">Tanggal lahir yang terdaftar di Dukcapil</p>
                <button
                  type="button"
                  onClick={() => { setCalOpen(true); setErrTanggal(""); }}
                  className={`w-full flex items-center justify-between border rounded-xl px-4 py-3 bg-white mt-1 ${errTanggal ? "border-red-400" : "border-gray-300"}`}
                >
                  <span className={`text-sm ${selectedDate ? "text-gray-800" : "text-gray-400"}`}>
                    {selectedDate ? formatDate(selectedDate) : "Pilih Tanggal"}
                  </span>
                  <CalendarDays className="w-5 h-5 text-[#184087] shrink-0" strokeWidth={1.8} />
                </button>
                {errTanggal && <p className="text-red-500 text-xs mt-0.5">{errTanggal}</p>}
              </div>

              {/* Captcha */}
              <div className="flex flex-col gap-1">
                <h3 className="text-[#184087] font-bold text-sm">Kode Captcha</h3>
                <p className="text-gray-500 text-xs">Kode captcha untuk verifikasi</p>
                <div className="flex items-stretch gap-2 mt-1">
                  <input
                    type="text" maxLength={6}
                    value={captchaInput} onChange={e => { setCaptchaInput(e.target.value.toUpperCase()); setErrCaptcha(""); }}
                    className={`flex-1 border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none bg-white ${errCaptcha ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                  />
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 shrink-0">
                    <span className="font-mono font-bold text-sm tracking-widest text-gray-700 select-none" style={{ fontFamily: "serif", letterSpacing: 4, textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
                      {captchaCode}
                    </span>
                    <button type="button" onClick={() => { setCaptchaCode(generateCaptcha()); setCaptchaInput(""); setErrCaptcha(""); }}>
                      <RefreshCw className="w-4 h-4 text-[#184087]" strokeWidth={2} />
                    </button>
                  </div>
                </div>
                {errCaptcha && <p className="text-red-500 text-xs mt-0.5">{errCaptcha}</p>}
              </div>
            </div>
          </>
        )}

        {/* â”€â”€ Step 2: Verifikasi Wajah â”€â”€ */}
        {step === 2 && (
          <div className="flex flex-col flex-1 px-4 pb-6 pt-0">
            {!faceStarted ? (
              /* Halaman intro Frista */
              <>
                <div className="flex flex-col flex-1 items-center justify-center gap-6 px-2">
                  <img src="/images/logofrista.svg" alt="Frista" className="w-56 h-auto" />
                  <div className="flex flex-col gap-2 text-gray-600 text-xs leading-relaxed text-center">
                    <p>Harap melepas kacamata dan masker saat melakukan verifikasi wajah.</p>
                    <p>Ikuti petunjuk yang ditampilkan pada layar serta pastikan posisi wajah tetap stabil dan tidak bergerak selama proses perekaman.</p>
                    <p className="text-gray-400 text-[10px] mt-1">
                      Frista merupakan layanan dari BPJS Kesehatan yang berfungsi untuk melakukan identifikasi dan verifikasi data biometrik dalam melakukan verifikasi dan validasi eligibilitas peserta.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFaceStarted(true)}
                  className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
                >
                  Mulai
                </button>
              </>
            ) : faceComplete ? (
              /* Face selesai */
              <>
                <div className="flex flex-col flex-1 items-center justify-center gap-6">
                  <div className="w-48 h-56 rounded-[40%] border-4 border-green-400 overflow-hidden bg-gray-100 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 text-green-400" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="50" cy="40" r="20" />
                      <path d="M20 85 Q50 65 80 85" />
                    </svg>
                  </div>
                  <p className="text-[#009B4D] font-bold text-base text-center">Verifikasi Wajah Berhasil!</p>
                </div>
                <button
                  onClick={() => setStep(3)}
                  className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
                >
                  Lanjut
                </button>
              </>
            ) : (
              /* Proses scan wajah */
              <div className="flex flex-col flex-1 items-center justify-center gap-6">
                {/* Oval frame */}
                <div className={`relative w-48 h-56 rounded-[40%] border-4 ${currentFace.border} bg-gray-200 overflow-hidden`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 120" className="w-full h-full text-gray-400" fill="currentColor">
                      <ellipse cx="50" cy="45" rx="22" ry="26" />
                      <path d="M10 110 Q50 85 90 110" />
                    </svg>
                  </div>
                  {/* Scan line animasi */}
                  <div className="absolute inset-x-0 h-0.5 bg-green-400/80 animate-scan-line" />
                </div>
                <p className="text-gray-700 font-semibold text-sm text-center px-4">{currentFace.text}</p>
                {/* Progress dots */}
                <div className="flex gap-2">
                  {FACE_STEPS.map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i < faceStep ? "bg-[#009B4D]" : i === faceStep ? "bg-[#46ADDC]" : "bg-gray-300"}`} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Step 3: Data Akun â”€â”€ */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            {/* Peserta (readonly) */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[#184087] font-bold text-sm">Peserta</h3>
              <p className="text-gray-500 text-xs">Data Nama dan NIK peserta yang telah terverifikasi</p>
              <input
                type="text" readOnly
                value={`${nama} (${nik})`}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50 mt-1 cursor-default outline-none focus:border-gray-300"
              />
            </div>

            {/* No HP */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[#184087] font-bold text-sm">Nomor Handphone</h3>
              <p className="text-gray-500 text-xs">Nomor handphone aktif milik peserta</p>
              <input
                type="tel" inputMode="numeric"
                value={noHp} onChange={e => { setNoHp(e.target.value.replace(/\D/g, "")); setErrNoHp(""); }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none bg-white mt-1 ${errNoHp ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
              />
              {errNoHp && <p className="text-red-500 text-xs mt-0.5">{errNoHp}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[#184087] font-bold text-sm">Alamat Email</h3>
              <p className="text-gray-500 text-xs">Alamat email peserta yang terdaftar</p>
              <input
                type="email"
                value={email} onChange={e => { setEmail(e.target.value); setErrEmail(""); }}
                className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none bg-white mt-1 ${errEmail ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
              />
              {errEmail && <p className="text-red-500 text-xs mt-0.5">{errEmail}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[#184087] font-bold text-sm">Password</h3>
              <p className="text-gray-500 text-xs">Kata sandi untuk keamanan akun Mobile JKN Anda</p>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password} onChange={e => { setPassword(e.target.value); setErrPassword(""); }}
                  className={`w-full border rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 outline-none bg-white ${errPassword ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                  {showPassword ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
                </button>
              </div>
              {errPassword && <p className="text-red-500 text-xs mt-0.5">{errPassword}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div className="flex flex-col gap-1">
              <h3 className="text-[#184087] font-bold text-sm">Konfirmasi Password</h3>
              <p className="text-gray-500 text-xs">Konfirmasi kata sandi untuk keamanan akun Mobile JKN Anda</p>
              <div className="relative mt-1">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrConfirmPassword(""); }}
                  className={`w-full border rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 outline-none bg-white ${errConfirmPassword ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                  {showConfirm ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
                </button>
              </div>
              {errConfirmPassword && <p className="text-red-500 text-xs mt-0.5">{errConfirmPassword}</p>}
            </div>
          </div>
        )}

        {/* â”€â”€ Step 4: Verifikasi OTP â”€â”€ */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-4 pt-2">
            <MessageSquare className="w-20 h-20 text-[#184087]" strokeWidth={1.5} />
            <h2 className="text-gray-900 font-bold text-lg text-center">Masukkan Kode OTP</h2>
            <p className="text-gray-500 text-sm text-center leading-relaxed px-4">
              Kode OTP telah dikirimkan melalui SMS ke nomor handphone yang Anda daftarkan.
            </p>
            {otpKode && (
              <div className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 flex flex-col gap-1">
                <p className="text-gray-400 text-[10px] font-medium">SMS dari BPJS Kesehatan</p>
                <p className="text-gray-700 text-sm">Kode OTP Anda adalah <span className="font-bold text-[#184087]">{otpKode}</span>. Jangan berikan kode ini kepada siapapun.</p>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-2">
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`daftar-otp-${i}`}
                  type="tel" inputMode="numeric" maxLength={1}
                  value={v}
                  onChange={e => handleOtp(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl bg-white outline-none transition-colors ${otpError ? "border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                />
              ))}
            </div>
            {otpError && <p className="text-red-500 text-xs text-center">{otpError}</p>}
            <button
              className="text-[#46ADDC] text-xs font-medium underline mt-1"
              onClick={() => { const kode = generateOtp(); setOtpKode(kode); setOtp(["", "", "", ""]); setOtpError(""); }}
            >
              Kirim ulang OTP
            </button>
          </div>
        )}

        {step !== 2 && (
          <>
            <div className="flex-1" />
            {errorMsg !== "" && (
              <p className="text-red-500 text-xs text-center -mb-2">{errorMsg}</p>
            )}
            <button
              disabled={isSubmitting}
              onClick={() => {
                if (step === 1) { if (validateStep1()) setStep(2); }
                else if (step === 3) {
                  if (validateStep3()) {
                    const kode = generateOtp();
                    setOtpKode(kode);
                    setOtp(["", "", "", ""]);
                    setOtpError("");
                    setStep(4);
                  }
                }
                else if (step < 4) setStep(step + 1);
                else {
                  if (otp.join("") !== otpKode) {
                    setOtpError("Kode OTP yang Anda masukkan salah.");
                    setOtp(["", "", "", ""]);
                    document.getElementById("daftar-otp-0")?.focus();
                    return;
                  }
                  handleRegister();
                }
              }}
              className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl disabled:opacity-60"
            >
              {step === 4 ? (isSubmitting ? "Mendaftarkan..." : "Daftar") : "Simpan dan Verifikasi Data"}
            </button>
          </>
        )}
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Apakah Anda yakin ingin keluar?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Proses pendaftaran akan dibatalkan dan data yang telah diisi tidak akan tersimpan.
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button onClick={() => router.push("/login")} className="flex-1 bg-[#E05555] text-white font-bold text-sm py-3 rounded-full">
                Keluar
              </button>
              <button onClick={() => setShowWarning(false)} className="flex-1 bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full">
                Lanjut Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {calOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-5 bg-black/40">
          <div className="bg-white rounded-2xl p-4 w-full shadow-xl flex flex-col overflow-hidden" style={{ maxHeight: "420px" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              {calPickerMode === "date" && (
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => setCalPickerMode(m => m === "date" ? "month-year" : "date")}
                className={`font-bold text-base text-gray-900 flex items-center gap-1 ${calPickerMode === "date" ? "" : "mx-auto"}`}
              >
                {MONTHS[calMonth]} {calYear}
                <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${calPickerMode === "month-year" ? "rotate-90" : "rotate-90"}`} strokeWidth={2} />
              </button>
              {calPickerMode === "date" && (
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>

            {calPickerMode === "month-year" ? (
              /* Month + Year picker */
              <>
              <div className="flex gap-2 flex-1 overflow-hidden">
                {/* Month list */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 left-0 right-0 h-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }} />
                  <div className="absolute bottom-0 left-0 right-0 h-8 z-10 pointer-events-none" style={{ background: "linear-gradient(to top, white 0%, transparent 100%)" }} />
                  <div className="overflow-y-auto no-scrollbar flex flex-col gap-1 flex-1">
                    {MONTHS.map((m, i) => (
                      <button
                        key={m}
                        onClick={() => setCalMonth(i)}
                        className={`py-2 rounded-xl text-sm font-medium transition-colors ${i === calMonth ? "bg-[#46ADDC] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Year list */}
                <div className="w-20 relative flex flex-col overflow-hidden">
                  <div
                    ref={yearListRef}
                    className="overflow-y-auto no-scrollbar flex flex-col gap-1 flex-1"
                    onScroll={() => yearListRef.current && yearListRef.current.dispatchEvent(new Event("scrolled"))}
                  >
                      {/* Years from oldest to newest (scroll up = older) */}
                    {Array.from({ length: 100 }, (_, i) => today.getFullYear() - 99 + i).map(y => (
                      <button
                        key={y}
                        id={`cal-year-${y}`}
                        onClick={() => setCalYear(y)}
                        className={`py-2 rounded-xl text-sm font-medium transition-colors shrink-0 ${y === calYear ? "bg-[#46ADDC] text-white" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {y}
                      </button>
                    ))}
                    {/* Spacer bawah agar 2026 bisa scroll ke tengah */}
                    <div className="h-40 shrink-0" />
                  </div>
                  {/* Fade atas â€” menandakan ada item di atas */}
                  <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(to bottom, white 0%, transparent 100%)" }} />
                  {/* Fade bawah */}
                  <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{ background: "linear-gradient(to top, white 0%, transparent 100%)" }} />
                </div>
              </div>
              <button
                onClick={() => setCalPickerMode("date")}
                className="mt-3 w-full bg-[#009B4D] text-white text-sm font-semibold py-2.5 rounded-xl"
              >
                Lanjut →
              </button>
              </>
            ) : (
              /* Date grid */
              <>
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => (
                    <div key={d} className="text-center text-gray-400 text-xs font-medium py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-1">
                  {cells.map((cell, i) => {
                    const isToday = cell.curr && cell.day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                    const isSelected = cell.curr && selectedDate?.day === cell.day && selectedDate?.month === calMonth && selectedDate?.year === calYear;
                    return (
                      <button
                        key={i}
                        onClick={() => { if (cell.curr) { setSelectedDate({ day: cell.day, month: calMonth, year: calYear }); setCalOpen(false); setCalPickerMode("date"); }}}
                        className={`h-9 w-full flex items-center justify-center rounded-xl text-sm font-medium transition-colors
                          ${!cell.curr ? "text-gray-300" : ""}
                          ${cell.curr && !isToday && !isSelected ? "text-gray-800 hover:bg-gray-100" : ""}
                          ${isToday && !isSelected ? "border-2 border-[#46ADDC] text-[#46ADDC]" : ""}
                          ${isSelected ? "bg-[#46ADDC] text-white" : ""}
                        `}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scan-line {
          0% { top: 8px; }
          50% { top: calc(100% - 8px); }
          100% { top: 8px; }
        }
        .animate-scan-line {
          animation: scan-line 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}



