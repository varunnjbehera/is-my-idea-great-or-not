import { z } from "zod";

export const BrutalityModeSchema = z.enum(["fair", "horrible"]);
export type BrutalityMode = z.infer<typeof BrutalityModeSchema>;

export const JudgeRequestSchema = z.object({
  idea: z
    .string()
    .trim()
    .min(1, "Give the machine something to destroy.")
    .max(4000, "That idea is too long. The judge has limits."),
  mode: BrutalityModeSchema.default("horrible"),
});

export type JudgeRequest = z.infer<typeof JudgeRequestSchema>;

export const DimensionSchema = z.object({
  name: z.string().min(1).max(60),
  score: z.number().int().min(0).max(100),
  summary: z.string().min(1).max(400),
  roast: z.string().max(400).optional().nullable(),
});

export const ReportSectionSchema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(2500),
  bullets: z.array(z.string().min(1).max(300)).max(6).optional().nullable(),
  punchline: z.string().max(250).optional().nullable(),
});

export const PlotTwistSchema = z.object({
  title: z.string().min(1).max(80).default("PLOT TWIST"),
  body: z.string().min(1).max(1000),
});

export const RecommendationSchema = z.object({
  headline: z.string().min(1).max(140),
  body: z.string().min(1).max(1000),
});

export const ReportSchema = z.object({
  status: z.enum(["ok", "broke_bot"]).default("ok"),
  overallScore: z.number().int().min(0).max(100),
  severity: z.string().min(1).max(40),
  verdict: z.string().min(1).max(60),
  verdictPunchline: z.string().min(1).max(300),
  ideaSummary: z.string().min(1).max(800),
  intentSummary: z.string().max(400).optional().nullable(),
  dimensions: z.array(DimensionSchema).min(2).max(9),
  sections: z.array(ReportSectionSchema).min(1).max(10),
  plotTwist: PlotTwistSchema.optional().nullable(),
  recommendation: RecommendationSchema.optional().nullable(),
  finalSentence: z.string().min(1).max(400),
});

export type JudgmentReport = z.infer<typeof ReportSchema>;

/**
 * Defensive parse for untrusted model output. Never throws to UI; returns null on invalid shape.
 * - Strictly validates via ReportSchema (no silent clamping for "ok" reports).
 * - Soft-repairs only unambiguous cases: numeric scores arriving as strings
 *   (e.g. "17" -> 17). Arbitrary garbage still fails validation.
 * - Lenient clamping/defaults apply only to the "broke_bot" safety state.
 */
export function normalizeReport(raw: unknown): JudgmentReport | null {
  const parsed = ReportSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // Soft repair: coerce unambiguous numeric-string scores, then re-validate strictly.
  try {
    const repaired = softRepairScores(raw);
    if (repaired) {
      const reparsed = ReportSchema.safeParse(repaired);
      if (reparsed.success) return reparsed.data;
    }
  } catch {
    // fall through to broke_bot handling / null
  }

  try {
    const r = raw as Record<string, unknown>;
    if (!r || typeof r !== "object") return null;
    if (r.status === "broke_bot") {
      return {
        status: "broke_bot",
        overallScore: clampInt(r.overallScore, 0),
        severity: String(r.severity ?? "refused"),
        verdict: String(r.verdict ?? "YOUR IDEA BROKE THE BOT").slice(0, 60),
        verdictPunchline: String(
          r.verdictPunchline ?? "Absolutely not. I'm not touching this one."
        ).slice(0, 300),
        ideaSummary: String(r.ideaSummary ?? "Redacted for everyone's safety.").slice(0, 800),
        intentSummary: null,
        dimensions: [],
        sections: [],
        plotTwist: null,
        recommendation: null,
        finalSentence: String(
          r.finalSentence ?? "Some ideas are so bad they void the warranty."
        ).slice(0, 400),
      } as unknown as JudgmentReport;
    }
    return null;
  } catch {
    return null;
  }
}

function clampInt(v: unknown, fallback: number): number {
  let n: number;
  if (typeof v === "string") {
    const t = v.trim();
    // Only accept unambiguous numeric strings; never parse trailing garbage like "17abc".
    if (!/^-?\d+(\.\d+)?$/.test(t)) return fallback;
    n = Math.round(Number(t));
  } else if (typeof v === "number") {
    n = Math.round(v);
  } else {
    return fallback;
  }
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

/**
 * Return a copy of `raw` with unambiguous numeric-string scores coerced to numbers.
 * Returns null when `raw` is not a plain object. Leaves garbage untouched so
 * strict schema validation still rejects it.
 */
function softRepairScores(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const copy: Record<string, unknown> = { ...r };
  if ("overallScore" in copy) copy.overallScore = coerceScoreValue(copy.overallScore);
  if (Array.isArray(copy.dimensions)) {
    copy.dimensions = (copy.dimensions as unknown[]).map((d) => {
      if (!d || typeof d !== "object" || Array.isArray(d)) return d;
      const dim = { ...(d as Record<string, unknown>) };
      if ("score" in dim) dim.score = coerceScoreValue(dim.score);
      return dim;
    });
  }
  return copy;
}

/** Coerce only clean numeric strings (e.g. " 17 ") to numbers; pass everything else through. */
function coerceScoreValue(v: unknown): unknown {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (/^-?\d+(\.\d+)?$/.test(t)) {
      const n = Number(t);
      if (Number.isFinite(n)) return n;
    }
  }
  return v;
}

/** JSON Schema sent to Gemini (responseSchema). Keeps frontend from parsing Markdown. */
export const GeminiResponseSchema = {
  type: "OBJECT",
  properties: {
    status: { type: "STRING", enum: ["ok", "broke_bot"] },
    overallScore: { type: "INTEGER", minimum: 0, maximum: 100 },
    severity: { type: "STRING" },
    verdict: { type: "STRING" },
    verdictPunchline: { type: "STRING" },
    ideaSummary: { type: "STRING" },
    intentSummary: { type: "STRING" },
    dimensions: {
      type: "ARRAY",
      minItems: 2,
      maxItems: 9,
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          score: { type: "INTEGER", minimum: 0, maximum: 100 },
          summary: { type: "STRING" },
          roast: { type: "STRING" },
        },
        required: ["name", "score", "summary"],
      },
    },
    sections: {
      type: "ARRAY",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          body: { type: "STRING" },
          bullets: { type: "ARRAY", items: { type: "STRING" } },
          punchline: { type: "STRING" },
        },
        required: ["title", "body"],
      },
    },
    plotTwist: {
      type: "OBJECT",
      properties: { title: { type: "STRING" }, body: { type: "STRING" } },
      required: ["body"],
    },
    recommendation: {
      type: "OBJECT",
      properties: { headline: { type: "STRING" }, body: { type: "STRING" } },
      required: ["headline", "body"],
    },
    finalSentence: { type: "STRING" },
  },
  required: [
    "status",
    "overallScore",
    "severity",
    "verdict",
    "verdictPunchline",
    "ideaSummary",
    "dimensions",
    "sections",
    "finalSentence",
  ],
} as const;
