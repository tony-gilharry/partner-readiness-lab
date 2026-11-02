import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname, basename } from "node:path";

const textExtensions = new Set([
  ".css", ".html", ".js", ".json", ".md", ".mjs", ".plist", ".py", ".sh",
  ".svg", ".swift", ".ts", ".tsx", ".txt", ".xml", ".yaml", ".yml"
]);
const secretPatterns = [
  ["private key", /BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY/],
  ["ElevenLabs-style secret", /\bsk_[A-Za-z0-9]{16,}/],
  ["GitHub token", /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}/],
  ["AWS access key", /\bAKIA[A-Z0-9]{16}\b/],
  ["assigned API key", /(?:xi-api-key|api[_-]?key)\s*[:=]\s*["'][^"']{12,}["']/i],
  ["agent-ID-shaped reference", /\bagent_[A-Za-z0-9_-]{8,}\b/]
];
const findings = [];

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function scan(label, path, data) {
  if (!data.length || data.includes(0)) return;
  const text = data.toString("utf8");
  for (const [name, pattern] of secretPatterns) {
    if (pattern.test(text)) findings.push(`${label}:${path}: ${name}`);
  }
}

function checkFilename(label, path) {
  const lower = path.toLowerCase();
  const name = basename(lower);
  const allowedEnvTemplate = [".env.example", ".env.sample", ".env.template"].includes(name);
  if (
    (name.startsWith(".env") && !allowedEnvTemplate) ||
    lower.startsWith(".chrome-") ||
    lower.endsWith(".pem") ||
    lower.endsWith(".p12") ||
    lower.endsWith(".key") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    name.includes("id_rsa")
  ) findings.push(`${label}:${path}: sensitive release filename`);
}

const candidates = git("ls-files", "--cached", "--others", "--exclude-standard", "-z")
  .split("\0")
  .filter(Boolean);
for (const path of candidates) {
  checkFilename("worktree", path);
  if (textExtensions.has(extname(path).toLowerCase())) scan("worktree", path, readFileSync(path));
}

const commits = git("rev-list", "--all").trim().split("\n").filter(Boolean);
for (const commit of commits) {
  const paths = git("ls-tree", "-r", "-z", "--name-only", commit).split("\0").filter(Boolean);
  for (const path of paths) {
    checkFilename(commit.slice(0, 8), path);
    if (!textExtensions.has(extname(path).toLowerCase())) continue;
    const data = execFileSync("git", ["show", `${commit}:${path}`], { maxBuffer: 64 * 1024 * 1024 });
    scan(commit.slice(0, 8), path, data);
  }
}

console.log(`OPSEC candidates scanned: ${candidates.length}`);
console.log(`Git commits scanned: ${commits.length}`);
if (findings.length) {
  console.error(`OPSEC findings: ${findings.length}`);
  for (const finding of findings.slice(0, 30)) console.error(`- ${finding}`);
  if (findings.length > 30) console.error(`- ${findings.length - 30} additional findings not shown`);
  console.error("Stop the release. Review docs/OPSEC.md before staging or pushing.");
  process.exit(1);
}
console.log("Automated OPSEC checks passed. Complete the manual checklist in docs/OPSEC.md before pushing.");
