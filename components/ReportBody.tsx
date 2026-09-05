import type { JudgmentReport } from "@/lib/schema";

export function ReportBody({ report }: { report: JudgmentReport }) {
  return (
    <div className="mt-8 space-y-6">
      <section className="card rounded-xl p-6" aria-label="Your idea, apparently">
        <h3 className="font-display text-xl font-bold uppercase tracking-wide">Your idea, apparently</h3>
        <p className="mt-2 leading-relaxed">{report.ideaSummary}</p>
      </section>

      {report.sections.map((s, i) => (
        <section
          key={`${s.title}-${i}`}
          aria-label={s.title}
          className={`rise rounded-xl p-6 ${
            i === 0 ? "border-2 border-ink bg-[#141210] text-[#FAF7F2]" : "card"
          }`}
          style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
        >
          <h3 className="font-display text-xl font-bold uppercase tracking-wide">{s.title}</h3>
          <p className={`mt-2 whitespace-pre-wrap leading-relaxed ${i === 0 ? "" : ""}`}>{s.body}</p>
          {s.bullets?.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {s.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          ) : null}
          {s.punchline ? <p className="mt-3 font-bold italic">“{s.punchline}”</p> : null}
        </section>
      ))}

      {report.plotTwist ? (
        <section aria-label={report.plotTwist.title} className="rounded-xl border-2 border-dashed border-accent bg-[#FFF7ED] p-6">
          <h3 className="font-display text-xl font-black uppercase text-accent">
            🌀 {report.plotTwist.title}
          </h3>
          <p className="mt-2 leading-relaxed">{report.plotTwist.body}</p>
        </section>
      ) : null}

      {report.recommendation ? (
        <section aria-label="What would make it work" className="card rounded-xl p-6">
          <h3 className="font-display text-xl font-bold uppercase">How to save it (maybe)</h3>
          <p className="mt-2 font-bold">{report.recommendation.headline}</p>
          <p className="mt-1 leading-relaxed">{report.recommendation.body}</p>
        </section>
      ) : null}

      <p className="font-display rounded-xl bg-ink px-6 py-5 text-center text-xl font-bold text-[#FAF7F2]">
        {report.finalSentence}
      </p>
    </div>
  );
}
