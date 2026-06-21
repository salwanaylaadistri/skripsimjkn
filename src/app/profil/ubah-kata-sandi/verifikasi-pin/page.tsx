"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageSquare, Lock, CheckCircle2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";
const PIN_LENGTH = 6;

export default function VerifikasiPinPage() {
  useRequireAuth();
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative flex items-center px-4 pb-6 pt-6">
          <button type="button" onClick={() => setShowWarning(true)} className="w-8 h-8 flex items-center justify-center shrink-0 z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </button>
          <h1 className="absolute inset-x-0 text-white font-bold text-lg text-center pointer-events-none">
            Verifikasi PIN
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-50 px-6 flex flex-col">
        {/* Icon */}
        <div className="flex justify-center mt-12 mb-5 relative">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <MessageSquare className="w-20 h-20 text-[#184087] absolute top-0 left-0" strokeWidth={1.5} fill="#184087" />
            <div className="absolute bottom-0 right-0 w-9 h-9 bg-[#184087] rounded-full flex items-center justify-center border-4 border-gray-50">
              <Lock className="w-4 h-4 text-white" strokeWidth={2} fill="white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-7">
          <h2 className="text-gray-900 font-bold text-lg mb-2">Masukkan PIN Anda saat ini</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            PIN digunakan untuk melakukan<br />verifikasi pada menu perubahan data
          </p>
        </div>

        {/* PIN inputs */}
        <div className="flex justify-center gap-3">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pin[i]}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 focus:border-[#184087] rounded-xl bg-white outline-none transition-colors"
            />
          ))}
        </div>

        <div className="flex-1" />

        {/* Simpan button */}
        <button
          onClick={() => setShowSuccess(true)}
          className="w-full bg-[#009B4D] text-white font-bold text-base py-4 rounded-2xl mb-6"
        >
          Simpan
        </button>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Apakah Anda yakin ingin meninggalkan halaman ini?
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Perubahan yang Anda buat akan tidak tersimpan dan akan kembali pada halaman perubahan data peserta
            </p>
            <div className="flex gap-2 w-full mt-1">
              <button
                type="button"
                onClick={() => router.push("/profil/ubah-kata-sandi")}
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

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-10 max-w-[430px] mx-auto">
          <div className="bg-white rounded-2xl px-5 py-6 flex flex-col items-center gap-3 w-full shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#009B4D]" strokeWidth={1.5} />
            </div>
            <h2 className="text-gray-900 font-bold text-base text-center leading-snug">
              Proses Perubahan PIN Anda Berhasil
            </h2>
            <p className="text-gray-500 text-xs text-center leading-relaxed">
              Anda mulai dapat menggunakan PIN baru Anda untuk melakukan perubahan data
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




