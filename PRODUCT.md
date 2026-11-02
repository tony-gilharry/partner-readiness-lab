# Partner Readiness Lab product requirements

## Product boundary

A local-first professional role-play lab for partner sellers and partner solutions consultants. Northstar Telecom remains the default fictional account, with three executive buyers. Users can also supply a fictional or non-confidential target company, industry, buyer persona, and product/service offer. This is an independent hiring-proof and open-source learning project, not an official ElevenLabs product, production deployment, or accredited credential.

The product emphasizes realistic professional practice and community-shareable scenarios, not a large library of consumer role plays. MEDDPICC and Command of the Message are optional practice focuses, not linear stages.

## Users and readiness outcomes

### Partner seller

The seller practices discovery, qualification, customer and partner value, objection handling, commercial progression, and escalation recovery. Services and revenue remain hypotheses to validate. The app must never promise higher billable rates, partner revenue, customer ROI, or a purchasing decision.

### Partner solutions consultant

The solutions consultant practices technical discovery, validation discipline, reliability, security review, and specialist handoffs. The readiness outcome is enough accurate context to justify solution design or validation without overcommitting.

### Built-in buyers

- Maya Chen, VP of Customer Experience: customer outcomes, human handoffs, service quality, adoption, and operational control.
- Daniel Okafor, CTO: architecture, integration, reliability, operating ownership, technical validation, and implementation risk.
- Priya Raman, CISO: data access, privacy, retention, compliance review, failure handling, security ownership, and proof discipline.

Each built-in buyer requires a dedicated public ElevenLabs agent and distinct configured voice. Changing buyer text alone is not a voice change. A separate generic public agent supports custom buyers with a constant configured voice.

## Core experience

1. Select Northstar or a custom target account, then select a buyer, practice structure, optional focus, and Guided review or Free practice.
2. For custom practice, provide target-company context, buyer context, the product/service being sold, and a practice objective. Paste text or upload plain `.md` / `.txt` files.
3. Configure the matching public agent ID and start the official SDK session. Keep Cancel connection and End conversation at the top of the live panel. Stop the temporary permission stream immediately after the microphone check and allow cancellation while connecting.
4. Read one live buyer and learner transcript with voice state, timer, connection state, and real conversation ID.
5. After the buyer's turn, show one prominent first-person script. Local deterministic rules select a scenario-, role-, buyer-, and offer-specific response. Optional editing fills the composer only. Nothing auto-sends or auto-speaks.
6. Keep scenario compass, specialist handoffs, evidence, and possible buying signals beside Guided conversations. Highlight the optional practice focus without reducing the conversation to a checklist.
7. Target 12 minutes with soft cues at 8 and 10, wrap-up at 12, and automatic end at 15. Allow manual end at any time.
8. Estimate learner talk share from SDK input/output volume samples. Exclude silence and show the estimation limitation.
9. Guided review requires a terminal SDK session of at least 10 minutes, a real conversation ID, and opened history before attempt review. Early disconnects and active-session reloads enter recovery, not evaluation.
10. Free practice ends at an ungraded summary with no evidence score, native-history gate, human review, or completion claim.
11. Record scenario- and buyer-specific human ratings, notes, overall decision, and confirmation. Print target account, buyer, offer, scenario, focus, mode, real ID, duration, listening estimate, evidence, and possible signals.

## Professional practice structures

- Full discovery: balanced discovery through a concrete next step, supporting both partner tracks.
- Qualification and value: seller qualification, value evidence, stakeholders, decision dynamics, and bounded progression.
- Technical validation and handoff: solutions-consultant systems, constraints, failure paths, controls, and validation.
- Objection handling and proof: seller clarification, evidence boundaries, honest responses, and validation of unresolved concerns.
- Customer escalation and recovery: seller listening, acknowledgment, fact finding, ownership, communication, and recovery actions.

Each structure applies to Northstar or a custom account. Custom account and buyer facts replace Northstar facts rather than being combined with them.

## Coaching and evidence rules

All coaching is deterministic local JavaScript. Keyword categories select pre-authored verbatim scripts. Transcript patterns mark evidence topics and possible buyer signals and retain short excerpts in memory. No sentiment, emotion, open-ended AI coach, custom LLM, or backend AI service is permitted.

Seller evidence covers MEDDPICC and Command of the Message. Technical evidence covers workflow, systems and data, integration constraints, failure paths, testing and monitoring, reliability, deployment constraints, and validation. Buyer-specific evidence reflects the selected executive or uploaded buyer. Scenario evidence covers objection handling or recovery where selected. Possible signals never declare purchase intent.

## Text-only scenario packs and OPSEC

- Portable packs are versioned plain Markdown containing target company, buyer, product/service, objective, structure, track, focus, and mode.
- Account and buyer inputs accept pasted text or `.md` / `.txt` files up to 16,000 bytes. Pack imports accept `.md` up to 32,000 bytes.
- Reject HTML, JSON, PDF, DOCX, archives, executables, and macro-capable formats.
- Treat imported text as untrusted data. Never render it as HTML, fetch links, execute code, evaluate expressions, or allow it to override fixed agent safety rules.
- Provide downloadable target-account and buyer templates, clear validation, and Markdown import/export round-trips.
- Community contributions should require a valid Markdown pack, not application-code changes.

## Data and persistence

Persist public agent IDs, setup selections, custom account/buyer text, offer, objective, local attempt context, metrics, real conversation ID, evidence and signal IDs, and saved human review in local storage. Reset clears practice and custom scenario data but preserves all configured public agent IDs. Migrate version-3 Northstar state to the new defaults. Never persist full transcript content or evidence excerpts. Do not persist audio.

There is no application server upload. Bounded custom scenario context is sent to ElevenLabs during a live session. The UI must disclose this and require fictional or non-confidential information.

## Toolchain and architecture

Vite with vanilla JavaScript and the official `@elevenlabs/client` package. No React and no application backend. Normal commands are `npm install`, `npm run dev`, `npm run build`, and `npm run preview`. Development defaults to port 8765. The legacy static Northstar-only app and Python server remain available.

`npm run app` builds a self-contained macOS 12+ app with an AppKit/WKWebView shell, packaged production files, and a Python standard-library server bound to `127.0.0.1:8766`. The app supports microphone permission, persistent local settings, external links, and printing. Node and Docker are not required at runtime. The app stops only its owned server process.

Data modules separate accounts, personas, scenarios, Markdown packs, tracks, resources, and local coaching from SDK session control.

## Content and source requirements

Northstar remains fictional. Built-in buyer prompts preserve explicit unknowns and claim safety. Custom sessions must not inherit Northstar facts. Official product learning claims link to primary ElevenLabs sources. Named customer results belong only to those customers. Recheck changing capabilities before recording.

## Acceptance evidence

Normal install and production build pass. The built app is exercised with a mocked SDK for all built-in buyers, custom industries, every practice structure, both tracks, framework focuses, Guided and Free modes, text-only upload rejection and success, inert markup, Markdown pack round-trips, custom context, timing gates, review, print, persistence, migration, and reset. No transcript or evidence excerpt may enter local storage.

Desktop and mobile screenshots receive one bounded review and one fix batch. The native macOS app retains its existing build and safety checks.

Live WebRTC, three distinct built-in voices, custom-buyer behavior, native evaluation, and real conversation history require separate verification in Tony's account. Builds, mocks, and saved local reviews never satisfy that gate.
