import { cleanText, MAX_DOCUMENT_LENGTH } from "./accounts.js";
import { getScenario, getFocus } from "./scenarios.js";
import { tracks } from "./tracks.js";

const sectionNames = ["Target company", "Buyer persona", "Product or service", "Practice objective"];

function escapeSection(text) {
  return cleanText(text).replace(/^## /gm, "\\## ");
}

function unescapeSection(text) {
  return text.replace(/^\\## /gm, "## ").trim();
}

export function serializeScenarioPack({ scenarioId, trackId, focusId, practiceMode, accountText, buyerText, offer, objective }) {
  const scenario = getScenario(scenarioId);
  const track = tracks[trackId] ? trackId : scenario.track || "seller";
  const pack = [
    "# Partner Readiness Lab Scenario Pack",
    "",
    "Pack version: 1",
    `Scenario: ${scenario.id}`,
    `Track: ${track}`,
    `Focus: ${focusId || "balanced"}`,
    `Mode: ${practiceMode === "free" ? "free" : "guided"}`,
    "",
    "## Target company",
    "",
    escapeSection(accountText),
    "",
    "## Buyer persona",
    "",
    escapeSection(buyerText),
    "",
    "## Product or service",
    "",
    cleanText(offer, 1000),
    "",
    "## Practice objective",
    "",
    cleanText(objective, 2000),
    ""
  ].join("\n");
  if (pack.length > MAX_DOCUMENT_LENGTH * 2) throw new Error("The combined scenario is too large to export. Shorten the account or buyer text.");
  return pack;
}

export function parseScenarioPack(text) {
  const source = cleanText(text, MAX_DOCUMENT_LENGTH * 2);
  if (!source.startsWith("# Partner Readiness Lab Scenario Pack\n")) {
    throw new Error("This is not a Partner Readiness Lab Markdown scenario pack.");
  }
  if (!/^Pack version:\s*1\s*$/m.test(source)) throw new Error("The scenario-pack version is missing or unsupported.");
  const preamble = source.split(/^## Target company\s*$/m)[0];
  const field = name => preamble.match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]?.trim() || "";
  const scenarioId = field("Scenario");
  const scenario = getScenario(scenarioId);
  if (scenario.id !== scenarioId) throw new Error("The scenario structure is missing or unsupported.");
  const trackId = field("Track") || scenario.track || "seller";
  if (!tracks[trackId] || (scenario.track && scenario.track !== trackId)) throw new Error("The scenario and learner track do not match.");
  const focusValue = field("Focus");
  const focusId = focusValue === "balanced" ? "" : focusValue;
  if (focusId && !getFocus(focusId, trackId)) throw new Error("The practice focus is not valid for this learner track.");
  const mode = field("Mode");
  if (!["guided", "free"].includes(mode)) throw new Error("The practice mode must be guided or free.");
  const matches = [...source.matchAll(/^## (Target company|Buyer persona|Product or service|Practice objective)\s*$/gm)];
  if (matches.length !== sectionNames.length || matches.some((match, index) => match[1] !== sectionNames[index])) {
    throw new Error("The pack must contain the four required sections in order.");
  }
  const sections = {};
  matches.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;
    sections[match[1]] = unescapeSection(source.slice(start, end));
  });
  const accountText = cleanText(sections["Target company"]);
  const buyerText = cleanText(sections["Buyer persona"]);
  const offer = cleanText(sections["Product or service"], 1000);
  const objective = cleanText(sections["Practice objective"], 2000);
  if (!accountText || !buyerText || !offer || !objective) throw new Error("Account, buyer, product/service, and practice objective are all required.");
  return {
    scenarioId,
    trackId,
    focusId,
    practiceMode: field("Mode") === "free" ? "free" : "guided",
    accountText,
    buyerText,
    offer,
    objective
  };
}
