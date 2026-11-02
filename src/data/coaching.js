import { buyingSignalPatterns, commonHandoffCues } from "./tracks.js";

export function messageCategory(text) {
  const value = text.toLowerCase();
  if (/next step|working session|pilot|invitation|timeline|follow up|owner|by when/.test(value)) return "close";
  if (/ROI|return on investment|percent|save|cost|revenue|proof|customer story|Revolut|Deutsche|objection|concern/i.test(text)) return "value";
  if (/integration|CRM|ticketing|telephony|security|compliance|testing|monitor|reliability|deployment|API|SIP|architecture|retention|privacy/i.test(text)) return "technical";
  return "discovery";
}

const buyerProbes = {
  maya: "What would your customers and support team need to see before you would trust that approach?",
  daniel: "Which system owner and operating team would need to validate that before it could be supportable?",
  priya: "What data would be accessed, who owns the security review, and what evidence would your team require?"
};

function offerFor(offer) {
  return offer || "ElevenAgents voice and chat agents";
}

const scenarioResponses = {
  full: {
    seller: {
      discovery: ({ buyer, offer }) => `${buyer.shortName}, I'd like to understand one important customer interaction before I suggest anything. What happens today, where does friction appear, and what work does your team repeat? If we can establish that baseline together, we can test whether ${offerFor(offer)} belongs in the routine part while your team keeps complex or sensitive conversations. ${buyerProbes[buyer.id] || "Which of your priorities would matter most in that evaluation?"}`,
      value: ({ buyer, offer }) => `I can't responsibly promise results another customer reported. What I can suggest is a small validation of ${offerFor(offer)} around one workflow. We would baseline the current outcome, agree on what to measure, and test the routine steps with a clear handoff to your team. Our partner team can help with discovery, integration, implementation, and optimization if the case justifies it. Would that be a useful way to assess value without getting ahead of the evidence?`,
      technical: ({ buyer }) => `I don't want to guess at your architecture or make a security commitment on this call. I can bring our solutions consultant and the right specialist into a working session with your IT and security owners. Before then, could you tell me which systems are involved, who owns them, and what a handoff must preserve? ${buyerProbes[buyer.id] || "What constraint should shape the validation first?"}`,
      close: ({ offer }) => `I'd like to suggest a 45-minute working session with you and the relevant operational, technical, or security owner for one workflow. We will map the current process, the baseline you want to improve, and what a safe validation of ${offerFor(offer)} would require. You do not need to commit to a rollout. If there is a useful case after that session, we can define the next step together. Who should we include, and what day could work?`
    },
    "solutions-consultant": {
      discovery: ({ buyer }) => `${buyer.shortName}, I'd like to trace one routine request end to end. Which system identifies the customer, where does your team find the required information, and what do they update before closing the request? I also need to understand what happens when information is unavailable or the customer needs a person. Once we know those steps and failure points, we can define what to validate and where a human handoff belongs.`,
      value: () => `I can help define the evidence, but I can't turn another customer's results into your business case. For a first validation, I would measure task completion, transfer quality, latency, and failure rates on one routine workflow, then compare those results with your current baseline. Which measures would matter most to you and the operating owner?`,
      technical: ({ buyer }) => `I can outline the discovery, but I shouldn't confirm integration or production readiness without the system details. Which platforms are involved, and can they expose the required data through supported interfaces? I also need identity, permissions, retention, latency, and human-handoff requirements. ${buyerProbes[buyer.id] || "Which specialist should help us validate the remaining constraints?"}`,
      close: () => `For the next step, I'd like to schedule a technical validation session with the relevant operations, IT, and security owners. We'll map one workflow, confirm available interfaces and data permissions, define human-handoff behavior, and write down test cases and acceptance criteria. Missing inputs stay open validation items rather than commitments. Who should we include from your side?`
    }
  },
  qualification: {
    seller: {
      discovery: ({ buyer, offer }) => `Before we discuss ${offerFor(offer)}, I want to understand why this problem matters now. What is happening in the current process, what impact does it have, and how do you measure that today? ${buyerProbes[buyer.id] || "Who else feels that impact most directly?"}`,
      value: ({ offer }) => `The value case for ${offerFor(offer)} should start with your baseline, not a generic benchmark. Which metric would need to change, who owns that outcome, and what evidence would make the investment worth evaluating? I can help test that value, but I don't want to assume a budget or result you haven't confirmed.`,
      technical: () => `That requirement could affect both qualification and feasibility. Which systems, controls, or constraints are non-negotiable, and who would assess them? I'll separate the business requirement from the technical validation so we don't treat an assumption as a commitment.`,
      close: ({ offer }) => `A useful next step would be a qualification working session with the outcome owner and the person who owns the evaluation process. We would document the baseline, decision criteria, open technical questions, and what a bounded validation of ${offerFor(offer)} would need to prove. Who owns those two perspectives, and when could we bring them together?`
    }
  },
  technical: {
    "solutions-consultant": {
      discovery: ({ buyer }) => `${buyer.shortName}, can we trace one workflow from trigger to completion? I need the systems, data, permissions, human steps, and operational owner, plus what happens when any dependency is unavailable. That gives us a factual starting point for validation.`,
      value: () => `Rather than treat an expected outcome as proof, I would turn it into an acceptance criterion. What task must complete, what latency or failure rate is acceptable, and what evidence would your team review? We can compare those results with the current workflow before discussing broader value.`,
      technical: ({ buyer }) => `I shouldn't confirm that integration or control without evidence. Which interfaces and data permissions exist, what failure behavior is required, and who owns architecture and security review? ${buyerProbes[buyer.id] || "Which specialist should be in the validation session?"}`,
      close: () => `I suggest a bounded technical validation with the system owner, security reviewer where needed, and our specialist. We will leave with a workflow map, confirmed interfaces, failure cases, test data boundaries, acceptance criteria, and named open items. Which owner should we start with, and what inputs can they bring?`
    }
  },
  objections: {
    seller: {
      discovery: ({ buyer }) => `That's a fair concern, ${buyer.shortName}. Before I respond, what sits behind it for you: customer value, feasibility, proof, risk, or timing? Understanding the specific issue will help me answer what I can and avoid giving you a generic reassurance.`,
      value: ({ offer }) => `I can't use another customer's outcome as proof for your account. The accurate statement is that ${offerFor(offer)} is a hypothesis to evaluate against your baseline and requirements. If that distinction does not address the concern, we should define the evidence you would need rather than debate a claimed result.`,
      technical: () => `I don't have enough verified information to confirm that technical or security point, and I would rather not improvise. I can bring the right specialist and your system owner into a review. What specific constraint or failure case should they answer, and what evidence would you accept?`,
      close: () => `We've identified the concern and the parts that still need evidence. I suggest we document the unanswered question, assign the right owner, and schedule a short review with the required source or validation result. Would that address the immediate issue without asking you to accept an unsupported commitment?`
    }
  },
  escalation: {
    seller: {
      discovery: ({ buyer }) => `${buyer.shortName}, thank you for being direct. I want to understand the impact before proposing a fix. What happened from your perspective, who has been affected, and what is still preventing the outcome you expected?`,
      value: () => `I hear that the current situation has not met your expectation. I don't want to defend it before we establish the facts or promise a result I cannot guarantee. What would a useful recovery look like for your team, and which issue needs to be addressed first?`,
      technical: () => `I don't yet have enough verified detail to explain the technical cause. I can take responsibility for getting the right owner and documenting what we know, what remains unconfirmed, and the immediate safeguard. Which impact should we prioritize while that investigation happens?`,
      close: () => `Here is the action I can commit to: I will document the issue and open facts, bring in the named owner, and send you a status update at the time we agree. We can then review the evidence and decide the next recovery step together. What timing would give your team the visibility it needs?`
    }
  }
};

export function verbatimResponse({ scenario, trackId, latestText, buyer, offer }) {
  const category = messageCategory(latestText || "");
  const responses = scenarioResponses[scenario.id]?.[trackId] || scenarioResponses.full[trackId];
  const response = responses[category] || responses.discovery;
  return response({ buyer, offer });
}

function excerpt(text) {
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
}

export function inspectTranscript({ evidenceGroups, agentName }, messages, prior = { evidence: {}, signals: {}, handoffs: {} }) {
  const evidence = { ...prior.evidence };
  const signals = { ...prior.signals };
  const handoffs = { ...prior.handoffs };
  const items = evidenceGroups.flatMap(group => group.items);
  for (const message of messages) {
    const text = message.text;
    for (const [id, label, pattern] of items) {
      if (!evidence[id] && new RegExp(pattern, "i").test(text)) {
        evidence[id] = { id, label, excerpt: excerpt(text), speaker: message.speaker };
      }
    }
    if (message.speaker === agentName) {
      for (const signal of buyingSignalPatterns) {
        if (!signals[signal.id] && new RegExp(signal.pattern, "i").test(text)) {
          signals[signal.id] = { ...signal, excerpt: excerpt(text) };
        }
      }
    }
    for (const cue of commonHandoffCues) {
      if (!handoffs[cue.id] && new RegExp(cue.pattern, "i").test(text)) {
        handoffs[cue.id] = { ...cue, excerpt: excerpt(text) };
      }
    }
  }
  return { evidence, signals, handoffs };
}

export function compassMessage({ scenario, trackId, focus, buyer }, latestText) {
  if (focus) return focus.guidance;
  const category = messageCategory(latestText || "");
  if (buyer.id !== "maya" && (category === "technical" || category === "value")) return buyer.coachingFocus;
  if (scenario.id !== "full") return scenario.compass;
  const messages = {
    seller: {
      discovery: "Ask about current work and impact. Do not pitch yet.",
      value: "Separate customer value, partner-service hypotheses, and sourced proof.",
      technical: "Clarify stakeholders and constraints. Use a specialist before commitments.",
      close: "Seek a bounded action, owner, and timing without inventing agreement."
    },
    "solutions-consultant": {
      discovery: "Trace the workflow, systems, data, and handoffs.",
      value: "Turn the claim into evidence required for validation.",
      technical: "Map constraints, tests, failure paths, and specialist needs.",
      close: "Close on technical discovery or validation with the right stakeholders."
    }
  };
  return messages[trackId][category];
}
