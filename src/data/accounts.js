import { dossier } from "./dossier.js";

export const MAX_DOCUMENT_LENGTH = 16000;

export function cleanText(value, maxLength = MAX_DOCUMENT_LENGTH) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function labeledValue(text, labels) {
  const pattern = new RegExp(`^(?:${labels.join("|")})\\s*:\\s*(.+)$`, "im");
  return text.match(pattern)?.[1]?.trim() || "";
}

function documentHeading(text) {
  const heading = text.match(/^#\s+(.+)$/m)?.[1]?.trim() || "";
  return heading.replace(/[`*_]/g, "").trim();
}

export function splitFacts(text) {
  const facts = cleanText(text)
    .split(/\n\s*\n|^\s*[-*]\s+/m)
    .map(part => part.replace(/^\s*[-*]\s+/gm, "").trim())
    .filter(Boolean);
  return facts.length ? facts : ["No account details supplied."];
}

export const northstarAccount = {
  id: "northstar",
  company: dossier.company,
  industry: "Telecommunications",
  disclaimer: dossier.disclaimer,
  sections: dossier.sections,
  rawText: [
    `Company: ${dossier.company}`,
    "Industry: Telecommunications",
    ...dossier.sections.flatMap(section => [section.title, ...section.facts])
  ].join("\n")
};

export function createCustomAccount(text) {
  const rawText = cleanText(text);
  if (!rawText) throw new Error("Add a target-company dossier before continuing.");
  const company = labeledValue(rawText, ["Company", "Company name", "Target company", "Account"]) || documentHeading(rawText) || "Custom target company";
  const industry = labeledValue(rawText, ["Industry", "Sector"]) || "Industry not specified";
  return {
    id: "custom",
    company: company.slice(0, 160),
    industry: industry.slice(0, 160),
    disclaimer: "User-supplied practice context. Use fictional or non-confidential information only.",
    sections: [{ title: "Target-account dossier", facts: splitFacts(rawText) }],
    rawText
  };
}
