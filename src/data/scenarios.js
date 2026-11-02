export const scenarioStructures = {
  full: {
    id: "full",
    label: "Full discovery",
    track: null,
    summary: "A balanced conversation from current-state discovery through a concrete next step.",
    objective: "Understand the account and buyer, connect the offer to a defensible outcome, and agree on a useful next step.",
    agentFocus: "Run a balanced discovery-to-next-step conversation. Do not rush to a pitch or supply missing account facts.",
    compass: "Discover first, connect value to evidence, and earn a concrete next step.",
    talkTrack: [],
    evidenceGroups: [],
    rubric: null
  },
  qualification: {
    id: "qualification",
    label: "Qualification and value",
    track: "seller",
    summary: "Practice business pain, measurable value, stakeholders, decision dynamics, and an honest partner-services hypothesis.",
    objective: "Qualify the problem and value case without inventing metrics, budget, authority, or customer commitment.",
    agentFocus: "Test whether the learner establishes pain, metrics, stakeholders, decision dynamics, and value before recommending a path.",
    compass: "Tie value to a baseline and stakeholder evidence. Leave unknowns open.",
    talkTrack: [
      { title: "Current problem", text: "Establish the current workflow, friction, and why the issue matters now." },
      { title: "Value and qualification", text: "Explore measurable outcomes, economic ownership, decision criteria, champions, and alternatives without reciting a framework." },
      { title: "Bounded next step", text: "Propose a working session or validation that resolves a named unknown with an owner and timing." }
    ],
    evidenceGroups: [],
    rubric: [
      { id: "qualification_problem", label: "Problem qualification", description: "Established the problem, current workflow, impact, and missing baseline before proposing value." },
      { id: "qualification_dynamics", label: "Stakeholders and decision dynamics", description: "Explored relevant authority, criteria, process, champions, and alternatives naturally without fabricating answers." },
      { id: "qualification_value", label: "Defensible value and next step", description: "Connected the offer and partner services to a bounded value hypothesis and a concrete next step." }
    ]
  },
  technical: {
    id: "technical",
    label: "Technical validation and handoff",
    track: "solutions-consultant",
    summary: "Map systems, constraints, failure paths, and the evidence required for a safe technical validation.",
    objective: "Gather enough accurate technical context to define validation and specialist handoffs without overcommitting.",
    agentFocus: "Test workflow, systems, data, integration constraints, failure paths, reliability, security review, and validation ownership.",
    compass: "Map constraints and failure paths. Validate before making commitments.",
    talkTrack: [
      { title: "Workflow and systems", text: "Trace one workflow and identify systems, data, permissions, owners, and integration unknowns." },
      { title: "Failure and controls", text: "Explore unavailable data, low confidence, human handoff, testing, monitoring, reliability, and security review." },
      { title: "Validation plan", text: "Define inputs, acceptance evidence, specialist participation, and a bounded technical session." }
    ],
    evidenceGroups: [],
    rubric: [
      { id: "technical_workflow", label: "Workflow and systems", description: "Mapped workflow, systems, data, permissions, owners, and integration constraints without assuming unavailable facts." },
      { id: "technical_controls", label: "Failure paths and controls", description: "Explored testing, monitoring, reliability, failure handling, and required security or specialist review." },
      { id: "technical_validation", label: "Bounded validation", description: "Defined a technical validation with inputs, acceptance evidence, owners, and explicit open items." }
    ]
  },
  objections: {
    id: "objections",
    label: "Objection handling and proof",
    track: "seller",
    summary: "Respond to skepticism without defensiveness, invented proof, or unsupported ROI and technical claims.",
    objective: "Clarify the buyer's concern, answer only what is known, and turn unsupported claims into a validation path.",
    agentFocus: "Raise two relevant concerns about value, proof, integration, security, timing, or change. Challenge unsupported claims calmly.",
    compass: "Clarify the concern, acknowledge the unknown, and prove only what the evidence supports.",
    talkTrack: [
      { title: "Clarify", text: "Ask what sits behind the objection and whether it concerns value, feasibility, proof, risk, or timing." },
      { title: "Respond honestly", text: "Use only supplied evidence. Attribute customer stories to their own context and never invent a result or commitment." },
      { title: "Resolve or validate", text: "Answer what can be answered now and define the owner, evidence, and next step for the rest." }
    ],
    evidenceGroups: [{ label: "Objection handling", items: [
      ["objection_clarified", "Concern clarified", "what concerns|behind that|help me understand|which risk|what would need"],
      ["objection_evidence", "Evidence boundary", "source|evidence|I don't know|cannot confirm|validate|assumption"]
    ] }],
    rubric: [
      { id: "objection_clarity", label: "Concern clarified", description: "Explored the actual concern instead of answering defensively or prematurely." },
      { id: "objection_proof", label: "Proof discipline", description: "Used accurate attribution and explicit uncertainty without invented ROI, customer proof, or technical commitments." },
      { id: "objection_resolution", label: "Resolution path", description: "Answered known points and established a useful validation or specialist path for unresolved concerns." }
    ]
  },
  escalation: {
    id: "escalation",
    label: "Customer escalation and recovery",
    track: "seller",
    summary: "Practice a calm recovery conversation when the buyer is frustrated by unclear value, risk, or progress.",
    objective: "Understand the escalation, take appropriate ownership, and agree on a recovery action without assigning blame or promising an outcome.",
    agentFocus: "Express a credible concern about progress, communication, value, or risk. Expect acknowledgment, clarification, ownership, and a specific recovery action.",
    compass: "Listen fully, acknowledge the issue, establish facts, and close on ownership and timing.",
    talkTrack: [
      { title: "Listen and acknowledge", text: "Let the buyer explain the impact. Acknowledge the concern without admitting unknown facts or blaming another team." },
      { title: "Establish the recovery need", text: "Clarify what happened, what remains unknown, who is affected, and what a useful recovery looks like." },
      { title: "Commit to a bounded action", text: "Agree on an owner, action, communication time, and review point without guaranteeing resolution." }
    ],
    evidenceGroups: [{ label: "Recovery", items: [
      ["recovery_acknowledged", "Concern acknowledged", "I understand|thank you for|I hear|acknowledge|impact"],
      ["recovery_ownership", "Action and ownership", "I will|owner|by tomorrow|follow up|recovery|review point"]
    ] }],
    rubric: [
      { id: "escalation_listening", label: "Listening and acknowledgment", description: "Heard the concern and impact without interruption, defensiveness, blame, or unsupported admission." },
      { id: "escalation_facts", label: "Facts and recovery outcome", description: "Separated known facts from unknowns and clarified what a useful recovery would require." },
      { id: "escalation_action", label: "Recovery action", description: "Agreed on a bounded action, owner, communication timing, and review point without guaranteeing resolution." }
    ]
  }
};

export const sellerFocuses = [
  { id: "medd_metrics", framework: "MEDDPICC", label: "Metrics", evidenceId: "metrics", guidance: "Establish the current baseline and the measure that would demonstrate value." },
  { id: "medd_economic_buyer", framework: "MEDDPICC", label: "Economic Buyer", evidenceId: "economic_buyer", guidance: "Clarify economic ownership without assuming the current buyer controls budget." },
  { id: "medd_decision_criteria", framework: "MEDDPICC", label: "Decision Criteria", evidenceId: "decision_criteria", guidance: "Discover the requirements and evidence used to compare options." },
  { id: "medd_decision_process", framework: "MEDDPICC", label: "Decision Process", evidenceId: "decision_process", guidance: "Map evaluation, approval, stakeholders, and timing without implying approval." },
  { id: "medd_paper_process", framework: "MEDDPICC", label: "Paper Process", evidenceId: "paper_process", guidance: "Explore procurement, legal, security, and contracting steps as unknowns." },
  { id: "medd_identify_pain", framework: "MEDDPICC", label: "Identify Pain", evidenceId: "identify_pain", guidance: "Understand operational pain and its consequences before pitching." },
  { id: "medd_champion", framework: "MEDDPICC", label: "Champion", evidenceId: "champion", guidance: "Explore who has influence, credibility, and a reason to support the work." },
  { id: "medd_competition", framework: "MEDDPICC", label: "Competition", evidenceId: "competition", guidance: "Understand alternatives, including the current process and doing nothing." },
  { id: "cotm_current_pain", framework: "Command of the Message", label: "Current-State Pain", evidenceId: "current_pain", guidance: "Describe the current state in the buyer's terms before introducing the offer." },
  { id: "cotm_desired_outcomes", framework: "Command of the Message", label: "Desired Outcomes", evidenceId: "desired_outcomes", guidance: "Establish the buyer's desired future state and outcomes." },
  { id: "cotm_required_capabilities", framework: "Command of the Message", label: "Required Capabilities", evidenceId: "required_capabilities", guidance: "Connect required capabilities to the desired outcome, not a generic feature list." },
  { id: "cotm_differentiation", framework: "Command of the Message", label: "Differentiation", evidenceId: "differentiation", guidance: "Explain relevant differentiation without unsupported superiority claims." },
  { id: "cotm_proof", framework: "Command of the Message", label: "Proof", evidenceId: "proof", guidance: "Use attributable proof and separate another customer's results from this account." },
  { id: "cotm_next_step", framework: "Command of the Message", label: "Next Step", evidenceId: "command_next_step", guidance: "Earn a specific action, owner, and timing tied to the buyer's need." }
];

export const technicalFocuses = [
  { id: "technical_workflow", framework: "Technical discovery", label: "Current workflow", evidenceId: "current_workflow", guidance: "Trace the workflow, owners, and human handoffs." },
  { id: "technical_systems", framework: "Technical discovery", label: "Systems and data", evidenceId: "systems_data", guidance: "Map systems, data, access, and permissions without assuming vendors." },
  { id: "technical_integration", framework: "Technical discovery", label: "Integration constraints", evidenceId: "integration_constraints", guidance: "Identify architecture and integration constraints that require validation." },
  { id: "technical_failures", framework: "Technical discovery", label: "Failure paths", evidenceId: "failure_paths", guidance: "Explore unavailable data, low confidence, errors, and graceful fallback." },
  { id: "technical_testing", framework: "Technical discovery", label: "Testing and monitoring", evidenceId: "testing_monitoring", guidance: "Define test evidence, monitoring, and operational review." },
  { id: "technical_reliability", framework: "Technical discovery", label: "Reliability", evidenceId: "reliability", guidance: "Clarify reliability expectations and recovery requirements without guarantees." },
  { id: "technical_deployment", framework: "Technical discovery", label: "Deployment constraints", evidenceId: "deployment_constraints", guidance: "Discover deployment, privacy, retention, residency, and rollout constraints." },
  { id: "technical_next", framework: "Technical discovery", label: "Validation next step", evidenceId: "validation_next_step", guidance: "Close on bounded validation with inputs, owners, and acceptance evidence." }
];

export function getScenario(id) {
  return scenarioStructures[id] || scenarioStructures.full;
}

export function getFocus(id, trackId = "seller") {
  return (trackId === "solutions-consultant" ? technicalFocuses : sellerFocuses).find(focus => focus.id === id) || null;
}
