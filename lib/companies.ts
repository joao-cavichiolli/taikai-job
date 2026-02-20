export type Company = {
  name: string;
  website?: string;
  careersUrl: string;

  // inferred:
  ats: "greenhouse" | "lever" | "ashby" | "unknown";
  slug: string; // board identifier
};

import raw from "../data/web3-companies.json";

function inferATS(careersUrl: string): { ats: Company["ats"]; slug: string } {
  try {
    const u = new URL(careersUrl);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.replace(/\/+$/g, ""); // trim trailing slash

    // Greenhouse: https://boards.greenhouse.io/<slug>  OR /<slug>/
    if (host.includes("greenhouse.io")) {
      const parts = path.split("/").filter(Boolean);
      // boards.greenhouse.io/<slug> or /v1/boards/<slug>/jobs (unlikely here)
      const slug = parts[0] === "boards" && parts[1] ? parts[1] : parts[0] || "";
      return { ats: "greenhouse", slug };
    }

    // Lever: https://jobs.lever.co/<slug>
    if (host === "jobs.lever.co" || host.endsWith(".lever.co")) {
      const parts = path.split("/").filter(Boolean);
      const slug = parts[0] || "";
      return { ats: "lever", slug };
    }

    // Ashby: https://jobs.ashbyhq.com/<slug>
    if (host === "jobs.ashbyhq.com") {
      const parts = path.split("/").filter(Boolean);
      const slug = parts[0] || "";
      return { ats: "ashby", slug };
    }

    return { ats: "unknown", slug: "" };
  } catch {
    return { ats: "unknown", slug: "" };
  }
}

export function getCompanies(): Company[] {
  const arr = (raw as any[]) || [];
  return arr.map((c) => {
    const inferred = inferATS(String(c.careersUrl || ""));
    return {
      name: String(c.name || ""),
      website: c.website ? String(c.website) : undefined,
      careersUrl: String(c.careersUrl || ""),
      ats: inferred.ats,
      slug: inferred.slug,
    } as Company;
  });
}

export function atsDebugLinks(c: Company) {
  // Helpful links for validation
  if (c.ats === "greenhouse") {
    return {
      human: `https://boards.greenhouse.io/${encodeURIComponent(c.slug)}`,
      api: `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(c.slug)}/jobs`,
    };
  }
  if (c.ats === "lever") {
    return {
      human: `https://jobs.lever.co/${encodeURIComponent(c.slug)}`,
      api: `https://api.lever.co/v0/postings/${encodeURIComponent(c.slug)}?mode=json`,
    };
  }
  if (c.ats === "ashby") {
    return {
      human: `https://jobs.ashbyhq.com/${encodeURIComponent(c.slug)}`,
      api: `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(c.slug)}?includeCompensation=false`,
    };
  }
  return { human: c.careersUrl, api: "" };
}
