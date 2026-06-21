"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, RefreshCw, CheckCircle2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCaptcha() {
  return Array.from({ length: 7 }, () => CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)]).join("");
}

export default function UbahKataSandiPage() {
  useRequireAuth();
  const { userLevel } = useUserLevel();
  const [kataSandiSaatIni, setKataSandiSaatIni] = useState("");
  const [kataSandiBaru, setKataSandiBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [showSaatIni, setShowSaatIni] = useState(false);
  const [showBaru, setShowBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative flex items-center px-4 pb-6 pt-6">
          <Link href="/profil" className="w-8 h-8 flex items-center justify-center shrink-0 z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="absolute inset-x-0 text-white font-bold text-lg text-center pointer-events-none">
            Ubah Kata Sandi
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Petunjuk */}
        <div>
          <p className="text-gray-800 text-xs font-bold mb-1">Petunjuk Pengisian Password Baru:</p>
          <ul className="flex flex-col gap-0.5">
            {[
              "Password terdiri dari setidaknya 6 (enam) karakter",
              "Password harus mengandung angka/numerik",
              "Password harus mengandung huruf besar dan kecil",
            ].map((tip) => (
              <li key={tip} className="text-gray-700 text-xs flex gap-1.5">
                <span>â€¢</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Kata Sandi Saat Ini */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Kata Sandi Saat ini</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Masukkan kata sandi saat ini.</p>}
          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 focus-within:border-[#184087] transition-colors">
            <input
              type={showSaatIni ? "text" : "password"}
              value={kataSandiSaatIni}
              onChange={(e) => setKataSandiSaatIni(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
            />
            <button onClick={() => setShowSaatIni(!showSaatIni)} className="shrink-0">
              {showSaatIni ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
            </button>
          </div>
        </div>

        {/* Kata Sandi Baru */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Kata Sandi Baru</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Masukkan kata sandi baru</p>}
          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 focus-within:border-[#184087] transition-colors">
            <input
              type={showBaru ? "text" : "password"}
              value={kataSandiBaru}
              onChange={(e) => setKataSandiBaru(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
            />
            <button onClick={() => setShowBaru(!showBaru)} className="shrink-0">
              {showBaru ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
            </button>
          </div>
        </div>

        {/* Konfirmasi Kata Sandi Baru */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Konfirmasi Kata Sandi Baru</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Masukkan kembali kata sandi baru untuk konfirmasi</p>}
          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-3 bg-white mt-1 focus-within:border-[#184087] transition-colors">
            <input
              type={showKonfirmasi ? "text" : "password"}
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
            />
            <button onClick={() => setShowKonfirmasi(!showKonfirmasi)} className="shrink-0">
              {showKonfirmasi ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
            </button>
          </div>
        </div>

        {/* Kode Captcha */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-[#184087] font-bold text-sm">Kode Captcha</h2>
          {userLevel === "pemula" && <p className="text-gray-500 text-xs">Kode captcha untuk verifikasi</p>}
          <div className="flex items-stretch gap-2 mt-1">
            <input
              type="text"
              maxLength={7}
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#184087] bg-white"
            />
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 shrink-0">
              <span
                className="font-mono font-bold text-sm tracking-widest text-gray-700 select-none"
                style={{ fontFamily: "serif", letterSpacing: 4, textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
              >
                {captcha}
              </span>
              <button type="button" onClick={() => setCaptcha(generateCaptcha())} className="shrink-0">
                <RefreshCw className="w-4 h-4 text-[#184087]" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Simpan button */}
        <button
          onClick={() => setShowSuccess(true)}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
        >
          Simpan
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#009B4D]" strokeWidth={1.5} />
            </div>
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Proses Perubahan Password Anda Berhasil
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Anda mulai dapat menggunakan Password baru Anda untuk proses <em>login</em> akun
            </p>
            <Link
              href="/profil"
              className="w-full bg-[#009B4D] text-white font-bold text-sm py-3 rounded-full text-center mt-1"
            >
              Balik ke Profil
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}




