import type { Job } from "./normalize";

export type JobCategory =
  | "Front-end Jobs"
  | "Backend Jobs"
  | "Full Stack"
  | "DevOps"
  | "IT Support"
  | "Non-Technical"
  | "Other";

const rules: Array<{ cat: JobCategory; keywords: string[] }> = [
  {
    cat: "Front-end Jobs",
    keywords: ["frontend", "front-end", "react", "next.js", "vue", "angular", "ui", "ux"],
  },
  {
    cat: "Backend Jobs",
    keywords: ["backend", "back-end", "api", "node", "nestjs", "django", "fastapi", "rails", "golang", "go ", "java", "spring"],
  },
  {
    cat: "Full Stack",
    keywords: ["fullstack", "full-stack", "full stack"],
  },
  {
    cat: "DevOps",
    keywords: ["devops", "sre", "kubernetes", "k8s", "docker", "terraform", "cloud", "aws", "gcp", "azure", "ci/cd", "cicd", "jenkins"],
  },
  {
    cat: "IT Support",
    keywords: ["it support", "helpdesk", "service desk", "desktop support", "sysadmin", "system administrator"],
  },
  {
    cat: "Non-Technical",
    keywords: ["product", "project manager", "marketing", "sales", "customer success", "community", "operations", "hr", "recruiter", "designer"],
  },
];

export function categorize(job: Job): JobCategory {
  const text = [
    job.title,
    job.snippet,
    job.company,
    job.location,
    ...(job.tags || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const r of rules) {
    if (r.keywords.some((k) => text.includes(k))) return r.cat;
  }
  return "Other";
}
