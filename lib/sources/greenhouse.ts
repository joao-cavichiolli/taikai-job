export async function fetchGreenhouse(slug: string) {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 } }); // 1h
  if (!res.ok) throw new Error(`Greenhouse ${slug} HTTP ${res.status}`);
  const data = await res.json();

  const jobs = (data.jobs || []).map((j: any) => ({
    source: `Greenhouse`,
    sourceId: String(j.id),
    title: j.title,
    company: slug,
    location: j.location?.name || "",
    remote: /remote/i.test(j.location?.name || ""),
    url: j.absolute_url,
    publishedAt: j.updated_at || j.created_at || null,
    tags: [],
    snippet: (j.content || "").replace(/<[^>]*>/g, "").slice(0, 200),
  }));

  return jobs;
}
