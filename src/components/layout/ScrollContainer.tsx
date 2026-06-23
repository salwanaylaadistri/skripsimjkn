"use client";

export default function ScrollContainer({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex-1 overflow-y-auto no-scrollbar"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" } as React.CSSProperties}
    >
      {children}
    </main>
  );
}


