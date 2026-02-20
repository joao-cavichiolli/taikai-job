export async function fetchArbeitNow() {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    next: { revalidate: 60 * 60 },
  });
  const data = await res.json();

  return (data.data || []).map((j: any) => ({
    source: "ArbeitNow",
    sourceId: String(j.slug ?? j.url),
    title: j.title,
    company: j.company_name,
    location: j.location,
    remote: Boolean(j.remote),
    url: j.url,
    publishedAt: j.created_at || null,
    tags: [],
    snippet: (j.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
    salaryText: "",
  }));
}
