"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserLevel, InteractionData } from "@/lib/types";
import { initAdaptiveFlag, isAdaptive } from "@/lib/adaptiveFlag";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

interface UserLevelContextType {
  userLevel: UserLevel;
  setUserLevel: (level: UserLevel) => void;
  isFirstSession: boolean;
  sessionCount: number;
  recordInteraction: (feature: string) => void;
  recordTutorial: () => void;
  recordShortcut: () => void;
  recordTaskCompletion: (success: boolean, durationSeconds: number) => void;
  recordError: () => void;
  interactionData: InteractionData;
  featureOrder: string[];
  isPredicting: boolean;
}

const defaultInteraction: InteractionData = {
  sessionCount: 0,
  sessionDuration: 0,
  uniqueFeatureAccessed: 0,
  featureFrequency: {},
  taskCompletionRate: 0,
  taskTime: 0,
  errorCount: 0,
  tutorialAccessed: 0,
  shortcutUsed: 0,
  freqAntrean: 0,
  freqRiwayat: 0,
  freqPerubahanData: 0,
  taskAttempted: 0,
  taskCompleted: 0,
  taskTimeTotal: 0,
};

const UserLevelContext = createContext<UserLevelContextType>({
  userLevel: "pemula",
  setUserLevel: () => {},
  isFirstSession: true,
  sessionCount: 0,
  recordInteraction: () => {},
  recordTutorial: () => {},
  recordShortcut: () => {},
  interactionData: defaultInteraction,
  recordTaskCompletion: () => {},
  recordError: () => {},
  featureOrder: ["antrean", "riwayat", "perubahan_data"],
  isPredicting: false,
});

export function UserLevelProvider({ children }: { children: ReactNode }) {
  const [userLevel, setUserLevelState] = useState<UserLevel>("pemula");
  const [isFirstSession, setIsFirstSession] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [interactionData, setInteractionData] = useState<InteractionData>(defaultInteraction);
  const [sessionStart] = useState(Date.now());
  const [featureOrder, setFeatureOrder] = useState<string[]>(["antrean", "riwayat", "perubahan_data"]);
  const [isPredicting, setIsPredicting] = useState(false);

  // Ref untuk selalu punya nilai terbaru saat event handler dipanggil
  const interactionRef = useRef<InteractionData>(defaultInteraction);
  const sessionCountRef = useRef<number>(0);

  // Sinkronkan ref setiap kali state berubah
  useEffect(() => { interactionRef.current = interactionData; }, [interactionData]);
  useEffect(() => { sessionCountRef.current = sessionCount; }, [sessionCount]);

  // Simpan per-user key setiap kali ada interaksi bermakna
  useEffect(() => {
    if (interactionData.uniqueFeatureAccessed > 0) {
      const currentId = localStorage.getItem("jkn_user_id");
      if (currentId) {
        const duration = Math.floor((Date.now() - sessionStart) / 1000);
        const snapshot = { ...interactionData, sessionDuration: duration, userId: currentId };
        localStorage.setItem(`jkn_interaction_data_${currentId}`, JSON.stringify(snapshot));
      }
    }
  }, [interactionData]);

  const runPredict = () => {
    const storedCount = localStorage.getItem("jkn_session_count");
    const userId = localStorage.getItem("jkn_user_id");
    const ownerId = localStorage.getItem("jkn_owner_id");

    // Reset state ke default dulu — mencegah nilai akun sebelumnya tampil
    setUserLevelState(isAdaptive() ? "pemula" : "mahir");
    setIsFirstSession(true);
    setFeatureOrder(["antrean", "riwayat", "perubahan_data"]);
    setIsPredicting(false);

    const isSameUser = userId && ownerId === userId;
    if (!userId || !isSameUser) return;

    const prevData = localStorage.getItem(`jkn_interaction_data_${userId}`);
    const prevParsed = prevData ? (JSON.parse(prevData) as InteractionData) : null;

    if (!prevParsed || prevParsed.uniqueFeatureAccessed <= 0) return;
    if (prevParsed.userId && prevParsed.userId !== userId) return;

    const d = prevParsed;
    const totalFreq = Object.values(d.featureFrequency).reduce((a, b) => a + b, 0);
    const count = storedCount ? parseInt(storedCount) : 0;

    setIsPredicting(true);
    setTimeout(() => {
      fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_count:           count,
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
      })
        .then((res) => res.json())
        .then((result) => {
          const currentUserId = localStorage.getItem("jkn_user_id");
          if (currentUserId !== userId) return;
          if (result.label) {
            setUserLevelState(result.label as UserLevel);
            localStorage.setItem("jkn_user_level", result.label);
            setIsFirstSession(false);
          }
          if (result.feature_order) {
            setFeatureOrder(result.feature_order);
            localStorage.setItem("jkn_feature_order", JSON.stringify(result.feature_order));
          }
        })
        .catch(() => {})
        .finally(() => setIsPredicting(false));
    }, 50);
  };

  useEffect(() => {
    // Baca flag A/B dari URL dan simpan ke sessionStorage
    initAdaptiveFlag();

    const storedCount = localStorage.getItem("jkn_session_count");

    let count = storedCount ? parseInt(storedCount) : 0;
    if (!sessionStorage.getItem("jkn_current_session")) {
      count = count + 1;
      sessionStorage.setItem("jkn_current_session", "1");
      localStorage.setItem("jkn_session_count", String(count));
    }
    setSessionCount(count);

    // Grup B (statis): skip predict, tampilkan layout tanpa deskripsi (seperti Mobile JKN asli)
    if (!isAdaptive()) {
      setUserLevelState("mahir");
      return;
    }

    // Jalankan predict saat pertama mount
    runPredict();

    // Jalankan ulang setiap kali ada login baru (event dari login page)
    window.addEventListener("jkn_login", runPredict);
    return () => window.removeEventListener("jkn_login", runPredict);
  }, []);

  const sendInteractionData = () => {
    if (sessionStorage.getItem("jkn_session_sent") === "1") return;
    // Jangan rekam sesi dari halaman /debug
    if (window.location.pathname === "/debug") return;
    sessionStorage.setItem("jkn_session_sent", "1");

    const data = interactionRef.current;
    const duration = Math.floor((Date.now() - sessionStart) / 1000);

    // Minimum 10 detik agar sesi yang sangat singkat tidak terhitung
    if (duration < 10) return;

    const currentId = localStorage.getItem("jkn_user_id") ?? undefined;
    const updated: InteractionData = { ...data, sessionDuration: duration, userId: currentId };
    localStorage.setItem("jkn_interaction_data", JSON.stringify(updated));
    if (currentId) {
      localStorage.setItem("jkn_owner_id", currentId);
      // Hanya timpa per-user key kalau ada interaksi bermakna (minimal 1 fitur diakses)
      if (updated.uniqueFeatureAccessed > 0) {
        localStorage.setItem(`jkn_interaction_data_${currentId}`, JSON.stringify(updated));
      }
    }

    const totalFreq = Object.values(updated.featureFrequency).reduce((a, b) => a + b, 0);

    const storedUserId = localStorage.getItem("jkn_user_id");
    const payload = {
      user_id:                  storedUserId ? parseInt(storedUserId) : null,
      session_count:            sessionCountRef.current,
      session_duration:         duration,
      unique_feature_accessed:  updated.uniqueFeatureAccessed  ?? 0,
      feature_frequency:        totalFreq                      ?? 0,
      task_completion_rate:     updated.taskCompletionRate     ?? 0,
      task_time:                updated.taskTime               ?? 0,
      error_count:              updated.errorCount             ?? 0,
      tutorial_accessed:        updated.tutorialAccessed       ?? 0,
      shortcut_used:            updated.shortcutUsed           ?? 0,
      freq_antrean:             updated.freqAntrean            ?? 0,
      freq_riwayat:             updated.freqRiwayat            ?? 0,
      freq_perubahan_data:      updated.freqPerubahanData      ?? 0,
      label:                    null,
    };

    fetch(`${BACKEND_URL}/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  };

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        sendInteractionData();
      }
    };
    const handleUnload = () => sendInteractionData();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  const setUserLevel = (level: UserLevel) => {
    setUserLevelState(level);
    localStorage.setItem("jkn_user_level", level);
    setIsFirstSession(false);
  };

  const recordInteraction = (feature: string) => {
    setInteractionData((prev) => {
      const freq = { ...prev.featureFrequency };
      freq[feature] = (freq[feature] || 0) + 1;
      const uniqueCount = Object.keys(freq).length;
      return {
        ...prev,
        featureFrequency: freq,
        uniqueFeatureAccessed: uniqueCount,
        freqAntrean:       feature === "antrean"        ? prev.freqAntrean + 1       : prev.freqAntrean,
        freqRiwayat:       feature === "riwayat"        ? prev.freqRiwayat + 1       : prev.freqRiwayat,
        freqPerubahanData: feature === "perubahan_data" ? prev.freqPerubahanData + 1 : prev.freqPerubahanData,
      };
    });
  };

  const recordTutorial = () => {
    setInteractionData((prev) => ({
      ...prev,
      tutorialAccessed: prev.tutorialAccessed + 1,
    }));
  };

  const recordShortcut = () => {
    setInteractionData((prev) => ({
      ...prev,
      shortcutUsed: prev.shortcutUsed + 1,
    }));
  };

  const recordTaskCompletion = (success: boolean, durationSeconds: number) => {
    setInteractionData((prev) => {
      const attempted = prev.taskAttempted + 1;
      const completed = prev.taskCompleted + (success ? 1 : 0);
      const timeTotal = prev.taskTimeTotal + durationSeconds;
      const rate = parseFloat((completed / attempted).toFixed(2));
      const avgTime = attempted > 0 ? parseFloat((timeTotal / attempted).toFixed(2)) : 0;
      return {
        ...prev,
        taskAttempted: attempted,
        taskCompleted: completed,
        taskTimeTotal: timeTotal,
        taskCompletionRate: rate,
        taskTime: avgTime,
      };
    });
  };

  const recordError = () => {
    setInteractionData((prev) => ({
      ...prev,
      errorCount: prev.errorCount + 1,
    }));
  };

  return (
    <UserLevelContext.Provider
      value={{
        userLevel,
        setUserLevel,
        isFirstSession,
        sessionCount,
        recordInteraction,
        recordTutorial,
        recordShortcut,
        recordTaskCompletion,
        recordError,
        interactionData,
        featureOrder,
        isPredicting,
      }}
    >
      {children}
    </UserLevelContext.Provider>
  );
}

export const useUserLevel = () => useContext(UserLevelContext);


