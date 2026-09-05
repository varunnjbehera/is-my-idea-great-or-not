"use client";

import { useEffect, useState } from "react";
import type { JudgmentReport } from "@/lib/schema";
import { severityBand } from "@/lib/severity";

export function VerdictHero({ report, mode }: { report: JudgmentReport; mode: string }) {
  const [shown, setShown] = useState(0);
  const band = severityBand(report.overallScore);
  const rare = report.overallScore >= 85;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(report.overallScore);
      return;
    }
    let v = 0;
    const step = Math.max(1, Math.round(report.overallScore / 40));
    const t = setInterval(() => {
      v += step;
      if (v >= report.overallScore) {
        setShown(report.overallScore);
        clearInterval(t);
      } else setShown(v);
    }, 40);
    return () => clearInterval(t);
  }, [report.overallScore]);

  return (
    <section aria-label="Verdict" className="rise mt-8 overflow-hidden rounded-2xl border-2 border-ink bg-[#FFFDF9]">
      <div className="border-b border-line px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Official judgment · {mode === "fair" ? "mercy requested" : "no mercy"} · {band.label}
        {rare ? " · ANOMALY — the machine is upset" : ""}
      </div>
      <div className="px-6 py-8 text-center sm:px-10">
        <p className="sr-only">
          Score {report.overallScore} out of 100. Verdict {report.verdict}. {report.verdictPunchline}
        </p>
        <div aria-hidden className="font-display font-black leading-none" style={{ color: band.color }}>
          <span className="text-[5.5rem] sm:text-[7rem]">{shown}</span>
          <span className="text-3xl text-muted"> / 100</span>
        </div>
        <h2 className="font-display mt-2 text-4xl font-black uppercase sm:text-5xl">{report.verdict}</h2>
        <p className="mx-auto mt-3 max-w-xl text-lg italic text-[#3A352F]">“{report.verdictPunchline}”</p>
        {report.intentSummary ? (
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted">{report.intentSummary}</p>
        ) : null}
      </div>
    </section>
  );
}
