import { cleanText, labeledValue } from "./accounts.js";

function monogram(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "BP";
}

const maya = {
  id: "maya",
  name: "Maya Chen",
  shortName: "Maya",
  monogram: "MC",
  role: "VP of Customer Experience",
  company: "Northstar Telecom",
  priorities: ["Faster routine answers without making support feel less human.", "Customer adoption, service quality, and operational control."],
  concerns: ["Unproven customer impact", "Weak handoffs to human agents", "Implementation effort without a useful baseline"],
  coachingFocus: "Connect the discussion to customer experience, human handoffs, and measurable service outcomes.",
  agentPrompt: "You are Maya Chen, VP of Customer Experience. Emphasize customer waiting, repeat contacts, human handoffs, service adoption, and operational control.",
  evidenceGroups: [{ label: "Customer-experience buyer", items: [
    ["buyer_customer_outcome", "Customer outcome", "customer experience|customer waiting|customer adoption|service quality|routine answer"],
    ["buyer_human_handoff", "Human handoff", "human agent|handoff|complex|sensitive|escalat"]
  ] }],
  reviewCriterion: { id: "buyer_maya_alignment", label: "Customer-experience alignment", description: "Connected the offer to customer experience, service quality, human judgment, and an evidence-based next step." }
};

const daniel = {
  id: "daniel",
  name: "Daniel Okafor",
  shortName: "Daniel",
  monogram: "DO",
  role: "Chief Technology Officer",
  company: "Northstar Telecom",
  priorities: ["A supportable architecture with clear operating ownership.", "Bounded validation before production or implementation commitments."],
  concerns: ["Unknown systems and integration effort", "Reliability and failure handling", "Unclear operational ownership after launch"],
  coachingFocus: "Make architecture, integration, reliability, ownership, and validation unknowns explicit. Do not improvise technical commitments.",
  agentPrompt: "You are Daniel Okafor, Chief Technology Officer. Challenge vague architecture, integration, reliability, operating-ownership, and implementation claims. Prefer bounded technical validation.",
  evidenceGroups: [{ label: "CTO buyer", items: [
    ["buyer_architecture", "Architecture and ownership", "architecture|operating owner|operational ownership|system owner|support model"],
    ["buyer_technical_validation", "Technical validation", "technical validation|integration effort|reliability|failure handling|implementation risk"]
  ] }],
  reviewCriterion: { id: "buyer_daniel_alignment", label: "CTO alignment", description: "Addressed architecture, integration, reliability, and operating ownership with explicit validation rather than unsupported technical commitments." }
};

const priya = {
  id: "priya",
  name: "Priya Raman",
  shortName: "Priya",
  monogram: "PR",
  role: "Chief Information Security Officer",
  company: "Northstar Telecom",
  priorities: ["Clear data boundaries, review gates, and failure handling.", "Evidence before security, privacy, compliance, or procurement commitments."],
  concerns: ["Unbounded data access", "Unverified retention or compliance claims", "Missing security ownership and review steps"],
  coachingFocus: "Clarify data access, retention, privacy, compliance review, failure handling, and security ownership. Never guarantee a control or certification.",
  agentPrompt: "You are Priya Raman, Chief Information Security Officer. Challenge data access, retention, privacy, residency, compliance, failure-handling, and security-ownership claims. Require evidence and review.",
  evidenceGroups: [{ label: "CISO buyer", items: [
    ["buyer_data_boundary", "Data boundaries", "data access|data boundary|retention|privacy|residency|personally identifiable|PII"],
    ["buyer_security_review", "Security review and evidence", "security review|compliance|certification|security owner|risk|audit"]
  ] }],
  reviewCriterion: { id: "buyer_priya_alignment", label: "CISO alignment", description: "Addressed data boundaries, privacy, retention, compliance review, and security ownership without guaranteeing unverified controls." }
};

export const buyerPersonas = { maya, daniel, priya };

export function createCustomBuyer(text, company = "Custom target company") {
  const rawText = cleanText(text);
  if (!rawText) throw new Error("Add a buyer persona before continuing.");
  const heading = rawText.match(/^#\s+(.+)$/m)?.[1]?.replace(/[`*_]/g, "").trim() || "";
  const name = (labeledValue(rawText, ["Buyer", "Buyer name", "Name", "Persona"]) || heading || "Custom buyer").slice(0, 160);
  const role = (labeledValue(rawText, ["Role", "Title", "Job title", "Buyer role"]) || "Buyer persona").slice(0, 180);
  const shortName = name.split(/\s+/)[0] || "Buyer";
  return {
    id: "custom",
    name,
    shortName,
    monogram: monogram(name),
    role,
    company,
    priorities: ["Use the supplied buyer context and keep unstated details as discovery unknowns."],
    concerns: ["Unsupported claims", "Generic discovery that ignores the supplied account and buyer context"],
    coachingFocus: "Use the uploaded buyer's stated priorities and concerns. Ask about missing details rather than inventing them.",
    agentPrompt: `Play the buyer defined in the supplied reference text. Buyer name: ${name}. Buyer role: ${role}. Use only the supplied facts and mark other details as unknown.`,
    evidenceGroups: [{ label: "Uploaded buyer", items: [
      ["buyer_priorities", "Buyer priorities", "priority|priorities|goal|objective|success|outcome"],
      ["buyer_concerns", "Buyer concerns", "concern|risk|objection|constraint|unknown|requirement"]
    ] }],
    reviewCriterion: { id: "buyer_custom_alignment", label: "Buyer and account alignment", description: "Used the supplied target-account and buyer context accurately, preserved unknowns, and connected the offer to the buyer's stated priorities." },
    rawText
  };
}
