import type { JudgmentReport } from "@/lib/schema";

/** Render a bold, minimal 1200x630 share card client-side. No backend needed. */
export async function renderShareCard(report: JudgmentReport): Promise<Blob> {
  const W = 1200;
  const H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  // Background
  ctx.fillStyle = "#FAF7F2";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#141210";
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  const accent = report.overallScore <= 40 ? "#B91C1C" : report.overallScore <= 62 ? "#A16207" : "#0F766E";

  ctx.fillStyle = "#141210";
  ctx.font = "700 34px Georgia, serif";
  ctx.fillText("IS MY IDEA GREAT OR NOT?", 70, 105);

  ctx.fillStyle = accent;
  ctx.font = "900 190px Georgia, serif";
  ctx.fillText(`${report.overallScore}`, 70, 320);
  ctx.font = "400 64px Georgia, serif";
  ctx.fillStyle = "#6B6259";
  ctx.fillText("/ 100", 70 + ctx.measureText(`${report.overallScore}`).width + 200, 320);

  ctx.fillStyle = "#141210";
  ctx.font = "900 72px Georgia, serif";
  wrap(ctx, report.verdict.toUpperCase().slice(0, 28), 70, 430, W - 140, 78);

  ctx.fillStyle = "#3A352F";
  ctx.font = "italic 400 34px Georgia, serif";
  wrap(ctx, `“${report.verdictPunchline}”`.slice(0, 140), 70, 510, W - 140, 44);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png")
  );
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = w;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}
