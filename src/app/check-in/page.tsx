"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flashlight, CheckCircle2, RefreshCcw, CameraOff } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";
import { useUserLevel } from "@/contexts/UserLevelContext";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

export default function CheckInPage() {
  useRequireAuth();
  const router = useRouter();
  const { recordInteraction } = useUserLevel();
  useEffect(() => { recordInteraction("check_in"); }, []);
  const [torch, setTorch] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [showSuccess, setShowSuccess] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async (facing: "environment" | "user") => {
    // Stop existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError("Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan.");
    }
  };

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [facingMode]);

  const toggleTorch = async () => {
    const newTorch = !torch;
    setTorch(newTorch);
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: newTorch } as MediaTrackConstraintSet] });
    } catch {
      // Torch not supported on this device/browser â€” visual toggle tetap berjalan
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div style={{ background: GRADIENT }}>
          <StatusBar />
          <div className="relative px-4 pb-5 pt-5 flex items-center">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center z-10"
            >
              <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
            </button>
            <h1 className="text-white font-bold text-lg absolute left-1/2 -translate-x-1/2">
              Check In
            </h1>
          </div>
        </div>
      </div>

      {/* Area kamera */}
      <div className="flex-1 relative flex flex-col items-center justify-center">

        {/* Video feed kamera */}
        {!cameraError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-3 px-8">
            <CameraOff className="w-12 h-12 text-gray-500" strokeWidth={1.5} />
            <p className="text-gray-400 text-sm text-center leading-relaxed">{cameraError}</p>
          </div>
        )}

        {/* Overlay gelap atas & bawah */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

        {/* Teks instruksi */}
        <p className="absolute top-[22%] text-white text-sm font-medium text-center px-8 leading-snug z-10">
          Arahkan kamera ke QR Code yang tersedia di loket pendaftaran
        </p>

        {/* Kotak scan */}
        <div className="relative w-60 h-60 z-10">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
          <div className="absolute inset-x-2 h-0.5 bg-[#46ADDC] opacity-90 animate-scan-line" />
        </div>

        {/* Info kunjungan */}
        <div className="absolute bottom-[18%] z-10 flex flex-col items-center gap-2 px-8 w-full">
          <div className="bg-white rounded-2xl px-5 py-3 flex flex-col gap-1.5 w-full">
            <p className="text-gray-400 text-xs text-center">Kunjungan hari ini</p>
            <p className="text-[#184087] font-bold text-sm text-center">RSUD Panembahan Senopati</p>
            <p className="text-gray-500 text-xs text-center">Selasa, 28 April 2024 Â· 14:00 WIB</p>
          </div>
        </div>

        {/* Label kamera aktif */}
        <p className="absolute bottom-24 z-10 text-white/60 text-xs">
          {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
        </p>

        {/* Tombol kontrol */}
        <div className="absolute bottom-6 z-10 flex items-center gap-8">
          <button
            onClick={toggleTorch}
            className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors ${torch ? "bg-yellow-400 border-yellow-400" : "bg-black/40 border-white/40"}`}
          >
            <Flashlight className={`w-6 h-6 ${torch ? "text-black" : "text-white"}`} strokeWidth={1.8} />
          </button>

          {/* Tombol simulasi berhasil scan */}
          <button
            onClick={() => setShowSuccess(true)}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
          >
            <div className="w-12 h-12 rounded-full border-4 border-gray-300" />
          </button>

          {/* Flip kamera */}
          <button
            onClick={() => setFacingMode(f => f === "environment" ? "user" : "environment")}
            className="w-14 h-14 rounded-full bg-black/40 border-2 border-white/40 flex items-center justify-center"
          >
            <RefreshCcw className="w-6 h-6 text-white" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Modal sukses check in */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-8 max-w-[430px] mx-auto">
          <div className="bg-white rounded-3xl px-6 py-8 flex flex-col items-center gap-4 w-full shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#009B4D]/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#009B4D]" strokeWidth={1.5} />
            </div>
            <h2 className="text-gray-900 font-bold text-lg text-center">Check In Berhasil!</h2>
            <div className="flex flex-col gap-1.5 w-full bg-gray-50 rounded-2xl px-4 py-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Fasilitas</span>
                <span className="text-gray-800 text-xs font-semibold text-right">RSUD Panembahan Senopati</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Tanggal</span>
                <span className="text-gray-800 text-xs font-semibold">Selasa, 28 April 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Jam</span>
                <span className="text-gray-800 text-xs font-semibold">14:00 WIB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">No. Antrean</span>
                <span className="text-[#009B4D] text-sm font-bold">A-014</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs text-center leading-relaxed">
              Silakan tunggu hingga nomor antrean Anda dipanggil
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-[#009B4D] text-white font-bold text-sm py-3.5 rounded-2xl mt-1"
            >
              Kembali ke Beranda
            </button>
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
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}



