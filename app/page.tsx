"use client";

import { useEffect, useRef, useState } from "react";
import type { BrutalityMode, JudgmentReport } from "@/lib/schema";
import { EXAMPLE_IDEAS, MAX_IDEA_LENGTH, PLACEHOLDER_ROTATION } from "@/lib/copy";
import { BrutalityToggle } from "@/components/BrutalityToggle";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { VerdictHero } from "@/components/VerdictHero";
import { Scorecard } from "@/components/Scorecard";
import { ReportBody } from "@/components/ReportBody";
import { ShareActions } from "@/components/ShareActions";
import { BrokenBotState, ErrorState } from "@/components/States";

type Phase = "idle" | "analyzing" | "success" | "error";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<BrutalityMode>("horrible");
  const [phase, setPhase] = useState<Phase>("idle");
  const [report, setReport] = useState<JudgmentReport | null>(null);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setPlaceholderIdx((i) => (i + 1) % PLACEHOLDER_ROTATION.length), 4000);
    return () => clearInterval(t);
  }, []);

  const remaining = MAX_IDEA_LENGTH - idea.length;

  async function handleJudge(example?: string) {
    const value = (example ?? idea).trim();
    if (!value) {
      setFieldError("Give the machine something to destroy. Anything. It judges all.");
      return;
    }
    if (value.length > MAX_IDEA_LENGTH) {
      setFieldError(`That idea is too long (${value.length}/${MAX_IDEA_LENGTH}). Trim the manifesto.`);
      return;
    }
    setFieldError("");
    setPhase("analyzing");
    setError("");
    setReport(null);

    try {
      const res = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: value, mode }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data as { message?: string })?.message ?? `Request failed (${res.status}). The judge is moody.`
        );
      }
      setReport(data as JudgmentReport);
      setPhase("success");
      requestAnimationFrame(() => resultRef.current?.focus?.());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something broke. The judge blames you.");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle");
    setReport(null);
    setError("");
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const isBrokeBot = report?.status === "broke_bot";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <p className="font-display text-sm font-black uppercase tracking-[0.2em]">
            Is my idea great <span className="text-accent">or not?</span>
          </p>
          <p className="hidden text-xs text-muted sm:block">No market research was performed.</p>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-3xl px-6 pb-20 pt-12 sm:pt-16">
        <div className="text-center">
          <h1 className="font-display text-5xl font-black leading-[0.95] sm:text-7xl">
            IS MY IDEA
            <br />
            GREAT OR NOT?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#3A352F]">
            This machine is not here to validate you. It is here to make you regret having ideas.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm italic text-muted">
            No market research was performed. No psychologists were consulted. One language model was
            given a dangerous amount of confidence.
          </p>
        </div>

        <form
          aria-label="Submit your idea"
          className="card mt-8 rounded-2xl p-5 sm:p-7"
          onSubmit={(e) => {
            e.preventDefault();
            handleJudge();
          }}
        >
          <label htmlFor="idea" className="text-sm font-bold uppercase tracking-wider">
            Your terrible idea
          </label>
          <textarea
            id="idea"
            value={idea}
            onChange={(e) => {
              setIdea(e.target.value);
              if (fieldError) setFieldError("");
            }}
            onKeyDown={(e) => {
              // Enter alone adds a newline; Ctrl+Enter (Win/Linux) or Cmd+Enter (macOS) submits.
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleJudge();
              }
            }}
            rows={5}
            maxLength={MAX_IDEA_LENGTH + 200}
            placeholder={PLACEHOLDER_ROTATION[placeholderIdx]}
            aria-describedby="idea-help idea-count"
            aria-invalid={Boolean(fieldError)}
            className="mt-2 w-full resize-y rounded-xl border-2 border-ink bg-white p-4 text-lg leading-relaxed placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ink"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted">
            <span id="idea-help">Business plan, recipe, invention, or terrible shower thought. We judge all. Press Ctrl+Enter (Cmd+Enter on Mac) to submit.</span>
            <span id="idea-count" aria-live="polite" className={remaining < 0 ? "font-bold text-red-700" : ""}>
              {idea.length}/{MAX_IDEA_LENGTH}
            </span>
          </div>
          {fieldError ? (
            <p role="alert" className="mt-2 text-sm font-semibold text-red-700">
              {fieldError}
            </p>
          ) : null}

          <BrutalityToggle mode={mode} onChange={setMode} />

          <button
            type="submit"
            disabled={phase === "analyzing"}
            className="font-display mt-5 w-full rounded-xl bg-ink px-6 py-4 text-2xl font-black uppercase tracking-wide text-[#FAF7F2] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {phase === "analyzing" ? "Judging…" : "🔥 Destroy my idea"}
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            {mode === "fair" ? "Mercy requested. Mercy not guaranteed." : "No mercy. You were warned."}
          </p>
        </form>

        <section aria-label="Example ideas" className="mt-6">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-muted">
            Or steal one of these disasters:
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {EXAMPLE_IDEAS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setIdea(ex);
                  handleJudge(ex);
                }}
                disabled={phase === "analyzing"}
                className="max-w-full truncate rounded-full border border-line bg-white px-4 py-1.5 text-sm hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                title={ex}
              >
                {ex.length > 52 ? `${ex.slice(0, 52)}…` : ex}
              </button>
            ))}
          </div>
        </section>

        {phase === "analyzing" ? <AnalysisLoader /> : null}

        {phase === "error" ? <ErrorState message={error} onRetry={() => handleJudge()} /> : null}

        {phase === "success" && report ? (
          <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
            {isBrokeBot ? (
              <BrokenBotState report={report} />
            ) : (
              <>
                <VerdictHero report={report} mode={mode} />
                <Scorecard report={report} />
                <ReportBody report={report} />
                <ShareActions report={report} />
              </>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={reset}
                className="rounded-full border-2 border-ink px-6 py-2 font-semibold hover:bg-ink hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Judge another idea
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="rounded-full border border-line bg-white px-6 py-2 text-sm text-muted hover:border-ink hover:text-ink"
              >
                Back to top
              </button>
            </div>
          </div>
        ) : null}

        {!report && phase === "idle" ? (
          <p className="mt-10 text-center text-sm text-muted">
            Skeptic first. Prosecutor second. Fair judge only at the end.
          </p>
        ) : null}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center text-xs text-muted">
          <p>
            Useful judgment delivered through an entertainingly hostile personality. The machine attacks
            ideas, never people.
          </p>
        </div>
      </footer>
    </div>
  );
}
