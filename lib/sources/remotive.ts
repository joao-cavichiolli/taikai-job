export async function fetchRemotive() {
  const res = await fetch("https://remotive.com/api/remote-jobs", {
    next: { revalidate: 60 * 30 },
  });
  const data = await res.json();

  return (data.jobs || []).map((j: any) => ({
    source: "Remotive",
    sourceId: String(j.id ?? j.url),
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location,
    remote: true,
    url: j.url,
    publishedAt: j.publication_date,
    tags: j.tags || [],
    snippet: j.description?.replace(/<[^>]*>/g, "").slice(0, 200) || "",
    salaryText: j.salary || "",
    salaryMin: null,
    salaryMax: null,
    region: "Remote",
  }));
}
