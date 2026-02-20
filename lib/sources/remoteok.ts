export async function fetchRemoteOK() {
  // RemoteOK has an unofficial JSON feed. Historically available at remoteok.com/api or remoteok.io/api.
  // We'll try both and fail gracefully.
  const urls = ["https://remoteok.com/api", "https://remoteok.io/api"];

  let data: any[] | null = null;
  let lastErr: any = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "taikai-community-jobs" },
        next: { revalidate: 60 * 60 },
      });
      if (!res.ok) throw new Error(`RemoteOK HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json)) {
        data = json;
        break;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!data) {
    throw lastErr || new Error("RemoteOK fetch failed");
  }

  // First element is usually metadata
  const items = data.filter((x) => x && typeof x === "object" && x.id);

  return items.map((j: any) => ({
    source: "RemoteOK",
    sourceId: String(j.id),
    title: j.position || j.title || "",
    company: j.company || "",
    location: j.location || "Remote",
    remote: true,
    url: j.url || j.apply_url || "",
    publishedAt: j.date || j.epoch ? new Date((j.epoch || 0) * 1000).toISOString() : null,
    tags: Array.isArray(j.tags) ? j.tags : [],
    snippet: String(j.description || "")
      .replace(/<[^>]*>/g, "")
      .slice(0, 200),
    salaryText: j.salary || j.salary_range || "",
    salaryMin: typeof j.salary_min === "number" ? j.salary_min : null,
    salaryMax: typeof j.salary_max === "number" ? j.salary_max : null,
    region: "Remote",
  }));
}
