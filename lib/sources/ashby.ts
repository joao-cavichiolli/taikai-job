export async function fetchAshby(slug: string) {
  // Ashby public posting API (no key required for job board)
  const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=false`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 } }); // 1h
  if (!res.ok) throw new Error(`Ashby ${slug} HTTP ${res.status}`);
  const data = await res.json();

  const postings = data?.jobs || data?.jobPostings || data?.jobPostingsById || data?.jobPostingSummaries || data?.jobPostingList || [];
  // Ashby responses vary by version; handle common shapes:
  const list = Array.isArray(postings)
    ? postings
    : (postings && typeof postings === "object")
    ? Object.values(postings as any)
    : [];

  return list.map((j: any) => ({
    source: "Ashby",
    sourceId: String(j.id ?? j.jobPostingId ?? j.applyUrl ?? j.url),
    title: j.title || j.jobTitle || "",
    company: slug,
    location: j.location || j.primaryLocation || j.locationName || "",
    remote: Boolean(j.isRemote) || /remote/i.test(String(j.location || j.locationName || "")),
    url: j.applyUrl || j.url || j.hostedUrl || "",
    publishedAt: j.publishedAt || j.updatedAt || j.createdAt || null,
    tags: j.team ? [String(j.team)] : [],
    snippet: String(j.descriptionPlain || j.description || "")
      .replace(/<[^>]*>/g, "")
      .slice(0, 200),
  }));
}
