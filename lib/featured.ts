import type { Job } from "./normalize";

const HOT_KEYWORDS = [
  "solidity",
  "smart contract",
  "smart-contract",
  "protocol",
  "zk",
  "zero knowledge",
  "zero-knowledge",
  "security",
  "devrel",
  "developer relations",
  "foundry",
  "hardhat",
  "ethereum",
  "staff",
  "principal",
  "lead",
  "senior",
];

function toTime(v: unknown): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }
  try {
    const t = Date.parse(String(v));
    return Number.isNaN(t) ? 0 : t;
  } catch {
    return 0;
  }
}

export function isFeatured(job: Job): boolean {
  const text = [
    job.title,
    job.company,
    job.location,
    job.snippet,
    ...(job.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hot = HOT_KEYWORDS.some((k) => text.includes(k));
  const fresh = toTime(job.publishedAt) > Date.now() - 1000 * 60 * 60 * 24 * 7; // 7 days
  return hot && fresh;
}
