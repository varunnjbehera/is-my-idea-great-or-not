"use client";

import type { BrutalityMode } from "@/lib/schema";

export function BrutalityToggle({
  mode,
  onChange,
}: {
  mode: BrutalityMode;
  onChange: (m: BrutalityMode) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <span className={`text-sm font-semibold ${mode === "fair" ? "text-ink" : "text-muted"}`}>
        😇 BE FAIR
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={mode === "horrible"}
        aria-label="Brutality mode: fair or horrible"
        onClick={() => onChange(mode === "fair" ? "horrible" : "fair")}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") onChange("fair");
          if (e.key === "ArrowRight") onChange("horrible");
        }}
        className="relative h-9 w-20 rounded-full border-2 border-ink bg-white px-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span
          aria-hidden
          className={`block h-6 w-6 rounded-full bg-ink transition-transform ${
            mode === "horrible" ? "translate-x-10" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`text-sm font-semibold ${mode === "horrible" ? "text-ink" : "text-muted"}`}>
        BE HORRIBLE 👹
      </span>
    </div>
  );
}
