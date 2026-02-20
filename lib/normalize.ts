export type Job = {
  source: string;
  sourceId: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  publishedAt: string | null;
  tags: string[];
  snippet: string;
  salaryText?: string;
};

export function dedupeJobs(jobs: Job[]) {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    const key = `${j.source}:${j.sourceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filterJobs(
  jobs: Job[],
  q?: string,
  remote?: string,
  location?: string
) {
  let out = jobs;

  if (q) {
    const qq = q.toLowerCase();
    out = out.filter((j) =>
      `${j.title} ${j.company} ${j.location} ${j.tags.join(" ")}`
        .toLowerCase()
        .includes(qq)
    );
  }

  if (remote === "true") out = out.filter((j) => j.remote);
  if (remote === "false") out = out.filter((j) => !j.remote);

  if (location) {
    const ll = location.toLowerCase();
    out = out.filter((j) =>
      (j.location || "").toLowerCase().includes(ll)
    );
  }

  return out;
}
