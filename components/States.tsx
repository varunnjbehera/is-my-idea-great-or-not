import type { JudgmentReport } from "@/lib/schema";

export function BrokenBotState({ report }: { report: JudgmentReport }) {
  return (
    <section aria-label="Your idea broke the bot" className="rise mt-8 rounded-2xl border-2 border-ink bg-black p-10 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Safety override</p>
      <h2 className="font-display mt-3 text-4xl font-black sm:text-5xl">YOUR IDEA BROKE THE BOT</h2>
      <p className="mx-auto mt-4 max-w-lg text-lg italic text-white/85">
        “{report.verdictPunchline || "Absolutely not. I'm not touching this one."}”
      </p>
      <p className="mx-auto mt-3 max-w-lg text-sm text-white/60">
        {report.finalSentence || "Some ideas are so bad they void the warranty."}
      </p>
    </section>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section aria-label="Error" role="alert" className="card mt-8 rounded-2xl p-8 text-center">
      <h2 className="font-display text-3xl font-black">THE JUDGE IS CURRENTLY UNAVAILABLE</h2>
      <p className="mt-2 italic text-muted">“Even I have limits. Apparently the robots do too.”</p>
      <p className="mx-auto mt-3 max-w-md text-sm">{message}</p>
      <button
        onClick={onRetry}
        className="mt-5 rounded-full bg-ink px-6 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        Try again
      </button>
    </section>
  );
}
