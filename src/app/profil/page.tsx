"use client";
import { useRequireAuth } from "@/lib/useRequireAuth";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Calculator, KeyRound, Lock, ShieldCheck, Accessibility, Fingerprint, Bell, BookOpen, LogOut, Pencil, User, Trash2 } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

type MenuItem = {
  icon: React.ElementType | null;
  label: string;
  type: "chevron" | "toggle";
  href?: string;
  image?: string;
};

const menuItems: MenuItem[] = [
  { icon: Calculator, label: "Kalkulator Kesehatan", type: "chevron" },
  { icon: KeyRound, label: "Ubah PIN", type: "chevron", href: "/profil/ubah-pin" },
  { icon: Lock, label: "Ubah Kata Sandi", type: "chevron", href: "/profil/ubah-kata-sandi" },
  { icon: ShieldCheck, label: "Keamanan dan Privasi", type: "chevron" },
  { icon: null, label: "Bugar", type: "chevron", image: "/images/logobugar.png" },
  { icon: Accessibility, label: "Fitur Aksesibilitas", type: "toggle" },
  { icon: Fingerprint, label: "Login dengan Biometrik", type: "toggle" },
  { icon: Bell, label: "Notifikasi", type: "toggle" },
  { icon: BookOpen, label: "Panduan", type: "chevron" },
  { icon: LogOut, label: "Keluar", type: "chevron" },
  { icon: Trash2, label: "Hapus Akun", type: "chevron" },
];

function clearSession() {
  const keys = [
    "jkn_user_id", "jkn_user_level", "jkn_feature_order",
    "jkn_session_count", "jkn_interaction_data", "jkn_user_nama",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
  sessionStorage.clear();
}

export default function ProfilPage() {
  useRequireAuth();
  const router = useRouter();
  const [userName, setUserName] = useState("Pengguna");
  const [userNik, setUserNik] = useState("-");
  const [userHp, setUserHp] = useState("-");
  useEffect(() => {
    setUserName(localStorage.getItem("jkn_user_nama") ?? "Pengguna");
    setUserNik(localStorage.getItem("jkn_nik") ?? "-");
    setUserHp(localStorage.getItem("jkn_nomor_hp") ?? "-");
  }, []);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Fitur Aksesibilitas": false,
    "Login dengan Biometrik": false,
    "Notifikasi": false,
  });
  const [showHapusModal, setShowHapusModal] = useState(false);
  const [hapusPassword, setHapusPassword] = useState("");
  const [hapusError, setHapusError] = useState("");
  const [hapusLoading, setHapusLoading] = useState(false);

  const handleToggle = (label: string) => {
    setToggles((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleKeluar = () => {
    clearSession();
    router.push("/login");
  };

  const handleHapusAkun = async () => {
    const userId = localStorage.getItem("jkn_user_id");
    if (!userId) return;
    setHapusLoading(true);
    setHapusError("");
    try {
      const res = await fetch(`${BACKEND_URL}/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: parseInt(userId), password: hapusPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        setHapusError(err.detail ?? "Gagal menghapus akun.");
        return;
      }
      clearSession();
      router.push("/login");
    } catch {
      setHapusError("Tidak dapat terhubung ke server.");
    } finally {
      setHapusLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <div style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="pb-6 pt-6">
          <h1 className="text-white font-bold text-lg text-center">Profil</h1>
        </div>
      </div>

      {/* Avatar floating above card */}
      <div className="flex justify-center -mb-10 relative z-10 mt-4">
        <div className="w-20 h-20 rounded-full bg-[#F0E6D3] border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
          <User className="w-10 h-10 text-[#C8956C]" strokeWidth={1.5} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-6 flex flex-col gap-4">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm px-5 pt-14 pb-5 flex flex-col items-center">
          <h2 className="text-gray-900 font-bold text-base mt-1">{userName}</h2>
          <p className="text-gray-500 text-xs mt-0.5">NIK: {userNik}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-gray-500 text-xs">{userHp}</p>
            <Pencil className="w-3.5 h-3.5 text-[#46ADDC]" strokeWidth={2} />
          </div>
        </div>

        {/* Menu list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const isLast = i === menuItems.length - 1;
            return (
              <div key={item.label}>
                {"href" in item && item.href ? (
                  <Link
                    href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EBF4FB] flex items-center justify-center shrink-0">
                      {"image" in item && item.image ? (
                        <img src={item.image} alt={item.label} className="w-5 h-5 object-contain" />
                      ) : Icon ? (
                        <Icon className="w-4.5 h-4.5 text-[#184087]" strokeWidth={1.8} />
                      ) : null}
                    </div>
                    <span className="flex-1 text-left text-gray-800 text-sm font-medium">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
                  </Link>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors"
                    onClick={() => {
                      if (item.label === "Keluar") handleKeluar();
                      else if (item.label === "Hapus Akun") setShowHapusModal(true);
                      else if (item.type === "toggle") handleToggle(item.label);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#EBF4FB] flex items-center justify-center shrink-0">
                      {"image" in item && item.image ? (
                        <img src={item.image} alt={item.label} className="w-5 h-5 object-contain" />
                      ) : Icon ? (
                        <Icon className="w-4.5 h-4.5 text-[#184087]" strokeWidth={1.8} />
                      ) : null}
                    </div>
                    <span className="flex-1 text-left text-gray-800 text-sm font-medium">{item.label}</span>
                    {item.type === "chevron" ? (
                      <ChevronRight className="w-5 h-5 text-[#184087] shrink-0" />
                    ) : (
                      <div className={`w-11 h-6 rounded-full transition-colors shrink-0 ${toggles[item.label] ? "bg-[#46ADDC]" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition-transform ${toggles[item.label] ? "translate-x-5" : "translate-x-0.5"}`} />
                      </div>
                    )}
                  </button>
                )}
                {!isLast && <div className="h-px bg-gray-100 mx-4" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Hapus Akun */}
      {showHapusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-gray-900 font-bold text-base">Hapus Akun</h2>
              <p className="text-gray-500 text-sm text-center">
                Akun dan seluruh data kamu akan dihapus permanen. Masukkan kata sandi untuk konfirmasi.
              </p>
            </div>
            <input
              type="password"
              placeholder="Kata sandi"
              value={hapusPassword}
              onChange={(e) => setHapusPassword(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#46ADDC]"
            />
            {hapusError && <p className="text-red-500 text-xs text-center">{hapusError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowHapusModal(false); setHapusPassword(""); setHapusError(""); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleHapusAkun}
                disabled={hapusLoading || !hapusPassword}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium disabled:opacity-50"
              >
                {hapusLoading ? "Menghapus..." : "Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



