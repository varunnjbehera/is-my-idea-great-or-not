"use client";

import { useEffect, useState } from "react";
import { LOADER_LINES } from "@/lib/copy";

export function AnalysisLoader() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % LOADER_LINES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="card rise mt-8 rounded-2xl p-8 text-center"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink">
        <span className="h-3 w-3 animate-[pulse-dot_1s_infinite] rounded-full bg-ink" aria-hidden />
      </div>
      <p className="font-display mt-4 text-2xl">Investigating your poor decision…</p>
      <p key={idx} className="rise mt-2 text-muted">
        {LOADER_LINES[idx]}
      </p>
    </div>
  );
}
