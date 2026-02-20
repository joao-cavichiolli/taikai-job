"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  source: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  url: string;
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
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState("");
  const [web3Only, setWeb3Only] = useState(false);
  const [category, setCategory] = useState("");
  const [hasSalary, setHasSalary] = useState(false);
  const [region, setRegion] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [featured, setFeatured] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const t = getInitialTheme();
    setTheme(t);
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
    if (region) sp.set("region", region);
    if (minSalary) sp.set("minSalary", minSalary);
    if (maxSalary) sp.set("maxSalary", maxSalary);
    return `/api/jobs?${sp.toString()}`;
  }, [q, location, remote, web3Only, category, hasSalary, region, minSalary, maxSalary]);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setFeatured(d.featured || []);
        setJobs(d.jobs || []);
      })
      .finally(() => setLoading(false));
  }, [url]);

  return (
    <div className="container">
      <div className="topbar">
        <div>
          <h1 style={{ margin: 0 }}>TAIKAI Community Jobs</h1>
          <p style={{ margin: "6px 0 0 0", color: "var(--muted)" }}>
            Aggregated listings. Apply opens the original listing.
          </p>
        </div>
        <button className="button" onClick={toggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <div className="controls">
        <input className="input" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="input" placeholder="Location..." value={location} onChange={(e) => setLocation(e.target.value)} />
        <select value={remote} onChange={(e) => setRemote(e.target.value)}>
          <option value="">Remote + Onsite</option>
          <option value="true">Remote only</option>
          <option value="false">Onsite only</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="Front-end Jobs">Front-end</option>
          <option value="Backend Jobs">Backend</option>
          <option value="Full Stack">Full Stack</option>
          <option value="DevOps">DevOps</option>
          <option value="IT Support">IT Support</option>
          <option value="Non-Technical">Non-Technical</option>
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">All regions</option>
          <option value="Remote">Remote</option>
          <option value="Europe">Europe</option>
        </select>
        <input className="input salary" placeholder="Min salary" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} />
        <input className="input salary" placeholder="Max salary" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} />

        <label className="badge">
          <input type="checkbox" checked={hasSalary} onChange={(e) => setHasSalary(e.target.checked)} />
          Has salary
        </label>

        <label className="badge">
          <input type="checkbox" checked={web3Only} onChange={(e) => setWeb3Only(e.target.checked)} />
          Web3 only
        </label>
      </div>

      {loading && <p style={{ color: "var(--muted)" }}>Loading…</p>}

      <h2>All Jobs</h2>

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

              <div className="badgesWrap">
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

            <div style={{ marginTop: 12 }}>
              <a className="buttonPrimary" href={j.url} target="_blank" rel="noreferrer">
                Apply
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}