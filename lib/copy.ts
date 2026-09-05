export const EXAMPLE_IDEAS = [
  "What if I add raw eggs ramen-style to my pasta?",
  "A SaaS that reminds employees to stop opening Slack.",
  "What if airports had trampolines instead of moving walkways?",
  "Uber, but for dog grooming.",
  "A social network for people who hate social networks.",
  "A restaurant where every dish is served upside down.",
] as const;

export const LOADER_LINES = [
  "Understanding what you just proposed…",
  "Looking for obvious flaws…",
  "Looking for less obvious flaws…",
  "Checking whether this is just an existing thing with a different hat…",
  "Attempting to locate the customer…",
  "Checking whether this solves an actual problem…",
  "Trying very hard to find a reason to approve this…",
  "Calculating the consequences of your decision…",
  "This is taking longer than expected. Your idea may be complicated…",
  "Regret is computationally expensive…",
] as const;

export const PLACEHOLDER_ROTATION = [
  "What if I add raw eggs ramen-style to my pasta?",
  "A SaaS that reminds your employees to stop opening Slack…",
  "What if airports had trampolines instead of moving walkways?",
  "Uber, but for dog grooming…",
  "Should I launch a social network for people who hate social networks?",
] as const;

export const MAX_IDEA_LENGTH = 4000;

export function buildRoastCardText(r: {
  overallScore: number;
  verdict: string;
  verdictPunchline: string;
}): string {
  return `IS MY IDEA GREAT OR NOT?\n${r.overallScore}/100 — ${r.verdict}\n“${r.verdictPunchline}”`;
}

export function buildFullReportText(r: {
  overallScore: number;
  verdict: string;
  verdictPunchline: string;
  ideaSummary: string;
  dimensions: { name: string; score: number; summary: string }[];
  finalSentence: string;
}): string {
  const dims = r.dimensions.map((d) => `• ${d.name}: ${d.score}/100 — ${d.summary}`).join("\n");
  return `${buildRoastCardText(r)}\n\nYOUR IDEA, APPARENTLY:\n${r.ideaSummary}\n\nSCORECARD:\n${dims}\n\nFINAL SENTENCE:\n${r.finalSentence}`;
}
