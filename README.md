# Is My Idea Great or Not?

> Submit an idea. Get judged. Brutally.

A brutally skeptical AI judge for literally any idea. You type anything — a startup pitch, a recipe experiment, an invention, a life hack, an absurd hypothetical — and a highly opinionated model tries to destroy it before deciding whether anything good survives.

## The concept

Most AI assistants are sycophants: *"That's a really interesting and unique idea!"* This app is the opposite. It behaves approximately like: *"No."* — then explains why.

The product philosophy is intentionally **anti-sycophantic**: the judge acts as skeptic first, prosecutor second, and fair judge only at the end. It actively hunts for flaws — weak demand, bad economics, poor incentives, execution pain, existing alternatives that already win — before it ever considers the case *for* the idea. Praise must be earned, so positive verdicts are rare, reluctant, and treated as the machine malfunctioning.

It judges **anything**, including:

- startup and SaaS ideas
- consumer products and features
- recipes and cooking experiments
- inventions and life hacks
- creative concepts and content ideas
- absurd hypotheticals and weird questions

There is no category picker and no fixed rubric. The model infers what the input is, what matters for evaluating it, and how deep the analysis should be — so the **evaluation dimensions are dynamically generated per idea** (a food experiment might get *flavor compatibility* and *texture*; a SaaS pitch might get *willingness to pay* and *distribution*). The frontend simply renders whatever dimensions and sections the model returns.

## Features

- **Freeform idea input** — huge textarea, multiline, no accounts, no categories, no forms-within-forms
- **Fair / Horrible mode** — a funny brutality toggle (`BE FAIR` ↔ `BE HORRIBLE`) that meaningfully changes model behavior
- **Gemini-powered analysis** — structured JSON output via `responseSchema`, never raw Markdown parsing
- **Dynamic scorecard** — 2–9 model-chosen dimensions, each with score, explanation, and optional roast
- **Prosecution-first report** — the case *against* the idea leads; the defense comes last
- **Rare positive verdicts** — genuinely good ideas score high but are treated as "you broke the bot" anomalies
- **Plot Twist section** — optional, model-chosen; appears only when there's a genuinely surprising insight
- **Entertaining loading state** — rotating deadpan status lines, reduced-motion aware
- **Dramatic result reveal** — oversized editorial score, verdict, punchline, animated count-up
- **Shareable verdict card** — copy roast card, copy full report, browser-native share, client-side PNG download
- **Responsive UI** — mobile-first; scorecards stack, verdict scales, share controls stay reachable
- **Safety state** — genuinely dangerous inputs get `YOUR IDEA BROKE THE BOT` instead of analysis or instructions
- **Accessible** — semantic landmarks, labeled form, keyboard submission (Ctrl/Cmd+Enter), screen-reader-friendly scores, focus states, skip link

## Tech stack

- [Next.js](https://nextjs.org/) 14.2.5 (App Router)
- [React](https://react.dev/) 18.3.1
- [TypeScript](https://www.typescriptlang.org/) 5.5.4 (strict, `noEmit`)
- [Tailwind CSS](https://tailwindcss.com/) 3.4.10
- [Gemini API](https://aistudio.google.com/) — model `gemini-3.5-flash-lite`, via a Vercel-compatible server-side API route
- [Zod](https://zod.dev/) 3.23.8 — request validation and strict report validation

## Architecture

```
Client: textarea + BE FAIR ↔ BE HORRIBLE → POST /api/judge { idea, mode }
Server: validate (Zod) → rate-limit → build prompt → Gemini generateContent
        (responseMimeType: application/json + responseSchema) → validate/normalize → return
Client: VerdictHero → scorecard → prosecution → twist → share
```

- **LLM owns intelligence.** No regex/keyword routing, no hardcoded idea taxonomy, no fixed rubrics. See `lib/prompts.ts` and `lib/schema.ts`.
- **App owns presentation.** The frontend is a dynamic renderer that tolerates 2–9 dimensions, 1–10 sections, optional plot twist, short or long reports, and the safety state.
- **Model output is untrusted.** Every report passes through `normalizeReport`: strict Zod validation with only narrow, unambiguous string→number score coercion. Malformed output triggers one safe retry, then an in-character error state — raw API errors never reach the user.
- **Server-side key handling.** The Gemini API key lives in `process.env.GEMINI_API_KEY`, read only in `lib/gemini.ts` (server) via `app/api/judge/route.ts`. It is never exposed to browser code.
- **Ephemeral by design.** No auth, no database, no chat, no history, no analytics, no web search. Request in, report out.

## Local development

Prerequisites: Node.js 18+ and npm.

```bash
npm install
```

Copy the environment template and fill in your key (get one at https://aistudio.google.com/apikey):

```bash
cp .env.example .env   # Windows: copy .env.example .env
```

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.5-flash-lite
```

> Never use `NEXT_PUBLIC_GEMINI_API_KEY` or otherwise expose the Gemini API key to browser/client code. The `GEMINI_` variables are server-side only.

Then:

```bash
npm run dev    # → http://localhost:3000
```

Other scripts:

- `npm run build` / `npm start` — production build / serve
- `npm run lint` — Next.js lint
- `npx tsc --noEmit` — typecheck

## Deployment

Vercel is the primary target; the app needs no custom server, no `vercel.json`, and no extra services.

### Vercel Dashboard (GitHub)

1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repository (Next.js is auto-detected; keep the default build settings).
3. Add environment variables: `GEMINI_API_KEY` (required), `GEMINI_MODEL=gemini-3.5-flash-lite` (optional override).
4. **Deploy.** Open the production URL and test: a normal idea, Fair mode, Horrible mode, a long idea, and share/PNG download. Confirm the API key is not visible in client-side code.

### Vercel CLI

```bash
npm i -g vercel
vercel              # link + preview deploy
vercel env add GEMINI_API_KEY   # production value, server-side only
vercel --prod
```

### Netlify (secondary)

The app also deploys to Netlify with no extra project files — import the repo and let the Next.js Runtime auto-detect the framework. Set the same `GEMINI_API_KEY` environment variable in the Netlify dashboard. Vercel remains the primary, tested target.

## Repository structure

```
app/                  # Next.js App Router: layout, landing page, /api/judge route
components/           # VerdictHero, Scorecard, ReportBody, ShareActions, loader, states
lib/                  # prompts, Gemini client, Zod schemas + normalizeReport, copy, share-card
app/globals.css       # design tokens, editorial styles, reduced-motion rules
tailwind.config.ts    # theme tokens (ink/paper/accent, display + sans fonts)
.env.example          # safe env template (placeholders only)
```

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

A hobby / portfolio project. The judge's personality is deliberately harsh, theatrical, and confidently full of it — it attacks *ideas*, never people, and its opinions are entertainment with a side of genuine critique, not professional advice.
