import { GeminiResponseSchema, normalizeReport, type BrutalityMode, type JudgmentReport } from "./schema";
import { buildSystemPrompt, buildUserPrompt } from "./prompts";

function getConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
  return { apiKey, model };
}

function extractJson(text: string): string {
  const t = text.trim();
  // Strip markdown fences if model ignores contract
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence?.[1]) return fence[1].trim();
  return t;
}

async function callOnce(idea: string, mode: BrutalityMode): Promise<unknown> {
  const { apiKey, model } = getConfig();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const temperature = mode === "fair" ? 0.9 : 1.2;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: buildSystemPrompt(mode) }] },
      contents: [{ role: "user", parts: [{ text: buildUserPrompt(idea, mode) }] }],
      generationConfig: {
        temperature,
        topP: 0.95,
        // 4096 fits the dynamic schema (2-9 dims, 1-10 sections) for complex
        // ideas without truncating JSON; verbosity is still prompt-controlled.
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: GeminiResponseSchema as unknown as Record<string, unknown>,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Gemini error ${res.status}`) as Error & { status?: number; body?: string };
    err.status = res.status;
    err.body = body.slice(0, 500);
    throw err;
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("Empty model response");
  return JSON.parse(extractJson(text)) as unknown;
}

export async function judgeIdea(idea: string, mode: BrutalityMode): Promise<JudgmentReport> {
  // One safe retry for malformed structured output; never loop.
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callOnce(idea, mode);
      const report = normalizeReport(raw);
      if (report) {
        // Guard: broke_bot reports may legitimately have empty arrays
        if (report.status === "broke_bot") return report;
        if (report.dimensions.length >= 2 && report.sections.length >= 1) return report;
      }
      lastErr = new Error("Invalid report shape");
    } catch (e) {
      lastErr = e;
      const status = (e as { status?: number })?.status;
      // Don't retry auth/rate-limit errors
      if (status === 400 || status === 401 || status === 403 || status === 429) break;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Judgment failed");
}
