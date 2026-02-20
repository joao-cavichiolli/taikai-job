export function parseSalaryText(s: string): { min: number | null; max: number | null } {
  if (!s) return { min: null, max: null };
  const text = s.toLowerCase().replace(/,/g, "").trim();

  // detect currency and multipliers like k
  // Extract numbers like 80k, 120k, 90000
  const matches = Array.from(text.matchAll(/(\d+(?:\.\d+)?)\s*(k)?/g)).map((m) => {
    const n = Number(m[1]);
    if (Number.isNaN(n)) return null;
    const mult = m[2] ? 1000 : 1;
    return Math.round(n * mult);
  }).filter((x): x is number => typeof x === "number");

  if (!matches.length) return { min: null, max: null };

  let min = Math.min(...matches);
  let max = Math.max(...matches);

  // If only one number, treat as min
  if (matches.length === 1) max = null;

  // Some strings like "Up to 120k" => only max; naive: if text includes 'up to' and one number, set max
  if (matches.length === 1 && (text.includes("up to") || text.includes("upto") || text.includes("max"))) {
    max = min;
    min = null;
  }

  return { min, max };
}
