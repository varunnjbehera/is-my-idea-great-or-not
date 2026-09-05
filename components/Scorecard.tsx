import type { JudgmentReport } from "@/lib/schema";

export function Scorecard({ report }: { report: JudgmentReport }) {
  if (!report.dimensions.length) return null;
  return (
    <section aria-label="Scorecard" className="mt-8">
      <h3 className="font-display text-2xl font-bold">The scorecard of suffering</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {report.dimensions.map((d) => (
          <article key={d.name} className="card rounded-xl p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-bold">{d.name}</h4>
              <span className="font-display text-2xl font-black" aria-hidden="true">
                {d.score}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={d.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${d.score} out of 100`}
              aria-label={`${d.name} score`}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
            >
              <div className="h-full rounded-full bg-ink" style={{ width: `${d.score}%` }} aria-hidden="true" />
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed">{d.summary}</p>
            {d.roast ? <p className="mt-2 text-[0.95rem] italic text-muted">“{d.roast}”</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
