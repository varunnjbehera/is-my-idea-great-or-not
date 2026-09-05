/** Map 0-100 to a visual band. Wording itself stays model-driven. */
export function severityBand(score: number): {
  key: "terrible" | "weak" | "middling" | "decent" | "great";
  label: string;
  color: string;
  bg: string;
} {
  if (score <= 20) return { key: "terrible", label: "Catastrophic", color: "#B91C1C", bg: "#FEE2E2" };
  if (score <= 40) return { key: "weak", label: "Weak", color: "#C2410C", bg: "#FFEDD5" };
  if (score <= 62) return { key: "middling", label: "Mediocre", color: "#A16207", bg: "#FEF9C3" };
  if (score <= 84) return { key: "decent", label: "Suspiciously decent", color: "#15803D", bg: "#DCFCE7" };
  return { key: "great", label: "Actually great", color: "#0F766E", bg: "#CCFBF1" };
}
