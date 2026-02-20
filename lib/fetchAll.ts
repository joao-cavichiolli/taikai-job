import { fetchRemotive } from "./sources/remotive";
import { fetchArbeitNow } from "./sources/arbeitnow";
import { fetchGreenhouse } from "./sources/greenhouse";
import { fetchLever } from "./sources/lever";
import { fetchAshby } from "./sources/ashby";
import { dedupeJobs } from "./normalize";
import { getCompanies } from "./companies";

export async function fetchATSJobs() {
  const companies = getCompanies().filter((c) => c.ats !== "unknown" && c.slug);
  const tasks = companies.map(async (c) => {
    try {
      if (c.ats === "greenhouse") return await fetchGreenhouse(c.slug);
      if (c.ats === "lever") return await fetchLever(c.slug);
      if (c.ats === "ashby") return await fetchAshby(c.slug);
      return [];
    } catch {
      return [];
    }
  });

  const results = await Promise.all(tasks);
  return results.flat();
}

export async function fetchAllJobs() {
  const [remotive, arbeit, ats] = await Promise.all([
    fetchRemotive(),
    fetchArbeitNow(),
    fetchATSJobs(),
  ]);

  return dedupeJobs([...remotive, ...arbeit, ...ats]);
}
