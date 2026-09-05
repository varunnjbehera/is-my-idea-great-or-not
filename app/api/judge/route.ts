import { NextResponse } from "next/server";
import { JudgeRequestSchema } from "@/lib/schema";
import { judgeIdea } from "@/lib/gemini";
import { clientIp, isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    if (isRateLimited(clientIp(req))) {
      return NextResponse.json(
        { error: "RATE_LIMITED", message: "The judge needs a breather. Try again in a minute." },
        { status: 429 }
      );
    }

    let body: unknown = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Send { idea, mode } as JSON." }, { status: 400 });
    }

    const parsed = JudgeRequestSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
      return NextResponse.json({ error: "INVALID_INPUT", message: msg }, { status: 400 });
    }

    const report = await judgeIdea(parsed.data.idea, parsed.data.mode);
    return NextResponse.json(report, { status: 200 });
  } catch (e) {
    const err = e as { status?: number; message?: string };
    if (err?.status === 429) {
      return NextResponse.json(
        { error: "UPSTREAM_RATE_LIMITED", message: "Even the robots have limits. Try again shortly." },
        { status: 502 }
      );
    }
    if (err?.status === 400 || err?.status === 401 || err?.status === 403) {
      return NextResponse.json(
        { error: "MODEL_CONFIG", message: "The judge is misconfigured. Check GEMINI_API_KEY / GEMINI_MODEL." },
        { status: 502 }
      );
    }
    console.error("judge failed", err);
    return NextResponse.json(
      {
        error: "JUDGE_UNAVAILABLE",
        message: "THE JUDGE IS CURRENTLY UNAVAILABLE. Even I have limits. Apparently the robots do too.",
      },
      { status: 502 }
    );
  }
}
