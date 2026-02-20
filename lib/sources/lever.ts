export async function fetchLever(slug: string) {
  const url = `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 } }); // 1h
  if (!res.ok) throw new Error(`Lever ${slug} HTTP ${res.status}`);
  const data = await res.json();

  return (data || []).map((j: any) => ({
    source: `Lever`,
    sourceId: String(j.id ?? j.hostedUrl ?? j.applyUrl),
    title: j.text,
    company: slug,
    location: j.categories?.location || "",
    remote: /remote/i.test(j.categories?.location || ""),
    url: j.hostedUrl || j.applyUrl,
    publishedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
    tags: [
      ...(j.categories?.team ? [j.categories.team] : []),
      ...(j.categories?.commitment ? [j.categories.commitment] : []),
    ],
    snippet: (j.descriptionPlain || j.description || "")
      .replace(/<[^>]*>/g, "")
      .slice(0, 200),
  }));
}
