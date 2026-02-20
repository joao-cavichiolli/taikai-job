import { fetchRemotive } from "../../../lib/sources/remotive";
import { fetchArbeitNow } from "../../../lib/sources/arbeitnow";
import { fetchRemoteOK } from "../../../lib/sources/remoteok";
import { dedupeJobs, filterJobs } from "../../../lib/normalize";
import { isWeb3Job } from "../../../lib/web3";
import { isFeatured } from "../../../lib/featured";
import { categorize } from "../../../lib/category";
import { parseSalaryText } from "../../../lib/salary";

function toTime(v: unknown): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }
  // fallback for unexpected shapes (e.g. objects)
  try {
    const t = Date.parse(String(v));
    return Number.isNaN(t) ? 0 : t;
  } catch {
    return 0;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const remote = searchParams.get("remote") || "";
    const location = searchParams.get("location") || "";
    const web3 = searchParams.get("web3") || "";
    const category = searchParams.get("category") || "";
    const hasSalary = searchParams.get("hasSalary") || "";
    const region = searchParams.get("region") || "";
    const minSalary = searchParams.get("minSalary") || "";
    const maxSalary = searchParams.get("maxSalary") || "";

    const [a, b] = await Promise.all([fetchRemotive(), fetchArbeitNow()]);
    const all = dedupeJobs([...a, ...b]);

    let filtered = filterJobs(all, q, remote, location);

    if (web3 === "true") {
      filtered = filtered.filter(isWeb3Job);
    }

    
    let enriched = filtered.map((j: any) => {
      const cat = categorize(j);

      // compute salary min/max from fields or from salaryText
      let salaryMinComputed = typeof j.salaryMin === "number" ? j.salaryMin : null;
      let salaryMaxComputed = typeof j.salaryMax === "number" ? j.salaryMax : null;

      if ((!salaryMinComputed && !salaryMaxComputed) && j.salaryText) {
        const parsed = parseSalaryText(String(j.salaryText));
        salaryMinComputed = parsed.min;
        salaryMaxComputed = parsed.max;
      }

      return {
        ...j,
        category: cat,
        salaryMin: salaryMinComputed,
        salaryMax: salaryMaxComputed,
        region: j.region || (j.remote ? "Remote" : ""),
      };
    });

    if (region) {
      const r = region.toLowerCase();
      enriched = enriched.filter((j: any) => String(j.region || "").toLowerCase() === r || (r === "global"));
    }

    const minS = minSalary ? Number(minSalary) : null;
    const maxS = maxSalary ? Number(maxSalary) : null;

    if (minS !== null && !Number.isNaN(minS)) {
      enriched = enriched.filter((j: any) => {
        const lo = typeof j.salaryMin === "number" ? j.salaryMin : null;
        const hi = typeof j.salaryMax === "number" ? j.salaryMax : null;
        if (lo === null && hi === null) return false;
        if (hi !== null) return hi >= minS;
        return lo !== null ? lo >= minS : false;
      });
    }

    if (maxS !== null && !Number.isNaN(maxS)) {
      enriched = enriched.filter((j: any) => {
        const lo = typeof j.salaryMin === "number" ? j.salaryMin : null;
        const hi = typeof j.salaryMax === "number" ? j.salaryMax : null;
        if (lo === null && hi === null) return false;
        if (lo !== null) return lo <= maxS;
        return hi !== null ? hi <= maxS : false;
      });
    }

    if (category) {
      const c = category.toLowerCase();
      enriched = enriched.filter((j: any) => String(j.category).toLowerCase() === c);
    }

    if (hasSalary === "true") {
      enriched = enriched.filter((j: any) => String(j.salaryText || "").trim().length > 0);
    }

    // newest first
    enriched.sort((x, y) => toTime(y.publishedAt) - toTime(x.publishedAt));

    const featured = enriched.filter(isFeatured).slice(0, 12);

    // Keep list stable: remove featured from main list
    const featuredSet = new Set(featured.map((j: any) => `${j.source}:${j.sourceId}`));
    const jobs = enriched.filter((j: any) => !featuredSet.has(`${j.source}:${j.sourceId}`));

    return Response.json({ count: enriched.length, featured, jobs });
  } catch (err: any) {
    return Response.json(
      { ok: false, error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
