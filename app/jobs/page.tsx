"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  source: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
  publishedAt: string | null;
  tags: string[];
  snippet: string;
  salaryText?: string;
  category?: string;
  companyDisplay?: string;
};

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function JobsPage() {
  const [q, setQ] = useState(""); 
  const [location, setLocation] = useState(""); 
  const [remote, setRemote] = useState(""); 
  const [web3Only, setWeb3Only] = useState(false);
  const [category, setCategory] = useState("");
  const [hasSalary, setHasSalary] = useState(false);
  const [featured, setFeatured] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t as any);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  const url = useMemo(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (location) sp.set("location", location);
    if (remote) sp.set("remote", remote);
    if (web3Only) sp.set("web3", "true");
    if (category) sp.set("category", category);
    if (hasSalary) sp.set("hasSalary", "true");
    const qs = sp.toString();
    return qs ? `/api/jobs?${qs}` : "/api/jobs";
  }, [q, location, remote, web3Only, category, hasSalary]);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(async (r) => {
        if (!r.ok) {
          const txt = await r.text();
          throw new Error(`API error ${r.status}: ${txt}`);
        }
        return r.json();
      })
      .then((d) => {
        setFeatured(d.featured || []);
        setJobs(d.jobs || []);
      })
      .catch((e) => {
        console.error(e);
        setFeatured([]);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0 }}>TAIKAI Community Jobs</h1>
          <p style={{ margin: "6px 0 0 0", color: "var(--muted)" }}>
            Nice good one. Aggregated listings (Remotive + ArbeitNow). Apply opens the original listing.
          </p>
        </div>
        <button className="button" onClick={toggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <div className="controls">
        <input
          className="input"
          placeholder="Search (DevOps, DevRel, Solidity...)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <input
          className="input"
          placeholder="Location (Italy, EU, Remote...)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <select value={remote} onChange={(e) => setRemote(e.target.value)}>
          <option value="">Remote + Onsite</option>
          <option value="true">Remote only</option>
          <option value="false">Onsite only</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="Front-end Jobs">Front-end Jobs</option>
          <option value="Backend Jobs">Backend Jobs</option>
          <option value="Full Stack">Full Stack</option>
          <option value="DevOps">DevOps</option>
          <option value="IT Support">IT Support</option>
          <option value="Non-Technical">Non-Technical</option>
        </select>

        <label className="badge" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hasSalary}
            onChange={(e) => setHasSalary(e.target.checked)}
            style={{ margin: 0 }}
          />
          Has salary
        </label>

        <label className="badge" style={{ cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={web3Only}
            onChange={(e) => setWeb3Only(e.target.checked)}
            style={{ margin: 0 }}
          />
          Web3 only
        </label>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading…</p>}

      {featured.length > 0 && (
        <>
          <h2 style={{ marginTop: 18, marginBottom: 10 }}>Featured Jobs 🔥</h2>
          <div className="grid" style={{ marginBottom: 18 }}>
            {featured.map((j, idx) => (
              <div key={`f-${idx}`} className="card featured">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{j.title}</h3>
                    <div className="meta">
                      {(j.companyDisplay || j.company)} • {j.location} {j.remote ? "• Remote" : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge">{j.source}</span>
                    {j.category && <span className="badge">{j.category}</span>}
                    {j.salaryText && <span className="badge">{j.salaryText}</span>}
                    <span className="badge hot">HOT</span>
                  </div>
                </div>

                {j.snippet && (
                  <p style={{ marginTop: 10, color: "var(--muted)" }}>
                    {j.snippet}…
                  </p>
                )}

                <div style={{ marginTop: 10 }}>
                  <a className="button" href={j.url} target="_blank" rel="noreferrer">
                    Apply
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 style={{ marginTop: 18, marginBottom: 10 }}>All Jobs</h2>
      <div className="grid">
        {jobs.map((j, idx) => (
          <div key={idx} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0 }}>{j.title}</h3>
                <div className="meta">
                  {(j.companyDisplay || j.company)} • {j.location} {j.remote ? "• Remote" : ""}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="badge">{j.source}</span>
                    {j.category && <span className="badge">{j.category}</span>}
                    {j.salaryText && <span className="badge">{j.salaryText}</span>}
              </div>
            </div>

            {j.snippet && (
              <p style={{ marginTop: 10, color: "var(--muted)" }}>
                {j.snippet}…
              </p>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a className="button" href={j.url} target="_blank" rel="noreferrer">
                Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
