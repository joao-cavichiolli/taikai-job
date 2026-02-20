import { getCompanies, atsDebugLinks } from "../../../lib/companies";
import { fetchGreenhouse } from "../../../lib/sources/greenhouse";
import { fetchLever } from "../../../lib/sources/lever";
import { fetchAshby } from "../../../lib/sources/ashby";

export async function GET() {
  const companies = getCompanies();

  const results = await Promise.all(
    companies.map(async (c) => {
      const links = atsDebugLinks(c);

      if (c.ats === "unknown" || !c.slug) {
        return {
          ...c,
          ok: false,
          jobCount: 0,
          error: "Could not infer ATS from careersUrl",
          links,
        };
      }

      try {
        let jobs: any[] = [];
        if (c.ats === "greenhouse") jobs = await fetchGreenhouse(c.slug);
        if (c.ats === "lever") jobs = await fetchLever(c.slug);
        if (c.ats === "ashby") jobs = await fetchAshby(c.slug);

        return {
          ...c,
          ok: true,
          jobCount: jobs.length,
          links,
        };
      } catch (e: any) {
        return {
          ...c,
          ok: false,
          jobCount: 0,
          error: e?.message || "fetch failed",
          links,
        };
      }
    })
  );

  results.sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0));
  return Response.json({ count: results.length, companies: results });
}
