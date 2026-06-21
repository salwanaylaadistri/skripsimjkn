export type UserLevel = "pemula" | "mahir";

export interface UserSession {
  userId: string;
  level: UserLevel;
  sessionCount: number;
  isFirstSession: boolean;
}

export interface InteractionData {
  userId?: string;
  sessionCount: number;
  sessionDuration: number;
  uniqueFeatureAccessed: number;
  featureFrequency: Record<string, number>;
  taskCompletionRate: number;
  taskTime: number;
  errorCount: number;
  tutorialAccessed: number;
  shortcutUsed: number;
  // frekuensi per fitur untuk RFR
  freqAntrean: number;
  freqRiwayat: number;
  freqPerubahanData: number;
  // internal tracking, tidak dikirim langsung
  taskAttempted: number;
  taskCompleted: number;
  taskTimeTotal: number;
}

export interface Feature {
  id: string;
  name: string;
  icon: string;
  route: string;
  relevanceScore?: number;
}
