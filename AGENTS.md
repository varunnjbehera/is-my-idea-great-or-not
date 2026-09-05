# AGENTS.md

Operating notes for agentic coding sessions on this repo. Human-facing docs live in `README.md`.

## Stack

Next.js 14.2.5 · React 18 · TypeScript (strict, `noEmit`) · Tailwind CSS · Zod · Gemini API (`gemini-3.5-flash-lite`).

## Commands

```bash
npm run dev    # local dev → http://localhost:3000
npm run lint   # Next.js lint (must be clean)
npm run build  # production build (must pass)
npx tsc --noEmit  # typecheck
```

## Architecture invariants (do not break these)

- **The LLM owns intelligence; the app owns presentation.** Idea interpretation, scoring dimensions (2–9), report sections (1–10), and verdict wording are model-generated. Never hardcode a taxonomy, routing table, rubric, or verdict list.
- **No regex/keyword intent classification.** No web search, no auth, no DB, no chat, no history, no analytics.
- **Gemini key is server-side only** (`process.env.GEMINI_API_KEY` in `lib/gemini.ts`, called from `app/api/judge/route.ts`). Never add a `NEXT_PUBLIC_` key variable or import server code into client components.
- **Model output is untrusted.** All reports go through `normalizeReport` in `lib/schema.ts` (strict Zod validation + narrow string→number coercion only). Do not silently clamp or widen `ok` reports.
- **Personality is the product.** Anti-sycophantic, prosecution-first, ~99% negative prior, rare-positive anomaly behavior. Do not water it down, do not lower temperature because output varies.

## Scope discipline

This is a small hobby project: ephemeral request/response, no persistence. Fix only what is asked. Do not add features, redesign the UI, or "improve" the judging prompt unprompted.
