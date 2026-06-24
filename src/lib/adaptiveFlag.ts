/**
 * A/B Testing flag — dibaca dari sessionStorage.
 * Grup A (adaptif): buka /  → sessionStorage tidak punya "adaptive=false"
 * Grup B (statis):  buka /?adaptive=false  → flag tersimpan di sessionStorage
 *
 * Flag di-set satu kali saat landing, lalu tetap untuk seluruh sesi tab tersebut.
 * Dua tab/window berbeda = dua sesi independen.
 */

export function initAdaptiveFlag(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("adaptive") === "false") {
    sessionStorage.setItem("jkn_adaptive", "false");
  } else if (params.get("adaptive") === "true") {
    sessionStorage.removeItem("jkn_adaptive");
  }
}

export function isAdaptive(): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem("jkn_adaptive") !== "false";
}
