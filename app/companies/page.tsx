"use client";

import { useEffect, useState } from "react";

type Company = {
  name: string;
  ats: string;
  slug: string;
  website?: string;
  careersUrl: string;
  ok: boolean;
  jobCount: number;
  error?: string;
  links?: { human: string; api?: string };
};

export default function CompaniesPage() {
  const [items, setItems] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/companies")
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d) => setItems(d.companies || []))
      .catch((e) => {
        console.error(e);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <h1>Web3 Companies Hiring</h1>
      <p style={{ opacity: 0.8 }}>
        Source: company career pages (ATS). Sorted by open roles.
      </p>

      {loading && <p>Loading...</p>}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((c) => (
          <div
            key={`${c.ats}:${c.slug}`}
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 12 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                <div style={{ opacity: 0.8, fontSize: 12 }}>
                  {c.ats} • {c.slug}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700 }}>{c.jobCount}</div>
                <div style={{ opacity: 0.75, fontSize: 12 }}>
                  {c.ok ? "ok" : "error"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
              {c.website && (
                <a href={c.website} target="_blank" rel="noreferrer">Website</a>
              )}
              <a href={c.careersUrl} target="_blank" rel="noreferrer">Careers</a>
              <a href={`/jobs?company=${encodeURIComponent(c.slug)}`}>View jobs</a>
              {c.links?.api && (
                <a href={c.links.api} target="_blank" rel="noreferrer">Verify API</a>
              )}
            </div>

            {!c.ok && c.error && (
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                {c.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
