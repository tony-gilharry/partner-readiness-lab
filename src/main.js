import { tracks, commonHandoffCues, buyingSignalPatterns } from "./data/tracks.js";
import { northstarAccount, createCustomAccount, cleanText, MAX_DOCUMENT_LENGTH } from "./data/accounts.js";
import { buyerPersonas, createCustomBuyer } from "./data/personas.js";
import { scenarioStructures, sellerFocuses, technicalFocuses, getScenario, getFocus } from "./data/scenarios.js";
import { serializeScenarioPack, parseScenarioPack } from "./data/scenario-pack.js";
import { verbatimResponse, inspectTranscript, compassMessage } from "./data/coaching.js";
import { createConversationController } from "./conversation.js";
import resourceManifest from "../resources/manifest.json";

const AGENT_KEY = "partnerCertificationLab.agentId";
const AGENTS_KEY = "partnerCertificationLab.agentIds";
const CONTEXT_KEY = "partnerCertificationLab.sessionContext";
const REVIEW_KEY = "partnerCertificationLab.sessionReview";
const TRACK_KEY = "partnerCertificationLab.selectedTrack";
const SETUP_KEY = "partnerCertificationLab.practiceSetup";
const decisionLabels = { pass: "Pass", revise: "Revise", needs_review: "Needs review" };
const $ = id => document.getElementById(id);
const elements = Object.fromEntries([
  "workspace", "setup-panel", "session-panel", "evaluation-panel", "review-stage", "coach-content", "fde-panel",
  "account-source", "buyer-select", "buyer-select-field", "scenario-select", "focus-select", "scenario-summary", "track-picker",
  "custom-fields", "account-text", "buyer-text", "account-file", "buyer-file", "account-template", "buyer-template",
  "offer-input", "objective-input", "pack-file", "export-pack", "pack-status", "agent-form", "agent-id", "agent-label", "agent-hint", "agent-error",
  "start-session", "setup-message", "track-outcome", "session-status", "voice-mode", "conversation-id", "transcript", "response-coach",
  "response-coach-title", "coach-ready", "verbatim-script", "use-script", "response-context", "composer", "send-text", "session-error",
  "reconnect-session", "end-session", "session-timer", "time-cue", "talk-share", "ratio-fill", "compass-copy", "handoff-cues",
  "evidence-title", "evidence-copy", "evidence-section", "signals-section", "track-evidence", "buying-signals", "evaluation-title",
  "evaluation-copy", "evaluation-summary", "open-evaluation", "evaluation-opened", "continue-review", "free-return", "review-stage-title",
  "review-stage-copy", "saved-decision", "return-evaluation", "review-form", "review-criteria", "reviewer-notes", "overall-decision",
  "human-confirmation", "review-error", "print-record", "save-status", "fde-title", "fde-outcome", "print-sheet", "print-title",
  "print-content", "print-footer", "practice-review", "restart-lab", "reset-lab", "stage-note", "state-announcement", "lab-title",
  "lab-deck", "decision-fact", "persona-monogram", "conversation-title", "conversation-subtitle"
].map(id => [id, $(id)]));

let selectedTrack = "seller";
let selectedScenarioId = "full";
let selectedBuyerId = "maya";
let accountSource = "northstar";
let selectedFocusId = "";
let practiceMode = "guided";
let customAccountText = "";
let customBuyerText = "";
let offer = "";
let objective = "";
let agentIds = { maya: "", daniel: "", priya: "", custom: "" };
let agentId = "";
let phase = "setup";
let context = null;
let savedReview = null;
let thread = [];
let latestBuyerText = "";
let coaching = { evidence: {}, signals: {}, handoffs: {} };
let metrics = { elapsedSeconds: 0, talkSeconds: 0, listenSeconds: 0, talkShare: null, conversationId: "" };
let lastPersistSecond = -1;

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch { return false; }
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch { /* Storage can be unavailable. */ }
}
function loadJson(key) {
  try { return JSON.parse(storageGet(key) || "null"); } catch { return null; }
}
function createAttemptId() {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return `lab_${id}`;
}
function snapshot() {
  return {
    scenarioId: selectedScenarioId,
    track: selectedTrack,
    buyerId: selectedBuyerId,
    accountSource,
    focusId: selectedFocusId,
    practiceMode,
    accountText: customAccountText,
    buyerText: customBuyerText,
    offer,
    objective
  };
}
function applySnapshot(value = {}) {
  const scenario = scenarioStructures[value.scenarioId] ? value.scenarioId : "full";
  selectedScenarioId = scenario;
  const requiredTrack = getScenario(scenario).track;
  selectedTrack = requiredTrack || (tracks[value.track] ? value.track : "seller");
  selectedBuyerId = buyerPersonas[value.buyerId] ? value.buyerId : "maya";
  accountSource = value.accountSource === "custom" ? "custom" : "northstar";
  practiceMode = value.practiceMode === "free" ? "free" : "guided";
  selectedFocusId = getFocus(value.focusId, selectedTrack)?.id || "";
  customAccountText = cleanText(value.accountText);
  customBuyerText = cleanText(value.buyerText);
  offer = cleanText(value.offer, 1000);
  objective = cleanText(value.objective, 2000);
}
function saveSetup() {
  storageSet(SETUP_KEY, JSON.stringify(snapshot()));
  storageSet(AGENTS_KEY, JSON.stringify(agentIds));
}
function newContext(mode = "attempt") {
  return {
    ...snapshot(),
    version: 4,
    mode,
    practiceMode: mode === "practice" ? "guided" : practiceMode,
    localAttemptId: createAttemptId(),
    callStarted: false,
    conversationId: "",
    sessionState: "idle",
    evaluationOpened: false,
    phase: mode === "practice" ? "review" : "configured",
    elapsedSeconds: 0,
    talkSeconds: 0,
    listenSeconds: 0,
    evidenceIds: [],
    buyingSignalIds: [],
    handoffCueIds: []
  };
}
function migrateContext(value) {
  if (!value || !["attempt", "practice"].includes(value.mode) || !tracks[value.track] || typeof value.localAttemptId !== "string") return null;
  if (value.version === 4) return value;
  if (value.version !== 3) return null;
  return {
    ...value,
    version: 4,
    scenarioId: "full",
    buyerId: "maya",
    accountSource: "northstar",
    focusId: "",
    practiceMode: "guided",
    accountText: "",
    buyerText: "",
    offer: "",
    objective: ""
  };
}
function validContext(value) {
  return Boolean(value && value.version === 4 && ["attempt", "practice"].includes(value.mode) && tracks[value.track] && scenarioStructures[value.scenarioId || "full"] && typeof value.localAttemptId === "string" && Array.isArray(value.evidenceIds) && Array.isArray(value.buyingSignalIds));
}
function hasTerminalSession(value) {
  return Boolean(value && value.callStarted && value.conversationId && value.sessionState === "terminal");
}
function hasQualifyingSession(value) {
  return Boolean(hasTerminalSession(value) && value.practiceMode !== "free" && Number(value.elapsedSeconds) >= 600);
}
function persistContext() {
  if (!context) return;
  const safe = {
    ...snapshot(),
    scenarioId: context.scenarioId,
    track: context.track,
    buyerId: context.buyerId,
    accountSource: context.accountSource,
    focusId: context.focusId,
    practiceMode: context.practiceMode,
    accountText: cleanText(context.accountText),
    buyerText: cleanText(context.buyerText),
    offer: cleanText(context.offer, 1000),
    objective: cleanText(context.objective, 2000),
    version: 4,
    mode: context.mode,
    localAttemptId: context.localAttemptId,
    callStarted: Boolean(context.callStarted),
    conversationId: String(context.conversationId || ""),
    sessionState: String(context.sessionState || "legacy_unverified"),
    evaluationOpened: Boolean(context.evaluationOpened),
    phase: context.phase,
    elapsedSeconds: Number(context.elapsedSeconds) || 0,
    talkSeconds: Number(context.talkSeconds) || 0,
    listenSeconds: Number(context.listenSeconds) || 0,
    evidenceIds: [...new Set(context.evidenceIds || [])],
    buyingSignalIds: [...new Set(context.buyingSignalIds || [])],
    handoffCueIds: [...new Set(context.handoffCueIds || [])]
  };
  context = { ...context, ...safe };
  storageSet(CONTEXT_KEY, JSON.stringify(safe));
}
function ratioText(value = metrics) {
  if (value.talkShare === null || value.talkShare === undefined) return "No voiced audio";
  const talk = Math.round(value.talkShare * 100);
  return `${talk}% talking / ${100 - talk}% listening`;
}
function formatDuration(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0));
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" })[character]);
}
function activeAccount(value = null) {
  const source = value?.accountSource || accountSource;
  if (source === "northstar") return northstarAccount;
  const text = value ? value.accountText : customAccountText;
  return createCustomAccount(text || "Company: Custom target company\nIndustry: Not specified");
}
function activeBuyer(value = null) {
  const source = value?.accountSource || accountSource;
  const account = activeAccount(value);
  if (source === "northstar") return buyerPersonas[value?.buyerId || selectedBuyerId] || buyerPersonas.maya;
  const text = value ? value.buyerText : customBuyerText;
  return createCustomBuyer(text || "Name: Custom buyer\nRole: Buyer persona", account.company);
}
function activeScenario(value = null) {
  return getScenario(value?.scenarioId || selectedScenarioId);
}
function activeTrackId(value = null) {
  return value?.track || selectedTrack;
}
function activeFocus(value = null) {
  return getFocus(value ? value.focusId : selectedFocusId, activeTrackId(value));
}
function activeOffer(value = null) {
  return (value ? value.offer : offer) || "ElevenAgents voice and chat agents";
}
function activeObjective(value = null) {
  return (value ? value.objective : objective) || activeScenario(value).objective;
}
function activeAgentKey() {
  return accountSource === "custom" ? "custom" : selectedBuyerId;
}
function activeEvidenceGroups(value = null) {
  const trackId = activeTrackId(value);
  const scenario = activeScenario(value);
  const buyer = activeBuyer(value);
  return [...tracks[trackId].evidenceGroups, ...scenario.evidenceGroups, ...buyer.evidenceGroups];
}
function activeRubric(value = null) {
  const scenario = activeScenario(value);
  const base = scenario.rubric || tracks[activeTrackId(value)].rubric;
  return [...base, activeBuyer(value).reviewCriterion];
}
function evidenceDefinitions(value = null) {
  return activeEvidenceGroups(value).flatMap(group => group.items.map(([id, label]) => ({ id, label })));
}
function signalDefinition(id) {
  return buyingSignalPatterns.find(item => item.id === id);
}
function validateCustomSetup() {
  if (accountSource !== "custom") return null;
  if (!cleanText(customAccountText)) return { message: "Add a target-company dossier before starting.", target: elements["account-text"] };
  if (!cleanText(customBuyerText)) return { message: "Add a buyer persona before starting.", target: elements["buyer-text"] };
  if (!cleanText(offer, 1000)) return { message: "Describe the product or service you are selling.", target: elements["offer-input"] };
  if (!cleanText(objective, 2000)) return { message: "Add your practice objective.", target: elements["objective-input"] };
  return null;
}

function renderDossier(value = null) {
  const account = activeAccount(value);
  const buyer = activeBuyer(value);
  const buyerSections = [
    { title: `${buyer.shortName}'s priorities`, facts: buyer.priorities },
    { title: "Likely concerns", facts: buyer.concerns }
  ];
  $("panel-dossier").innerHTML = `
    <h2>${escapeHtml(account.company)}</h2>
    <p class="dossier-persona">${escapeHtml(account.industry)} · ${escapeHtml(buyer.name)}, ${escapeHtml(buyer.role)}</p>
    <p class="dossier-disclaimer">${escapeHtml(account.disclaimer)}</p>
    ${[...account.sections, ...buyerSections].map(section => `<section class="dossier-section"><h3>${escapeHtml(section.title)}</h3><ul>${section.facts.map(fact => `<li>${escapeHtml(fact)}</li>`).join("")}</ul></section>`).join("")}
  `;
}
function renderFocusOptions() {
  const focuses = selectedTrack === "solutions-consultant" ? technicalFocuses : sellerFocuses;
  const groups = [...new Set(focuses.map(focus => focus.framework))];
  elements["focus-select"].innerHTML = `<option value="">Balanced, no focus</option>${groups.map(group => `<optgroup label="${escapeHtml(group)}">${focuses.filter(focus => focus.framework === group).map(focus => `<option value="${focus.id}">${escapeHtml(focus.label)}</option>`).join("")}</optgroup>`).join("")}`;
  elements["focus-select"].value = selectedFocusId;
}
function renderScenarioControls() {
  const scenario = activeScenario();
  elements["account-source"].value = accountSource;
  elements["buyer-select"].value = selectedBuyerId;
  elements["buyer-select-field"].hidden = accountSource === "custom";
  elements["scenario-select"].value = selectedScenarioId;
  elements["scenario-summary"].textContent = scenario.summary;
  elements["custom-fields"].hidden = accountSource !== "custom";
  elements["track-picker"].hidden = Boolean(scenario.track);
  if (document.activeElement !== elements["account-text"]) elements["account-text"].value = customAccountText;
  if (document.activeElement !== elements["buyer-text"]) elements["buyer-text"].value = customBuyerText;
  if (document.activeElement !== elements["offer-input"]) elements["offer-input"].value = offer;
  if (document.activeElement !== elements["objective-input"]) elements["objective-input"].value = objective;
  renderFocusOptions();
  document.querySelectorAll("[data-mode]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.mode === practiceMode)));
  document.querySelector(".certification-loop").classList.toggle("free-mode", practiceMode === "free");
  document.querySelector('[data-loop="evaluation"]').hidden = practiceMode === "free";
  document.querySelector('[data-loop="review"]').hidden = practiceMode === "free";
  elements["decision-fact"].textContent = practiceMode === "free" ? "No scoring" : "Human review";
  elements["practice-review"].hidden = practiceMode === "free";
}
function renderAgentForSelection() {
  const buyer = activeBuyer();
  const key = activeAgentKey();
  agentId = agentIds[key] || "";
  elements["agent-id"].value = agentId;
  elements["agent-label"].textContent = `Public ElevenLabs agent ID for ${buyer.name}`;
  elements["agent-hint"].textContent = accountSource === "custom"
    ? "Use a dedicated generic public agent for custom buyers. Its configured voice stays constant. Never enter an API key."
    : `Use ${buyer.shortName}'s dedicated public agent and configured voice. IDs are not secret. Never enter an API key.`;
  elements["agent-error"].hidden = true;
  elements["agent-id"].removeAttribute("aria-invalid");
}
function renderTrack() {
  const track = tracks[selectedTrack];
  const scenario = activeScenario();
  const account = activeAccount();
  const buyer = activeBuyer();
  const focus = activeFocus();
  elements["track-outcome"].textContent = `${activeObjective()} ${focus ? `Focus: ${focus.framework}, ${focus.label}.` : ""}`;
  elements["compass-copy"].textContent = focus?.guidance || scenario.compass;
  elements["evidence-title"].textContent = selectedTrack === "seller" ? "Methodology and buyer evidence" : "Technical and buyer evidence";
  elements["evidence-copy"].textContent = practiceMode === "free" ? "Free practice does not record evidence." : "Rules mark topics heard in the live transcript. Excerpts stay in memory and are not persisted.";
  document.querySelectorAll("[data-track]").forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.track === selectedTrack));
    button.disabled = Boolean(context?.callStarted || ["evaluation", "review", "summary"].includes(phase) || scenario.track);
  });
  const talkTrack = scenario.id === "full" ? track.talkTrack : scenario.talkTrack;
  $("panel-talk").innerHTML = `<h2>${escapeHtml(scenario.label)}</h2><p>${escapeHtml(activeObjective())}</p><p><strong>Offer:</strong> ${escapeHtml(activeOffer())}</p>${talkTrack.map(step => `<section class="talk-step"><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></section>`).join("")}<section class="talk-step"><h3>${escapeHtml(buyer.role)}</h3><p>${escapeHtml(buyer.coachingFocus)}</p></section>${focus ? `<section class="talk-step"><h3>${escapeHtml(focus.framework)} · ${escapeHtml(focus.label)}</h3><p>${escapeHtml(focus.guidance)}</p></section>` : ""}`;
  const resources = resourceManifest.filter(resource => resource.track === selectedTrack);
  $("panel-resources").innerHTML = `<h2>Official resources</h2><p>Learning notes link to primary ElevenLabs sources. Capabilities and availability can change.</p>${resources.map(resource => `<article class="resource-item"><h3>${escapeHtml(resource.title)}</h3><p>${escapeHtml(resource.note)}</p><p><strong>When to use:</strong> ${escapeHtml(resource.when)}</p><p class="resource-date">Source reviewed ${escapeHtml(resource.verified)}</p><a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener">Read the official source<span class="visually-hidden"> for ${escapeHtml(resource.title)}</span></a></article>`).join("")}`;
  elements["lab-title"].textContent = `The ${account.company} conversation`;
  elements["lab-deck"].textContent = `${scenario.label} with ${buyer.name}, ${buyer.role}. ${practiceMode === "free" ? "Free practice has no scoring or review gate." : "Prepare, practice, and make a human review decision."}`;
  elements["persona-monogram"].textContent = buyer.monogram;
  elements["conversation-title"].textContent = buyer.name;
  elements["conversation-subtitle"].textContent = `${buyer.role}, ${account.company}`;
  elements["response-coach-title"].textContent = `Say this to ${buyer.shortName}`;
  renderDossier();
  renderEvidence();
  renderReviewCriteria();
  renderResponseScript();
}
function renderResponseScript() {
  const buyer = activeBuyer();
  if (!latestBuyerText) {
    elements["verbatim-script"].hidden = true;
    elements["verbatim-script"].firstElementChild.textContent = "";
    elements["use-script"].hidden = true;
    elements["response-context"].textContent = `After ${buyer.shortName} speaks, your role-specific script will appear here.`;
    elements["coach-ready"].hidden = true;
    return;
  }
  const script = verbatimResponse({ scenario: activeScenario(), trackId: selectedTrack, latestText: latestBuyerText, buyer, offer: activeOffer() });
  elements["response-context"].textContent = `${tracks[selectedTrack].label} script for ${activeScenario().label}. Read this verbatim, or make it your own below.`;
  elements["verbatim-script"].firstElementChild.textContent = script;
  elements["verbatim-script"].hidden = false;
  elements["use-script"].hidden = false;
  elements["coach-ready"].hidden = false;
}
const transcriptNodes = new Map();
const announcedFinalIds = new Set();

function renderTranscript() {
  transcriptNodes.clear();
  announcedFinalIds.clear();
  elements.transcript.replaceChildren();
  $("transcript-announcement").textContent = "";
  const empty = document.createElement("div");
  empty.className = "transcript-empty";
  empty.textContent = `${activeBuyer().shortName}'s first message and your live transcript will appear here.`;
  elements.transcript.appendChild(empty);
}
function syncTranscript(messages) {
  elements.transcript.querySelector(".transcript-empty")?.remove();
  const ids = new Set(messages.map(message => message.id));
  for (const [id, node] of transcriptNodes) {
    if (!ids.has(id)) {
      node.article.remove();
      transcriptNodes.delete(id);
    }
  }
  let latestFinal = null;
  messages.forEach((message, index) => {
    let node = transcriptNodes.get(message.id);
    if (!node) {
      const article = document.createElement("article");
      article.dataset.turnId = message.id;
      const speaker = document.createElement("span");
      speaker.className = "speaker";
      const text = document.createElement("p");
      article.append(speaker, text);
      node = { article, speaker, text, signature: "" };
      transcriptNodes.set(message.id, node);
    }
    const className = `transcript-turn ${message.role === "user" ? "user" : "agent"}${message.tentative ? " tentative" : ""}`;
    const signature = `${className}|${message.speaker}|${message.text}|${message.tentative}`;
    if (node.signature !== signature) {
      node.article.className = className;
      node.speaker.textContent = `${message.speaker}${message.tentative ? ", tentative" : ""}`;
      node.text.textContent = message.text;
      node.signature = signature;
    }
    const childAtIndex = elements.transcript.children[index];
    if (childAtIndex !== node.article) elements.transcript.insertBefore(node.article, childAtIndex || null);
    if (!message.tentative && !announcedFinalIds.has(message.id)) {
      announcedFinalIds.add(message.id);
      latestFinal = message;
    }
  });
  if (latestFinal) $("transcript-announcement").textContent = `${latestFinal.speaker}: ${latestFinal.text}`;
  elements.transcript.scrollTop = elements.transcript.scrollHeight;
}
function appendHeardState(item, heard) {
  if (!heard) return;
  const state = document.createElement("span");
  state.className = "visually-hidden evidence-heard";
  state.textContent = ", Heard";
  item.appendChild(state);
}
function renderHandoffs() {
  elements["handoff-cues"].replaceChildren(...commonHandoffCues.map(cue => {
    const item = document.createElement("li");
    const heard = coaching.handoffs[cue.id] || context?.handoffCueIds?.includes(cue.id);
    item.classList.toggle("is-heard", Boolean(heard));
    item.textContent = cue.label;
    appendHeardState(item, heard);
    if (coaching.handoffs[cue.id]?.excerpt) {
      const excerpt = document.createElement("span");
      excerpt.className = "evidence-excerpt";
      excerpt.textContent = coaching.handoffs[cue.id].excerpt;
      item.appendChild(excerpt);
    }
    return item;
  }));
}
function renderEvidence() {
  const free = practiceMode === "free";
  elements["evidence-section"].hidden = free;
  elements["signals-section"].hidden = free;
  document.querySelector(".handoff-section").hidden = free;
  const focus = activeFocus();
  elements["track-evidence"].replaceChildren(...activeEvidenceGroups().map(group => {
    const wrapper = document.createElement("div");
    wrapper.className = "evidence-group";
    const title = document.createElement("h3");
    title.textContent = group.label;
    const list = document.createElement("ul");
    for (const [id, label] of group.items) {
      const item = document.createElement("li");
      const evidence = coaching.evidence[id];
      const heard = evidence || context?.evidenceIds?.includes(id);
      item.classList.toggle("is-heard", Boolean(heard));
      item.classList.toggle("is-focus", focus?.evidenceId === id);
      item.textContent = label;
      if (focus?.evidenceId === id) {
        const marker = document.createElement("span");
        marker.className = "focus-marker";
        marker.textContent = "Focus";
        item.appendChild(marker);
      }
      appendHeardState(item, heard);
      if (evidence?.excerpt) {
        const excerpt = document.createElement("span");
        excerpt.className = "evidence-excerpt";
        excerpt.textContent = evidence.excerpt;
        item.appendChild(excerpt);
      }
      list.appendChild(item);
    }
    wrapper.append(title, list);
    return wrapper;
  }));
  const signals = Object.values(coaching.signals);
  const persistedSignals = context?.buyingSignalIds || [];
  elements["buying-signals"].replaceChildren();
  if (!signals.length && !persistedSignals.length) {
    const empty = document.createElement("li");
    empty.className = "empty-evidence";
    empty.textContent = "No signals detected yet.";
    elements["buying-signals"].appendChild(empty);
  } else {
    const ids = new Set([...persistedSignals, ...signals.map(signal => signal.id)]);
    for (const id of ids) {
      const definition = signalDefinition(id);
      const item = document.createElement("li");
      item.className = "is-heard";
      item.textContent = definition?.label || id;
      appendHeardState(item, true);
      if (coaching.signals[id]?.excerpt) {
        const excerpt = document.createElement("span");
        excerpt.className = "evidence-excerpt";
        excerpt.textContent = coaching.signals[id].excerpt;
        item.appendChild(excerpt);
      }
      elements["buying-signals"].appendChild(item);
    }
  }
  renderHandoffs();
}
function renderMetrics() {
  elements["session-timer"].textContent = formatDuration(metrics.elapsedSeconds);
  elements["talk-share"].textContent = metrics.talkShare === null ? "No audio yet" : `${Math.round(metrics.talkShare * 100)}%`;
  elements["ratio-fill"].style.transform = `scaleX(${metrics.talkShare || 0})`;
  elements["end-session"].disabled = !["connecting", "in-progress"].includes(phase);
  elements["end-session"].textContent = phase === "ending" ? "Ending conversation..." : phase === "connecting" ? "Cancel connection" : "End conversation";
  const elapsed = metrics.elapsedSeconds;
  let cue = practiceMode === "free" ? "Free practice. End any time for a session summary without scoring." : "End any time. Guided sessions under 10 minutes return to setup without attempt evaluation.";
  if (elapsed >= 840) cue = "Final minute. Confirm the next step and stop adding topics.";
  else if (elapsed >= 720) cue = "12 minutes. Wrap-up warning. Move to the next step.";
  else if (elapsed >= 600) cue = practiceMode === "free" ? "10 minutes. Continue or end for your ungraded summary." : "10 minutes reached. This session can qualify for attempt evaluation when you end it.";
  else if (elapsed >= 480) cue = "8 minutes. Soft cue: check discovery coverage and listening.";
  if (phase === "connecting") cue = "Connecting. Cancel connection is available at the top of the conversation panel.";
  if (phase === "ending") cue = "Ending the SDK session and stopping audio.";
  if (context?.mode === "practice") cue = "Practice review has no live session clock.";
  elements["time-cue"].textContent = cue;
}
function renderEvaluation() {
  const free = context?.practiceMode === "free";
  const real = free ? hasTerminalSession(context) : hasQualifyingSession(context);
  const account = activeAccount(context);
  const buyer = activeBuyer(context);
  const scenario = activeScenario(context);
  const focus = activeFocus(context);
  const values = [
    ["Target account", account.company],
    ["Buyer", `${buyer.name}, ${buyer.role}`],
    ["Scenario", scenario.label],
    ["Track", tracks[activeTrackId(context)].label],
    ["Practice focus", focus ? `${focus.framework}, ${focus.label}` : "Balanced"],
    ["Real conversation ID", real ? context.conversationId : "No qualifying real session"],
    ["Elapsed time", formatDuration(context?.elapsedSeconds || 0)],
    ["Listening estimate", ratioText({ ...context, talkShare: context && context.talkSeconds + context.listenSeconds > 0 ? context.talkSeconds / (context.talkSeconds + context.listenSeconds) : null })],
    ["Scenario evidence", free ? "Not recorded in Free practice" : `${context?.evidenceIds?.length || 0} topics marked by local rules`],
    ["Possible signals", free ? "Not recorded in Free practice" : `${context?.buyingSignalIds?.length || 0} buyer-message patterns`]
  ];
  elements["evaluation-summary"].innerHTML = values.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
  elements["evaluation-title"].textContent = free ? "Free practice summary" : "Review the session evidence";
  elements["evaluation-copy"].textContent = free
    ? "The live session has ended. Free practice does not create evidence scores, a human-review gate, or a completion record."
    : "The SDK session ended after at least 10 minutes. Inspect local metrics and ElevenLabs native history. Opening history is required but does not verify evaluation contents or completion.";
  elements["open-evaluation"].hidden = free;
  elements["continue-review"].hidden = free;
  elements["evaluation-opened"].hidden = free;
  elements["free-return"].hidden = !free;
  if (free) return;
  const opened = Boolean(context?.evaluationOpened);
  elements["continue-review"].disabled = !opened || !real;
  elements["evaluation-opened"].textContent = opened
    ? "History opened. The portal cannot confirm native evaluation results or completion."
    : "Open history to unlock human review for this real attempt.";
}
function setStatus(label, state) {
  elements["session-status"].dataset.state = state;
  elements["session-status"].lastChild.textContent = label;
  elements["state-announcement"].textContent = `Session status: ${label}`;
}
function setPhase(nextPhase) {
  phase = nextPhase;
  if (context) {
    context.phase = nextPhase;
    persistContext();
  }
  const isPractice = context?.mode === "practice";
  const real = hasQualifyingSession(context);
  const active = {
    configured: "conversation",
    connecting: "conversation",
    "in-progress": "conversation",
    ending: "conversation",
    summary: "conversation",
    evaluation: "evaluation",
    review: "review"
  }[nextPhase] || "prepare";
  const complete = {
    prepare: nextPhase !== "setup" && !isPractice,
    conversation: nextPhase === "summary" || ((nextPhase === "evaluation" || nextPhase === "review") && real),
    evaluation: nextPhase === "review" && real && context.evaluationOpened
  };
  document.querySelectorAll("[data-loop]").forEach(step => {
    const name = step.dataset.loop;
    step.classList.toggle("is-active", name === active);
    step.classList.toggle("is-complete", Boolean(complete[name]));
    if (name === active) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });
  elements["setup-panel"].hidden = !["setup", "configured"].includes(nextPhase);
  elements["session-panel"].hidden = !["connecting", "in-progress", "ending"].includes(nextPhase);
  elements["evaluation-panel"].hidden = !["evaluation", "summary"].includes(nextPhase);
  elements["review-stage"].hidden = nextPhase !== "review";
  elements["coach-content"].hidden = nextPhase === "review";
  elements["fde-panel"].hidden = nextPhase !== "review";
  elements.workspace.classList.toggle("session-active", ["connecting", "in-progress", "ending"].includes(nextPhase));
  elements["start-session"].disabled = !agentId || nextPhase === "connecting";
  elements["send-text"].disabled = nextPhase !== "in-progress";
  elements["reconnect-session"].disabled = nextPhase === "ending";
  const locked = ["connecting", "in-progress", "ending", "evaluation", "review", "summary"].includes(nextPhase);
  [
    "account-source", "buyer-select", "scenario-select", "focus-select", "account-text", "buyer-text", "account-file", "buyer-file",
    "offer-input", "objective-input", "pack-file", "export-pack", "account-template", "buyer-template"
  ].forEach(id => { elements[id].disabled = locked; });
  document.querySelectorAll("[data-track], [data-mode]").forEach(button => { button.disabled = locked || Boolean(activeScenario().track && button.dataset.track); });
  if (nextPhase === "setup") setStatus("Setup", "setup");
  if (nextPhase === "configured") setStatus("Configured", "configured");
  if (nextPhase === "connecting") setStatus("Connecting", "configured");
  if (nextPhase === "in-progress") setStatus("Live", "live");
  if (nextPhase === "ending") setStatus("Ending", "configured");
  if (nextPhase === "summary") setStatus("Practice summary", "review");
  if (nextPhase === "evaluation") setStatus("Evaluation", "configured");
  if (nextPhase === "review") setStatus(isPractice ? "Practice review" : "Review", "review");
  if (nextPhase === "evaluation" || nextPhase === "summary") renderEvaluation();
  if (nextPhase === "review") renderReviewMode();
  renderMetrics();
}
function showRecovery(message) {
  if (context) {
    context.sessionState = "recovery";
    context.phase = "configured";
    persistContext();
  }
  setPhase(agentId ? "configured" : "setup");
  elements["setup-message"].textContent = message;
}
function showFreeSummary() {
  metrics = {
    elapsedSeconds: context.elapsedSeconds,
    talkSeconds: context.talkSeconds,
    listenSeconds: context.listenSeconds,
    conversationId: context.conversationId,
    talkShare: context.talkSeconds + context.listenSeconds > 0 ? context.talkSeconds / (context.talkSeconds + context.listenSeconds) : null
  };
  elements["stage-note"].textContent = `Free practice ${context.localAttemptId}. No evidence score or completion record.`;
  setPhase("summary");
}
function showEvaluation() {
  if (context?.practiceMode === "free") {
    showFreeSummary();
    return;
  }
  if (!hasQualifyingSession(context)) {
    showRecovery("Session ended and audio is off. It did not reach 10 minutes, so this attempt is not eligible for Guided review. Start a new conversation or use Free practice.");
    return;
  }
  metrics = {
    elapsedSeconds: context.elapsedSeconds,
    talkSeconds: context.talkSeconds,
    listenSeconds: context.listenSeconds,
    conversationId: context.conversationId,
    talkShare: context.talkSeconds + context.listenSeconds > 0 ? context.talkSeconds / (context.talkSeconds + context.listenSeconds) : null
  };
  elements["stage-note"].textContent = `Local attempt ${context.localAttemptId}. Transcript content is not persisted.`;
  setPhase("evaluation");
}
function renderReviewMode() {
  const practice = context?.mode === "practice";
  const scenario = activeScenario(context);
  const buyer = activeBuyer(context);
  elements["fde-title"].textContent = practice ? `Practice review, ${scenario.label}` : `Human review, ${scenario.label}`;
  elements["fde-outcome"].textContent = `${activeObjective(context)} Buyer: ${buyer.name}, ${buyer.role}.`;
  elements["review-stage-title"].textContent = practice ? "Practice the human review" : "Make the human decision";
  elements["review-stage-copy"].textContent = practice
    ? "Practice mode has no live session, real conversation ID, native evaluation, or completion claim."
    : "Compare local session evidence and native ElevenLabs results with the selected scenario rubric. Neither local rules nor native evaluation auto-pass the learner.";
  elements["return-evaluation"].textContent = practice ? "Return to setup" : "Return to evaluation";
  elements["stage-note"].textContent = practice ? `Practice ${context.localAttemptId}. No transcript or real session attached.` : `Attempt ${context.localAttemptId}. Human review only.`;
  renderSavedDecision();
}
function showReview() {
  if (!context) {
    startPractice();
    return;
  }
  if (context.mode === "attempt" && (!hasQualifyingSession(context) || !context.evaluationOpened)) {
    showEvaluation();
    return;
  }
  setPhase("review");
}
function startPractice() {
  savedReview = null;
  storageRemove(REVIEW_KEY);
  context = newContext("practice");
  metrics = { elapsedSeconds: 0, talkSeconds: 0, listenSeconds: 0, talkShare: null, conversationId: "" };
  coaching = { evidence: {}, signals: {}, handoffs: {} };
  renderReviewCriteria();
  populateReview(null);
  preparePrint();
  showReview();
}
function renderSavedDecision() {
  if (!savedReview) {
    elements["saved-decision"].hidden = true;
    elements["saved-decision"].replaceChildren();
    return;
  }
  const practice = savedReview.mode === "practice";
  elements["saved-decision"].hidden = false;
  const title = document.createElement("strong");
  title.textContent = `${practice ? "Saved practice decision" : "Saved decision"}: ${decisionLabels[savedReview.overall] || savedReview.overall}`;
  const detail = document.createElement("span");
  detail.textContent = `${formatDate(savedReview.reviewedAt)}. ${activeScenario(savedReview).label}. ${activeBuyer(savedReview).name}. ${practice ? "Not a completion record." : "Prototype record only."}`;
  elements["saved-decision"].replaceChildren(title, detail);
}
function renderReviewCriteria() {
  elements["review-criteria"].innerHTML = activeRubric().map(criterion => `
    <fieldset class="review-criterion" data-criterion="${escapeHtml(criterion.id)}" aria-describedby="review-error">
      <legend>${escapeHtml(criterion.label)}</legend>
      <p>${escapeHtml(criterion.description)}</p>
      <div class="rating-options">
        <label><input type="radio" name="${escapeHtml(criterion.id)}" value="pass"><span>Pass</span></label>
        <label><input type="radio" name="${escapeHtml(criterion.id)}" value="revise"><span>Revise</span></label>
        <label><input type="radio" name="${escapeHtml(criterion.id)}" value="needs_review"><span>Needs review</span></label>
      </div>
    </fieldset>
  `).join("");
}
function populateReview(review) {
  elements["review-form"].reset();
  clearReviewError();
  if (!review) return;
  for (const criterion of activeRubric(review)) {
    const input = elements["review-form"].querySelector(`input[name="${criterion.id}"][value="${review.scores?.[criterion.id]}"]`);
    if (input) input.checked = true;
  }
  elements["reviewer-notes"].value = review.notes || "";
  elements["overall-decision"].value = review.overall || "";
  elements["human-confirmation"].checked = true;
}
function clearReviewError() {
  elements["review-error"].hidden = true;
  elements["review-form"].querySelectorAll("[aria-invalid]").forEach(control => control.removeAttribute("aria-invalid"));
}
function markReviewChanged() {
  savedReview = null;
  elements["save-status"].textContent = "Unsaved changes";
  clearReviewError();
  preparePrint();
  renderSavedDecision();
}
function validateReview() {
  for (const criterion of activeRubric()) {
    if (!elements["review-form"].querySelector(`input[name="${criterion.id}"]:checked`)) {
      const fieldset = elements["review-form"].querySelector(`[data-criterion="${criterion.id}"]`);
      return { message: `Choose a rating for ${criterion.label}.`, invalid: fieldset, target: fieldset.querySelector("input") };
    }
  }
  if (!elements["overall-decision"].value) return { message: "Choose an overall human decision.", invalid: elements["overall-decision"], target: elements["overall-decision"] };
  if (!elements["human-confirmation"].checked) return { message: "Confirm that a human reviewed the evidence.", invalid: elements["human-confirmation"], target: elements["human-confirmation"] };
  return null;
}
function preparePrint() {
  if (!savedReview) {
    elements["print-sheet"].hidden = true;
    elements["print-record"].disabled = true;
    return;
  }
  const review = savedReview;
  const practice = review.mode === "practice";
  const real = Boolean(review.callStarted && review.conversationId);
  const completed = !practice && hasQualifyingSession(review) && review.evaluationOpened && review.overall === "pass";
  const title = practice ? "Practice review record" : completed ? "Prototype completion record" : "Prototype review record";
  const voiced = review.talkSeconds + review.listenSeconds;
  const share = voiced > 0 ? review.talkSeconds / voiced : null;
  const evidence = review.evidenceIds.map(id => evidenceDefinitions(review).find(item => item.id === id)?.label || id);
  const signals = review.buyingSignalIds.map(id => signalDefinition(id)?.label || id);
  const focus = activeFocus(review);
  const summary = [
    ["Target account", activeAccount(review).company],
    ["Buyer", `${activeBuyer(review).name}, ${activeBuyer(review).role}`],
    ["Product or service", activeOffer(review)],
    ["Scenario", activeScenario(review).label],
    ["Track", tracks[review.track].label],
    ["Practice focus", focus ? `${focus.framework}, ${focus.label}` : "Balanced"],
    ["Mode", practice ? "Practice, no real session" : "Guided attempt"],
    ["Local attempt ID", review.localAttemptId],
    ["Real conversation ID", real ? review.conversationId : "None"],
    ["Elapsed time", formatDuration(review.elapsedSeconds)],
    ["Listening estimate", ratioText({ talkShare: share })]
  ];
  const rows = activeRubric(review).map(criterion => `<tr><th>${escapeHtml(criterion.label)}</th><td>${escapeHtml(decisionLabels[review.scores?.[criterion.id]] || "Not rated")}</td></tr>`).join("");
  elements["print-title"].textContent = `${activeAccount(review).company} practice record`;
  elements["print-content"].innerHTML = `
    <h2>${escapeHtml(title)}</h2>
    <p>Reviewed ${escapeHtml(formatDate(review.reviewedAt))}</p>
    <dl>${summary.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
    <div class="record-decision">${practice ? "Practice decision" : "Overall decision"}: ${escapeHtml(decisionLabels[review.overall] || review.overall)}</div>
    <table><tbody>${rows}</tbody></table>
    <h2>Scenario evidence</h2><p>${escapeHtml(evidence.join(", ") || "No local rule matches recorded.")}</p>
    <h2>Possible buying signals</h2><p>${escapeHtml(signals.join(", ") || "No possible signals recorded. This does not indicate purchase intent.")}</p>
    <h2>Reviewer notes</h2><p>${escapeHtml(review.notes || "No notes supplied.").replace(/\n/g, "<br>")}</p>
  `;
  elements["print-footer"].textContent = practice
    ? "Independent role-play rehearsal. No live session or native evaluation is attached. This is not a completion record, official ElevenLabs certification, accredited credential, or production deployment."
    : "Independent role-play rehearsal. Native ElevenLabs evaluation is separate evidence, not an automatic pass. This prototype record is not an official ElevenLabs certification, accredited credential, or production deployment. No transcript content is included.";
  elements["print-sheet"].hidden = false;
  elements["print-record"].disabled = false;
}

const controller = createConversationController({
  onStatus(status, message) {
    elements["setup-message"].textContent = message;
    if (status === "connected" && context?.callStarted) setPhase("in-progress");
  },
  onMode(mode) {
    elements["voice-mode"].textContent = mode === "speaking" ? `${activeBuyer().shortName} speaking` : "Listening";
  },
  onConversationId(id) {
    if (!context || context.mode !== "attempt") return;
    context.callStarted = true;
    context.conversationId = id;
    context.sessionState = "active";
    metrics.conversationId = id;
    elements["conversation-id"].textContent = `ID ${id}`;
    elements["conversation-id"].title = id;
    elements["stage-note"].textContent = "Live session. Transcript stays in memory only.";
    persistContext();
  },
  onThread(messages) {
    thread = messages;
    syncTranscript(messages);
    const finalMessages = messages.filter(message => !message.tentative);
    const latestBuyer = [...finalMessages].reverse().find(message => message.role === "agent");
    const nextBuyerText = latestBuyer?.text || "";
    if (nextBuyerText !== latestBuyerText) {
      latestBuyerText = nextBuyerText;
      renderResponseScript();
      elements["compass-copy"].textContent = compassMessage({ scenario: activeScenario(), trackId: selectedTrack, focus: activeFocus(), buyer: activeBuyer() }, latestBuyerText);
    }
    if (context?.practiceMode !== "free") {
      coaching = inspectTranscript({ evidenceGroups: activeEvidenceGroups(), agentName: activeBuyer().name }, finalMessages, coaching);
      if (context && context.mode === "attempt") {
        context.evidenceIds = Object.keys(coaching.evidence);
        context.buyingSignalIds = Object.keys(coaching.signals);
        context.handoffCueIds = Object.keys(coaching.handoffs);
        persistContext();
      }
    }
    renderEvidence();
  },
  onTick(nextMetrics) {
    metrics = nextMetrics;
    if (context && context.mode === "attempt") {
      context.elapsedSeconds = nextMetrics.elapsedSeconds;
      context.talkSeconds = nextMetrics.talkSeconds;
      context.listenSeconds = nextMetrics.listenSeconds;
      if (nextMetrics.elapsedSeconds !== lastPersistSecond && nextMetrics.elapsedSeconds % 5 === 0) {
        lastPersistSecond = nextMetrics.elapsedSeconds;
        persistContext();
      }
    }
    renderMetrics();
  },
  onSessionEnd(finalMetrics, details) {
    metrics = finalMetrics;
    if (context?.mode === "attempt") {
      context.elapsedSeconds = finalMetrics.elapsedSeconds;
      context.talkSeconds = finalMetrics.talkSeconds;
      context.listenSeconds = finalMetrics.listenSeconds;
      context.sessionState = details?.terminal && (context.practiceMode === "free" || finalMetrics.elapsedSeconds >= 600) ? "terminal" : "recovery";
      persistContext();
      if (details?.reason === "time-limit") elements["session-error"].textContent = "The 15-minute session limit was reached, so the session ended automatically.";
      showEvaluation();
    } else {
      setPhase(agentId ? "configured" : "setup");
    }
  },
  onError(message) {
    elements["session-error"].hidden = false;
    elements["session-error"].textContent = `${message}. Check microphone permission, network, public-agent settings, and the domain allowlist. Reconnect starts a new conversation ID.`;
    setStatus("Connection error", "error");
  }
}, () => window.__PARTNER_LAB_NOW__ || Date.now());

function scenarioContext() {
  const account = activeAccount();
  const buyer = activeBuyer();
  const scenario = activeScenario();
  const focus = activeFocus();
  return {
    scenarioLabel: scenario.label,
    company: account.company,
    industry: account.industry,
    agentName: buyer.name,
    buyerRole: buyer.role,
    buyerPrompt: buyer.agentPrompt,
    trackLabel: tracks[selectedTrack].label,
    offer: activeOffer(),
    objective: activeObjective(),
    focusGuidance: focus ? `${focus.framework}, ${focus.label}: ${focus.guidance}` : "Balanced conversation",
    agentFocus: scenario.agentFocus,
    practiceMode,
    accountText: account.rawText,
    buyerText: buyer.rawText || [`Name: ${buyer.name}`, `Role: ${buyer.role}`, "Priorities:", ...buyer.priorities, "Concerns:", ...buyer.concerns].join("\n")
  };
}
async function startSession() {
  if (!agentId) {
    elements["agent-error"].hidden = false;
    elements["agent-error"].textContent = "Configure a public agent ID for the selected buyer before starting.";
    elements["agent-id"].focus();
    return;
  }
  const customError = validateCustomSetup();
  if (customError) {
    elements["agent-error"].hidden = false;
    elements["agent-error"].textContent = customError.message;
    customError.target.focus();
    return;
  }
  savedReview = null;
  storageRemove(REVIEW_KEY);
  context = newContext("attempt");
  coaching = { evidence: {}, signals: {}, handoffs: {} };
  thread = [];
  latestBuyerText = "";
  metrics = { elapsedSeconds: 0, talkSeconds: 0, listenSeconds: 0, talkShare: null, conversationId: "" };
  elements["session-error"].hidden = true;
  elements["conversation-id"].textContent = "Conversation ID pending";
  renderTranscript();
  renderEvidence();
  renderResponseScript();
  setPhase("connecting");
  try {
    const conversationId = await controller.start({ agentId, scenarioContext: scenarioContext() });
    if (conversationId) setPhase("in-progress");
  } catch (error) {
    context = newContext("attempt");
    elements["setup-message"].textContent = `${error.message}. Check microphone permission, network, public-agent settings, and the domain allowlist, then try again.`;
    setPhase("configured");
  }
}
async function endActiveForControl(reason = "abandon") {
  if (controller.isActive()) await controller.endSession(true, reason);
}
function hasWork() {
  return Boolean(Object.values(agentIds).some(Boolean) || context || savedReview || customAccountText || customBuyerText || offer || objective || elements.composer.value || elements["reviewer-notes"].value);
}
function clearAttempt({ preserveSetup = true } = {}) {
  context = null;
  savedReview = null;
  storageRemove(REVIEW_KEY);
  storageRemove(CONTEXT_KEY);
  thread = [];
  latestBuyerText = "";
  coaching = { evidence: {}, signals: {}, handoffs: {} };
  metrics = { elapsedSeconds: 0, talkSeconds: 0, listenSeconds: 0, talkShare: null, conversationId: "" };
  populateReview(null);
  preparePrint();
  renderTranscript();
  renderEvidence();
  renderResponseScript();
  if (!preserveSetup) elements.composer.value = "";
}
function setupChanged({ syncAgent = false } = {}) {
  if (["connecting", "in-progress", "ending", "evaluation", "review", "summary"].includes(phase)) return;
  clearAttempt();
  if (syncAgent) renderAgentForSelection();
  saveSetup();
  renderScenarioControls();
  renderTrack();
  setPhase(agentId ? "configured" : "setup");
}

const preparationTabs = [...document.querySelectorAll("[data-tab]")];
function activatePreparationTab(button, moveFocus = false) {
  preparationTabs.forEach(tab => {
    const selected = tab === button;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document.querySelectorAll(".rail-panel").forEach(panel => { panel.hidden = panel.id !== `panel-${button.dataset.tab}`; });
  if (moveFocus) button.focus();
}
preparationTabs.forEach(button => button.addEventListener("click", () => activatePreparationTab(button)));
document.querySelector(".rail-tabs").addEventListener("keydown", event => {
  const current = event.target.closest("[data-tab]");
  if (!current) return;
  const currentIndex = preparationTabs.indexOf(current);
  let nextIndex = null;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % preparationTabs.length;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + preparationTabs.length) % preparationTabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = preparationTabs.length - 1;
  if (nextIndex === null) return;
  event.preventDefault();
  activatePreparationTab(preparationTabs[nextIndex], true);
});

elements["account-source"].addEventListener("change", () => {
  accountSource = elements["account-source"].value;
  setupChanged({ syncAgent: true });
});
elements["buyer-select"].addEventListener("change", () => {
  selectedBuyerId = elements["buyer-select"].value;
  setupChanged({ syncAgent: true });
});
elements["scenario-select"].addEventListener("change", () => {
  selectedScenarioId = elements["scenario-select"].value;
  const requiredTrack = activeScenario().track;
  if (requiredTrack) selectedTrack = requiredTrack;
  if (!getFocus(selectedFocusId, selectedTrack)) selectedFocusId = "";
  setupChanged();
});
elements["focus-select"].addEventListener("change", () => {
  selectedFocusId = elements["focus-select"].value;
  setupChanged();
});
document.querySelectorAll("[data-track]").forEach(button => {
  button.addEventListener("click", () => {
    if (activeScenario().track) return;
    selectedTrack = button.dataset.track;
    if (!getFocus(selectedFocusId, selectedTrack)) selectedFocusId = "";
    setupChanged();
  });
});
document.querySelectorAll("[data-mode]").forEach(button => {
  button.addEventListener("click", () => {
    practiceMode = button.dataset.mode;
    setupChanged();
  });
});
const customInputs = [
  ["account-text", value => { customAccountText = value; }],
  ["buyer-text", value => { customBuyerText = value; }],
  ["offer-input", value => { offer = value; }],
  ["objective-input", value => { objective = value; }]
];
customInputs.forEach(([id, assign]) => {
  elements[id].addEventListener("input", () => {
    assign(elements[id].value);
    setupChanged();
  });
});

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
const accountTemplate = `# Target company\n\nCompany: Example Industries\nIndustry: Manufacturing\n\n## Business context\n\nDescribe the organization, customers, and current operating environment.\n\n## Priorities\n\n- Add a business priority.\n\n## Current environment\n\nDescribe known workflows and systems without assuming vendors.\n\n## Stakeholders\n\n- Add likely operational, technical, security, and commercial owners.\n\n## Constraints and unknowns\n\n- Separate known constraints from details the learner must discover.\n`;
const buyerTemplate = `# Buyer persona\n\nName: Jordan Lee\nRole: Chief Operating Officer\n\n## Responsibilities\n\nDescribe what this buyer owns.\n\n## Priorities\n\n- Add a desired outcome.\n\n## Concerns and objections\n\n- Add a credible concern.\n\n## Decision influence\n\nDescribe authority, influence, and other decision owners without inventing budget approval.\n`;
elements["account-template"].addEventListener("click", () => downloadText("target-company-template.md", accountTemplate));
elements["buyer-template"].addEventListener("click", () => downloadText("buyer-persona-template.md", buyerTemplate));
async function documentFile(file) {
  if (!file) return null;
  if (!/\.(md|txt)$/i.test(file.name)) throw new Error("Use only a .md or .txt file. Other formats are not accepted.");
  if (file.size > MAX_DOCUMENT_LENGTH) throw new Error(`Keep text files at or below ${MAX_DOCUMENT_LENGTH.toLocaleString()} bytes.`);
  const text = await file.text();
  if (text.length > MAX_DOCUMENT_LENGTH) throw new Error(`Keep text files at or below ${MAX_DOCUMENT_LENGTH.toLocaleString()} characters.`);
  if (!cleanText(text)) throw new Error("The selected file is empty.");
  return text;
}
[["account-file", "account-text"], ["buyer-file", "buyer-text"]].forEach(([fileId, textId]) => {
  elements[fileId].addEventListener("change", async () => {
    try {
      const text = await documentFile(elements[fileId].files[0]);
      if (text !== null) {
        elements[textId].value = text;
        elements[textId].dispatchEvent(new Event("input", { bubbles: true }));
        elements["pack-status"].textContent = `${elements[fileId].files[0].name} loaded as plain text. Review it before starting.`;
      }
    } catch (error) {
      elements["pack-status"].textContent = error.message;
    } finally {
      elements[fileId].value = "";
    }
  });
});
elements["pack-file"].addEventListener("change", async () => {
  const file = elements["pack-file"].files[0];
  try {
    if (!file) return;
    if (!/\.md$/i.test(file.name)) throw new Error("Scenario packs must be plain .md files.");
    if (file.size > MAX_DOCUMENT_LENGTH * 2) throw new Error("The scenario pack is too large.");
    const parsed = parseScenarioPack(await file.text());
    applySnapshot({ ...parsed, accountSource: "custom", buyerId: "custom" });
    setupChanged({ syncAgent: true });
    elements["pack-status"].textContent = `${file.name} imported as inert plain text. Review the account, buyer, offer, and objective.`;
  } catch (error) {
    elements["pack-status"].textContent = error.message;
  } finally {
    elements["pack-file"].value = "";
  }
});
elements["export-pack"].addEventListener("click", () => {
  const customError = validateCustomSetup();
  if (customError) {
    elements["pack-status"].textContent = customError.message;
    customError.target.focus();
    return;
  }
  const account = activeAccount();
  const buyer = activeBuyer();
  try {
    const pack = serializeScenarioPack({
      ...snapshot(),
      accountText: account.rawText,
      buyerText: buyer.rawText || [`Name: ${buyer.name}`, `Role: ${buyer.role}`, "Priorities:", ...buyer.priorities, "Concerns:", ...buyer.concerns].join("\n"),
      offer: activeOffer(),
      objective: activeObjective()
    });
    downloadText(`${account.company.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "custom"}-scenario.md`, pack);
    elements["pack-status"].textContent = "Plain Markdown scenario pack exported. No code, HTML, links, or remote resources were added.";
  } catch (error) {
    elements["pack-status"].textContent = error.message;
  }
});

elements["agent-form"].addEventListener("submit", event => {
  event.preventDefault();
  const value = elements["agent-id"].value.trim();
  const looksLikeKey = /^sk_/i.test(value) || /^[a-f0-9]{32,}$/i.test(value);
  if (looksLikeKey || !/^[A-Za-z0-9_-]{6,128}$/.test(value)) {
    elements["agent-error"].hidden = false;
    elements["agent-error"].textContent = "Enter a valid public agent ID, not an API key. Use letters, numbers, underscores, or hyphens.";
    elements["agent-id"].setAttribute("aria-invalid", "true");
    elements["agent-id"].focus();
    return;
  }
  agentId = value;
  agentIds[activeAgentKey()] = value;
  storageSet(AGENTS_KEY, JSON.stringify(agentIds));
  elements["agent-id"].removeAttribute("aria-invalid");
  elements["agent-error"].hidden = true;
  context = newContext("attempt");
  savedReview = null;
  storageRemove(REVIEW_KEY);
  populateReview(null);
  preparePrint();
  saveSetup();
  setPhase("configured");
  elements["setup-message"].textContent = "Configured locally for this buyer. Live readiness is verified only when you start the SDK session.";
});
elements["agent-id"].addEventListener("input", () => {
  elements["agent-error"].hidden = true;
  elements["agent-id"].removeAttribute("aria-invalid");
  const configured = agentIds[activeAgentKey()] || "";
  agentId = elements["agent-id"].value.trim() === configured ? configured : "";
  elements["start-session"].disabled = !agentId;
});
elements["start-session"].addEventListener("click", startSession);
elements["coach-ready"].addEventListener("click", () => {
  elements["response-coach"].scrollIntoView({ behavior: "smooth", block: "center" });
  elements["use-script"].focus({ preventScroll: true });
});
elements["use-script"].addEventListener("click", () => {
  elements.composer.value = elements["verbatim-script"].firstElementChild.textContent;
  elements["response-context"].textContent = "Your script is ready to edit. Speak it naturally or send it as text when you are ready.";
  elements.composer.focus();
  controller.sendActivity();
});
elements["end-session"].addEventListener("click", async () => {
  if (!["connecting", "in-progress"].includes(phase)) return;
  setPhase("ending");
  elements["voice-mode"].textContent = "Session ending";
  try { await controller.endSession(false); }
  catch (error) {
    if (controller.isActive()) setPhase("in-progress");
    elements["session-error"].hidden = false;
    elements["session-error"].textContent = `${error.message}. If audio continues, use Reset to close the session, then reload the browser tab.`;
  }
});
elements["reconnect-session"].addEventListener("click", async () => {
  if (!window.confirm("Reconnect ends this SDK session and starts a new conversation ID. Local transcript and audio metrics reset. Continue?")) return;
  await endActiveForControl("recovery");
  context = null;
  setPhase("configured");
  await startSession();
});
elements.composer.addEventListener("input", () => controller.sendActivity());
elements.composer.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && phase === "in-progress") {
    event.preventDefault();
    elements["send-text"].click();
  }
});
elements["send-text"].addEventListener("click", () => {
  try {
    if (controller.sendText(elements.composer.value)) {
      elements.composer.value = "";
      elements["session-error"].hidden = true;
    }
  } catch (error) {
    elements["session-error"].hidden = false;
    elements["session-error"].textContent = error.message;
  }
});
elements["open-evaluation"].addEventListener("click", () => {
  if (!hasQualifyingSession(context)) return;
  context.evaluationOpened = true;
  persistContext();
  renderEvaluation();
});
elements["continue-review"].addEventListener("click", () => {
  if (hasQualifyingSession(context) && context.evaluationOpened) showReview();
});
elements["free-return"].addEventListener("click", () => {
  clearAttempt();
  setPhase(agentId ? "configured" : "setup");
});
elements["practice-review"].addEventListener("click", async () => {
  if (practiceMode === "free") return;
  if (["connecting", "in-progress"].includes(phase) || controller.isActive()) {
    if (!window.confirm("End the live session and enter practice review? Audio and the timer will stop. Cancel keeps the current attempt.")) return;
    await endActiveForControl("practice");
    startPractice();
    return;
  }
  if (context?.mode === "attempt" && hasQualifyingSession(context)) {
    if (context.evaluationOpened) showReview();
    else showEvaluation();
  } else {
    startPractice();
  }
});
elements["return-evaluation"].addEventListener("click", () => {
  if (context?.mode === "practice") {
    context = null;
    setPhase(agentId ? "configured" : "setup");
  } else showEvaluation();
});
elements["review-form"].addEventListener("change", markReviewChanged);
elements["reviewer-notes"].addEventListener("input", markReviewChanged);
elements["review-form"].addEventListener("submit", event => {
  event.preventDefault();
  clearReviewError();
  const error = validateReview();
  if (error) {
    elements["review-error"].textContent = error.message;
    elements["review-error"].hidden = false;
    error.invalid.setAttribute("aria-invalid", "true");
    error.target.focus();
    return;
  }
  if (!context || (context.mode === "attempt" && (!hasQualifyingSession(context) || !context.evaluationOpened))) {
    elements["review-error"].textContent = "A terminal Guided session of at least 10 minutes and opened ElevenLabs history are required for attempt review.";
    elements["review-error"].hidden = false;
    return;
  }
  const scores = {};
  for (const criterion of activeRubric()) scores[criterion.id] = elements["review-form"].querySelector(`input[name="${criterion.id}"]:checked`).value;
  savedReview = {
    ...context,
    phase: "review",
    scores,
    notes: elements["reviewer-notes"].value.trim(),
    overall: elements["overall-decision"].value,
    confirmed: true,
    reviewedAt: new Date().toISOString()
  };
  context.phase = "review";
  storageSet(REVIEW_KEY, JSON.stringify(savedReview));
  persistContext();
  elements["save-status"].textContent = "Review saved locally. Transcript content was not stored.";
  preparePrint();
  renderSavedDecision();
});
elements["print-record"].addEventListener("click", () => {
  if (!savedReview) return;
  preparePrint();
  window.print();
});
elements["restart-lab"].addEventListener("click", async () => {
  if (hasWork() && !window.confirm("Restart clears the local session and review but keeps your setup and agent IDs. Continue?")) return;
  await endActiveForControl();
  clearAttempt({ preserveSetup: false });
  renderScenarioControls();
  renderTrack();
  setPhase(agentId ? "configured" : "setup");
});
elements["reset-lab"].addEventListener("click", async () => {
  if (hasWork() && !window.confirm(`Reset practice data from this browser?\n\nThis clears:\n- Custom account and buyer text\n- Setup selections\n- Local sessions, metrics, and reviews\n\nYour configured agent IDs for Maya, Daniel, Priya, and custom buyers will be preserved.\n\nContinue?`)) return;
  await endActiveForControl();
  for (const key of [CONTEXT_KEY, REVIEW_KEY, TRACK_KEY, SETUP_KEY, "partnerCertificationLab.attemptContext", "partnerCertificationLab.review"]) storageRemove(key);
  storageSet(AGENTS_KEY, JSON.stringify(agentIds));
  applySnapshot({ scenarioId: "full", track: "seller", buyerId: "maya", accountSource: "northstar", practiceMode: "guided" });
  clearAttempt({ preserveSetup: false });
  elements["agent-form"].reset();
  renderAgentForSelection();
  renderScenarioControls();
  renderTrack();
  setPhase(agentId ? "configured" : "setup");
});

applySnapshot(loadJson(SETUP_KEY) || {});
const storedAgents = loadJson(AGENTS_KEY);
if (storedAgents && typeof storedAgents === "object") {
  for (const key of Object.keys(agentIds)) {
    const value = typeof storedAgents[key] === "string" ? storedAgents[key] : "";
    if (/^[A-Za-z0-9_-]{6,128}$/.test(value) && !/^sk_/i.test(value)) agentIds[key] = value;
  }
}
const legacyAgent = storageGet(AGENT_KEY) || "";
if (!agentIds.maya && /^[A-Za-z0-9_-]{6,128}$/.test(legacyAgent) && !/^sk_/i.test(legacyAgent)) agentIds.maya = legacyAgent;
const storedReview = migrateContext(loadJson(REVIEW_KEY));
if (storedReview) {
  savedReview = storedReview;
  applySnapshot(storedReview);
  context = { ...storedReview };
} else {
  const storedContext = migrateContext(loadJson(CONTEXT_KEY));
  if (validContext(storedContext)) {
    context = storedContext;
    applySnapshot(storedContext);
  }
}
if (context && !context.sessionState) context.sessionState = "legacy_unverified";
renderAgentForSelection();
renderScenarioControls();
renderTrack();
renderTranscript();
if (savedReview) {
  populateReview(savedReview);
  preparePrint();
  showReview();
} else if (context?.mode === "practice" && context.phase === "review") {
  showReview();
} else if (context?.practiceMode === "free" && hasTerminalSession(context)) {
  showFreeSummary();
} else if (hasQualifyingSession(context)) {
  showEvaluation();
} else if (context?.callStarted) {
  showRecovery("Reload ended local SDK control. This attempt needs a new terminal session before Guided review or a Free practice summary.");
} else {
  if (context) metrics = { ...metrics, elapsedSeconds: context.elapsedSeconds || 0 };
  setPhase(agentId ? "configured" : "setup");
}
