"use client";

import { useState } from "react";
import type { JudgmentReport } from "@/lib/schema";
import { buildFullReportText, buildRoastCardText } from "@/lib/copy";
import { renderShareCard } from "@/lib/share-card";

export function ShareActions({ report }: { report: JudgmentReport }) {
  const [msg, setMsg] = useState("");

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg(`${label} copied. Go humiliate a friend.`);
    } catch {
      setMsg("Copy failed. Select and copy manually like it's 2009.");
    }
    setTimeout(() => setMsg(""), 3000);
  }

  async function nativeShare() {
    const text = buildRoastCardText(report);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Is My Idea Great or Not?", text });
        return;
      }
      await copyText(text, "Roast card");
    } catch {
      /* user cancelled */
    }
  }

  async function downloadCard() {
    try {
      setMsg("Rendering your shame as PNG…");
      const blob = await renderShareCard(report);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `idea-verdict-${report.overallScore}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMsg("Shame exported. Post responsibly.");
      // Offer native file share where supported
      try {
        const file = new File([blob], "verdict.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Is My Idea Great or Not?" });
        }
      } catch {
        /* ignore */
      }
    } catch {
      setMsg("Card render failed. Screenshot it like an animal.");
    }
    setTimeout(() => setMsg(""), 3500);
  }

  return (
    <section aria-label="Share" className="card mt-8 rounded-xl p-6 text-center">
      <h3 className="font-display text-xl font-bold">Ruin someone else&apos;s day</h3>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => copyText(buildRoastCardText(report), "Roast card")}
          className="rounded-full border-2 border-ink px-5 py-2 font-semibold hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Copy roast card
        </button>
        <button
          onClick={() => copyText(buildFullReportText(report), "Full report")}
          className="rounded-full border-2 border-ink px-5 py-2 font-semibold hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Copy full report
        </button>
        <button
          onClick={nativeShare}
          className="rounded-full border-2 border-ink px-5 py-2 font-semibold hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Share
        </button>
        <button
          onClick={downloadCard}
          className="rounded-full bg-ink px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Download card (PNG)
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-muted">
        {msg}
      </p>
    </section>
  );
}
