﻿"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageSquare, ShieldAlert, Lock, CheckCircle2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const steps = ["Input No. HP Baru", "Input OTP", "Persetujuan", "Verifikasi PIN"];

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export default function PerubahanNomorHpPage() {
  useRequireAuth();
  const { userLevel, recordInteraction, recordTaskCompletion, recordError } = useUserLevel();
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nomorBaru, setNomorBaru] = useState("");
  const [nomorError, setNomorError] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [pinError, setPinError] = useState("");

  const handleOtp = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    setOtpError("");
    if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-${i - 1}`)?.focus();
  };

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

  const handleBack = () => {
    if (step === 1) router.push("/perubahan-data");
    else setShowWarning(true);
  };

  const kirimOtp = () => {
    const kode = generateOtp();
    setOtpCode(kode);
    setOtp(["", "", "", ""]);
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
          <h1 className="text-white font-bold text-lg text-center">
            {step === 3 ? "Verifikasi" : "Perubahan Nomor Handphone"}
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

        {/* Step 1: Input No. HP Baru */}
        {step === 1 && (
          <>
            {userLevel === "pemula" && (
              <p className="text-gray-600 text-xs leading-relaxed text-justify">
                Silahkan memasukkan Nomor Handphone yang baru. Pastikan Nomor Handphone yang dimasukkan benar karena sistem akan mengirimkan kode verifikasi ke nomor tersebut.
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[#184087] font-bold text-sm">Nomor Handphone Baru</h2>
              {userLevel === "pemula" && <p className="text-gray-500 text-xs">Nomor handphone baru yang ingin didaftarkan milik peserta</p>}
              <input
                type="tel"
                value={nomorBaru}
                onChange={(e) => { setNomorBaru(e.target.value); setNomorError(false); }}
                className={`mt-1 w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none bg-white transition-colors ${nomorError ? "border-[#E05555]" : "border-gray-300 focus:border-[#184087]"}`}
              />
              {nomorError && <p className="text-[#E05555] text-xs">Nomor handphone tidak boleh kosong.</p>}
            </div>
          </>
        )}

        {/* Step 2: Input OTP */}
        {step === 2 && (
          <div className="flex flex-col items-center gap-4 pt-2">
            <MessageSquare className="w-20 h-20 text-[#184087]" strokeWidth={1.5} />

            <h2 className="text-gray-900 font-bold text-lg text-center leading-snug px-2">
              Masukkan OTP yang Anda terima dari SMS
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed px-4">
              OTP digunakan untuk melakukan verifikasi pada nomor handphone untuk memastikan keaktifan nomor
            </p>

            {/* Simulasi SMS masuk */}
            {otpCode && (
              <div className="w-full bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 flex flex-col gap-1">
                <p className="text-gray-400 text-[10px] font-medium">SMS dari BPJS Kesehatan</p>
                <p className="text-gray-700 text-sm">Kode OTP Anda adalah <span className="font-bold text-[#184087]">{otpCode}</span>. Jangan berikan kode ini kepada siapapun.</p>
              </div>
            )}

            {/* 4 kotak OTP */}
            <div className="flex justify-center gap-4 mt-1">
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={v}
                  onChange={(e) => handleOtp(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKey(i, e)}
                  className={`w-14 h-16 text-center text-2xl font-bold border-2 rounded-xl bg-white outline-none transition-colors ${otpError ? "border-[#E05555]" : "border-gray-300 focus:border-[#184087]"}`}
                />
              ))}
            </div>
            {otpError && <p className="text-[#E05555] text-xs text-center">{otpError}</p>}

            <button
              type="button"
              onClick={kirimOtp}
              className="flex items-center gap-1.5 text-[#184087] text-xs underline mt-1"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8L7 3v3h5a4 4 0 010 8H7v-2h5a2 2 0 000-4H7v3L2 8z" fill="#184087"/>
              </svg>
              Tidak mendapatkan kode OTP? Kirim ulang kode OTP
            </button>
          </div>
        )}

        {/* Step 3: Persetujuan */}
        {step === 3 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-8 py-6">
            <ShieldAlert className="w-36 h-36 text-[#184087]" strokeWidth={1.2} />
            <p className="text-gray-900 font-medium text-base text-center leading-relaxed px-4">
              Saya bertanggung jawab penuh terhadap perubahan data Pribadi maupun Anggota Keluarga yang akan dilakukan perubahan data
            </p>
          </div>
        )}

        {/* Step 4: Verifikasi PIN */}
        {step === 4 && (
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

            {/* 6 kotak PIN */}
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

        {step === 3 ? (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 bg-[#E05555] text-white font-bold text-base py-4 rounded-2xl"
            >
              Batal
            </button>
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
            >
              Setuju
            </button>
          </div>
        ) : (
          <button
            onClick={async () => {
              if (step === 1) {
                if (!nomorBaru.trim()) { recordError(); setNomorError(true); return; }
                const kode = generateOtp();
                setOtpCode(kode);
                setStep(2);
              } else if (step === 2) {
                if (otp.join("") !== otpCode) { recordError(); setOtpError("Kode OTP yang Anda masukkan salah."); setOtp(["", "", "", ""]); document.getElementById("otp-0")?.focus(); return; }
                setStep(3);
              } else if (step === 4) {
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
                  localStorage.setItem("jkn_nomor_hp", nomorBaru);
                  const duration = Math.floor((Date.now() - taskStartRef.current) / 1000);
                  taskCompletedRef.current = true;
                  recordTaskCompletion(true, duration);
                  setShowSuccess(true);
                } catch {
                  setPinError("Tidak dapat terhubung ke server.");
                }
              } else {
                setStep(step + 1);
              }
            }}
            className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl"
          >
            Verifikasi
          </button>
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
              Proses perubahan nomor handphone akan dibatalkan dan Anda akan kembali ke halaman perubahan data
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button onClick={() => router.push("/perubahan-data")}
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

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#009B4D]" strokeWidth={1.5} />
            </div>
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Perubahan Nomor Handphone Berhasil
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Nomor handphone Anda telah berhasil diperbarui
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


