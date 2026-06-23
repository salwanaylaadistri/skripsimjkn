﻿﻿﻿﻿"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft, MessageSquare, CheckCircle2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

export default function LoginPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Lupa password flow: null = tidak aktif, 1 = input NIK, 2 = OTP, 3 = password baru
  const [lupaStep, setLupaStep] = useState<number | null>(null);
  const [lupaNik, setLupaNik] = useState("");
  const [lupaMaskedHp, setLupaMaskedHp] = useState("");
  const [lupaOtpKode, setLupaOtpKode] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessLupa, setShowSuccessLupa] = useState(false);
  const [lupaLoading, setLupaLoading] = useState(false);
  const [lupaErr, setLupaErr] = useState("");
  const [lupaErrNewPw, setLupaErrNewPw] = useState("");
  const [lupaErrConfirmPw, setLupaErrConfirmPw] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errNik, setErrNik] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [errLogin, setErrLogin] = useState("");

  const handleLogin = async () => {
    setErrNik(""); setErrPassword(""); setErrLogin("");
    if (!nik) { setErrNik("NIK tidak boleh kosong."); return; }
    if (nik.length !== 16) { setErrNik("NIK harus terdiri dari 16 digit."); return; }
    if (!password) { setErrPassword("Password tidak boleh kosong."); return; }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nik, password }),
      });
      if (!res.ok) {
        setErrLogin("NIK atau password yang Anda masukkan salah.");
        return;
      }
      const data = await res.json();
      const newUserId = String(data.user_id);
      const prevOwnerId = localStorage.getItem("jkn_owner_id");
      const isSameAccount = prevOwnerId === newUserId;

      // Hapus semua key sesi akun lama
      ["jkn_user_id","jkn_user_level","jkn_feature_order","jkn_user_nama"].forEach(k => localStorage.removeItem(k));

      // Kalau ganti akun: hapus interaction_data umum saja
      // Per-user key (jkn_interaction_data_${id}) TIDAK dihapus — dipertahankan
      // agar tiap akun bisa menyimpan datanya sendiri dan predict bisa jalan saat login ulang
      if (!isSameAccount) {
        localStorage.removeItem("jkn_interaction_data");
      }

      sessionStorage.clear();
      localStorage.setItem("jkn_user_id", newUserId);
      localStorage.setItem("jkn_owner_id", newUserId);
      localStorage.setItem("jkn_user_nama", data.nama);
      localStorage.setItem("jkn_terms_agreed", data.terms_agreed ? "1" : "0");
      localStorage.setItem("jkn_has_pin", data.has_pin ? "1" : "0");
      // Fetch data lengkap user untuk halaman perubahan data
      try {
        const profileRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/user/${data.user_id}`);
        if (profileRes.ok) {
          const profile = await profileRes.json();
          localStorage.setItem("jkn_nomor_hp", profile.nomor_hp ?? "");
          localStorage.setItem("jkn_email", profile.email ?? "");
          localStorage.setItem("jkn_nik", profile.nik ?? "");
        }
      } catch { /* tidak blokir login jika fetch profil gagal */ }
      // checkin_done tidak dihapus saat login — per-user key sudah aman dipisah
      sessionStorage.setItem("from_login", "1");
      window.dispatchEvent(new Event("jkn_login"));
      router.push("/");
    } catch {
      setErrLogin("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 3) document.getElementById(`lupa-otp-${i + 1}`)?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`lupa-otp-${i - 1}`)?.focus();
  };

  // Lupa password screens
  if (lupaStep !== null) {
    return (
      <div className="flex flex-col min-h-full bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
          <StatusBar />
          <div className="relative px-4 pb-6 pt-6">
            <button
              onClick={() => lupaStep === 1 ? setLupaStep(null) : setLupaStep(lupaStep - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
            >
              <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <h1 className="text-white font-bold text-lg text-center">Lupa Password</h1>
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-4 pt-5">
          <div className="flex items-start">
            {["Verifikasi NIK", "Kode OTP", "Password Baru"].map((s, i) => {
              const num = i + 1;
              const active = num === lupaStep;
              const done = num < lupaStep;
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
                  {i < 2 && <div className={`flex-1 h-0.5 mt-4 mx-0.5 ${done ? "bg-[#009B4D]" : "bg-gray-300"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 px-4 pt-5 pb-6 flex flex-col gap-5">

          {/* Step 1: Input NIK */}
          {lupaStep === 1 && (
            <>
              <p className="text-gray-600 text-xs leading-relaxed">
                Masukkan NIK yang terdaftar. Sistem akan mengirimkan kode OTP ke nomor handphone yang terdaftar pada akun Anda.
              </p>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[#184087] font-bold text-sm">Nomor Induk Kependudukan (NIK)</h2>
                <p className="text-gray-500 text-xs">NIK yang terdaftar pada akun Mobile JKN Anda</p>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={16}
                  value={lupaNik}
                  onChange={e => { setLupaNik(e.target.value.replace(/\D/g, "")); setLupaErr(""); }}
                  className={`mt-1 w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-white transition-colors ${lupaErr ? "border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                />
                {lupaErr && <p className="text-red-500 text-xs mt-0.5">{lupaErr}</p>}
              </div>
            </>
          )}

          {/* Step 2: OTP */}
          {lupaStep === 2 && (
            <div className="flex flex-col items-center gap-4 pt-2">
              <MessageSquare className="w-20 h-20 text-[#184087]" strokeWidth={1.5} />
              <h2 className="text-gray-900 font-bold text-lg text-center">Masukkan Kode OTP</h2>
              <p className="text-gray-500 text-sm text-center leading-relaxed px-4">
                Kode OTP telah dikirimkan melalui SMS ke nomor handphone <span className="font-semibold text-gray-700">{lupaMaskedHp}</span> yang terdaftar pada akun Anda.
              </p>
              <div className="flex justify-center gap-3 mt-2">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    id={`lupa-otp-${i}`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={v}
                    onChange={e => { handleOtp(i, e.target.value); setLupaErr(""); }}
                    onKeyDown={e => handleOtpKey(i, e)}
                    className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl bg-white outline-none transition-colors ${lupaErr ? "border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                  />
                ))}
              </div>
              {lupaErr && <p className="text-red-500 text-xs">{lupaErr}</p>}
              <button
                className="text-[#46ADDC] text-xs font-medium underline mt-1"
                onClick={() => {
                  const kode = String(Math.floor(1000 + Math.random() * 9000));
                  setLupaOtpKode(kode);
                  setOtp(["", "", "", ""]);
                  alert(`[Simulasi SMS] Kode OTP baru Anda: ${kode}`);
                }}
              >
                Kirim ulang OTP
              </button>
            </div>
          )}

          {/* Step 3: Password Baru */}
          {lupaStep === 3 && (
            <>
              <p className="text-gray-600 text-xs leading-relaxed">
                Buat password baru untuk akun Mobile JKN Anda. Pastikan password mudah diingat namun sulit ditebak.
              </p>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[#184087] font-bold text-sm">Password Baru</h2>
                <p className="text-gray-500 text-xs">Minimal 8 karakter</p>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setLupaErrNewPw(""); }}
                    className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-sm text-gray-700 outline-none bg-white transition-colors ${lupaErrNewPw ? "border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                    {showNewPassword ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
                  </button>
                </div>
                {lupaErrNewPw && <p className="text-red-500 text-xs mt-0.5">{lupaErrNewPw}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[#184087] font-bold text-sm">Konfirmasi Password Baru</h2>
                <p className="text-gray-500 text-xs">Masukkan ulang password baru Anda</p>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setLupaErrConfirmPw(""); }}
                    className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-sm text-gray-700 outline-none bg-white transition-colors ${lupaErrConfirmPw ? "border-red-400" : "border-gray-300 focus:border-[#184087]"}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                    {showConfirmPassword ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} /> : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />}
                  </button>
                </div>
                {lupaErrConfirmPw && <p className="text-red-500 text-xs mt-0.5">{lupaErrConfirmPw}</p>}
              </div>
              {lupaErr && <p className="text-red-500 text-xs text-center">{lupaErr}</p>}
            </>
          )}

          <div className="flex-1" />

          <button
            disabled={lupaLoading}
            onClick={async () => {
              setLupaErr("");
              if (lupaStep === 1) {
                if (!lupaNik) { setLupaErr("NIK tidak boleh kosong."); return; }
                if (lupaNik.length !== 16) { setLupaErr("NIK harus terdiri dari 16 digit."); return; }
                setLupaLoading(true);
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/check-nik/${lupaNik}`);
                  if (!res.ok) { setLupaErr("NIK tidak ditemukan dalam sistem."); return; }
                  const data = await res.json();
                  setLupaMaskedHp(data.nomor_hp_masked);
                  const kode = String(Math.floor(1000 + Math.random() * 9000));
                  setLupaOtpKode(kode);
                  alert(`[Simulasi SMS] Kode OTP Anda: ${kode}`);
                  setOtp(["", "", "", ""]);
                  setLupaStep(2);
                } catch { setLupaErr("Tidak dapat terhubung ke server."); }
                finally { setLupaLoading(false); }
              } else if (lupaStep === 2) {
                const inputKode = otp.join("");
                if (inputKode.length < 4) { setLupaErr("Masukkan 4 digit kode OTP."); return; }
                if (inputKode !== lupaOtpKode) { setLupaErr("Kode OTP yang Anda masukkan salah."); return; }
                setLupaStep(3);
              } else if (lupaStep === 3) {
                setLupaErrNewPw(""); setLupaErrConfirmPw("");
                if (!newPassword) { setLupaErrNewPw("Password baru tidak boleh kosong."); return; }
                if (newPassword.length < 8) { setLupaErrNewPw("Password minimal 8 karakter."); return; }
                if (!confirmPassword) { setLupaErrConfirmPw("Konfirmasi password tidak boleh kosong."); return; }
                if (confirmPassword !== newPassword) { setLupaErrConfirmPw("Konfirmasi password tidak cocok."); return; }
                setLupaLoading(true);
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"}/reset-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nik: lupaNik, new_password: newPassword }),
                  });
                  if (!res.ok) { setLupaErr("Gagal memperbarui password, coba lagi."); return; }
                  setShowSuccessLupa(true);
                } catch { setLupaErr("Tidak dapat terhubung ke server."); }
                finally { setLupaLoading(false); }
              }
            }}
            className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl disabled:opacity-60"
          >
            {lupaLoading ? "Memproses..." : lupaStep === 3 ? "Simpan Password" : "Lanjut"}
          </button>
        </div>

        {/* Popup sukses */}
        {showSuccessLupa && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-8 max-w-[430px] mx-auto">
            <div className="bg-white rounded-3xl px-6 py-8 flex flex-col items-center gap-4 w-full shadow-2xl">
              <div className="w-20 h-20 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#009B4D]" strokeWidth={1.5} />
              </div>
              <h2 className="text-gray-900 font-bold text-lg text-center">Password Berhasil Diubah!</h2>
              <p className="text-gray-500 text-xs text-center leading-relaxed">
                Password Anda telah berhasil diperbarui. Silakan login kembali menggunakan password baru Anda.
              </p>
              <button
                onClick={() => { setShowSuccessLupa(false); setLupaStep(null); setShowForm(true); }}
                className="w-full bg-[#009B4D] text-white font-bold text-sm py-3.5 rounded-2xl mt-1"
              >
                Login dengan Password Baru
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="flex flex-col min-h-full relative overflow-hidden">
        <StatusBar />
        <img
          src="/images/asetlogin.png"
          alt="background"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full"
          style={{ height: "auto" }}
        />
        <div className="flex-1 flex items-center justify-center relative z-10">
          <img
            src="/images/logologinmjkn.png"
            alt="Mobile JKN"
            style={{ width: 140, height: 140, objectFit: "contain" }}
          />
        </div>
        <div className="relative z-10 px-8 pb-12 flex flex-col gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-[#009B4D] text-white font-bold text-base py-3.5 rounded-full"
          >
            Masuk
          </button>
          <button
            onClick={() => router.push("/daftar")}
            className="w-full bg-[#46ADDC] text-white font-bold text-base py-3.5 rounded-full"
          >
            Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden relative bg-white">
      <StatusBar />
      <img
        src="/images/asetlogin.png"
        alt="background"
        className="absolute top-0 left-0 w-full"
        style={{ height: "auto" }}
      />
      <div className="absolute inset-0" style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: "rgba(0,0,0,0.15)" }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-center z-10" style={{ height: "40%" }}>
        <img
          src="/images/logologinmjkn.png"
          alt="Mobile JKN"
          style={{ width: 120, height: 120, objectFit: "contain" }}
        />
      </div>
      <div className="absolute left-0 right-0 bottom-0 px-6 flex flex-col gap-4 z-10 overflow-y-auto" style={{ top: "38%" }}>
        <div className="flex flex-col gap-1">
          <h2 className="text-white font-bold text-sm">Nomor Induk Kependudukan (NIK)</h2>
          <p className="text-white/70 text-xs">Nomor Induk Kependudukan yang terdaftar di Dukcapil</p>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={16}
            value={nik}
            onChange={e => { setNik(e.target.value.replace(/\D/g, "")); setErrNik(""); setErrLogin(""); }}
            className={`w-full border rounded-xl px-4 py-3 text-sm text-gray-800 outline-none bg-white mt-1 ${errNik ? "border-red-400" : "border-[#184087]/40 focus:border-[#184087]"}`}
          />
          {errNik && <p className="text-red-300 text-xs mt-0.5">{errNik}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-white font-bold text-sm">Password</h2>
          <p className="text-white/70 text-xs">Kata sandi untuk keamanan akun Mobile JKN Anda</p>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); setErrPassword(""); setErrLogin(""); }}
              className={`w-full border rounded-xl px-4 py-3 pr-12 text-sm text-gray-800 outline-none bg-white ${errPassword ? "border-red-400" : "border-[#184087]/40 focus:border-[#184087]"}`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
              {showPassword
                ? <Eye className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />
                : <EyeOff className="w-5 h-5 text-[#184087]" strokeWidth={1.8} />
              }
            </button>
          </div>
          {errPassword && <p className="text-red-300 text-xs mt-0.5">{errPassword}</p>}
          <div className="flex justify-end mt-1">
            <button
              onClick={() => setLupaStep(1)}
              className="text-white/80 text-xs font-medium underline"
            >
              Lupa password?
            </button>
          </div>
        </div>
        <div className="flex-1" />
        {errLogin && <p className="text-red-300 text-xs text-center -mb-2">{errLogin}</p>}
        <button
          disabled={isLoading}
          onClick={handleLogin}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-3.5 rounded-full mb-8 disabled:opacity-60"
        >
          {isLoading ? "Memverifikasi..." : "Masuk"}
        </button>
      </div>
    </div>
  );
}



