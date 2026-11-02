# Public agent setup for multi-scenario practice

Create dedicated public demo agents in your own ElevenLabs account. The app uses the official `@elevenlabs/client` JavaScript SDK with public agent IDs. It never needs an API key in browser code or browser storage. Verify live behavior in your own account before recording or sharing a demonstration.

Official SDK reference: https://elevenlabs.io/docs/eleven-agents/libraries/java-script

## 1. Create three built-in buyers and one generic custom agent

Open https://elevenlabs.io/app/agents and create:

1. **Maya Chen**, VP of Customer Experience.
2. **Daniel Okafor**, Chief Technology Officer.
3. **Priya Raman**, Chief Information Security Officer.
4. **Generic custom buyer** for uploaded target accounts and personas.

Open `agent/system-prompt.md`. For each agent, copy Shared rules and only the relevant buyer section into System prompt. Set the suggested first message. Maya, Daniel, and Priya share Northstar facts but have different priorities and concerns.

Choose a clear English voice for each agent. Maya, Daniel, and Priya should have distinct voices. A contextual update changes scenario context, not the portal's configured voice. The generic custom agent has one constant voice unless you configure another public agent.

The app stores public agent IDs by buyer. Select a buyer in setup and configure its matching ID. For custom accounts, configure the generic agent in the Custom company or industry view.

## 2. Configure public SDK access and events

For every public demo agent:

1. Keep authentication disabled only for the fictional or non-confidential demo use case.
2. In Security, allow local development and preview origins, including `http://127.0.0.1:8765` and `http://localhost:8765`. For the macOS desktop app, also allow `http://127.0.0.1:8766`. Add any other verification port used for that session.
3. In Advanced events, enable connection status, mode changes, messages, and errors. Not all client events are enabled by default.
4. Use voice with WebRTC. The app explains microphone access before calling `getUserMedia` and `Conversation.startSession`.
5. Copy the public agent ID, never an API key.

Public does not mean free or access-controlled. Anyone who obtains an agent ID may be able to start sessions and consume account usage, depending on settings. Never use a production agent. Restrict allowed origins, set account usage limits where available, monitor usage, and disable or delete demo agents when finished.

The app calls `Conversation.startSession({ agentId, connectionType: "webrtc" })`, stores the real ID from `getId()`, sends a bounded scenario contextual update, supports `sendUserMessage` and `sendUserActivity`, and samples input/output volume locally.

## 3. Understand the scenario and custom-data contract

The contextual update includes:

- Target company and industry.
- Buyer name, role, and behavior.
- Learner track, product/service, and practice objective.
- Practice structure, optional focus, and Guided or Free mode.
- Bounded target-account and buyer reference text between explicit data markers.

Imported text is reference data, not instructions. Keep the fixed prompt's claim safety, confidentiality, and role boundaries. Do not add Northstar facts to custom sessions. Missing facts remain discovery unknowns.

Account and buyer files stay in browser local storage until Reset. They are not sent to an application backend, but their bounded content is sent to ElevenLabs during a live session. Use fictional or non-confidential information only.

## 4. Optional native evaluation and knowledge base

`agent/evaluation-criteria.json` contains the original common, seller, and solutions-consultant native criteria. These remain optional business-track evidence. The app does not automatically switch native criteria by executive, custom account, scenario, or focus. Guided scenario rubrics and human review are local and separate from native ElevenLabs evaluation.

The portal does not fetch native results, and opening history does not prove analysis finished. Free practice has no native-history gate or review record.

`resources/manifest.json` lists official ElevenLabs URLs and review dates. Add selected sources to an agent knowledge base only if they improve the exercise. Keep the source boundary: official product claims, benchmarks, and customer stories are not proof for the selected account.

## 5. Verify before recording

1. Run `npm install`, then `npm run dev` and open the configured local origin.
2. Configure Maya and start a real seller session. Check microphone access, transcript, verbatim script, editing, real conversation ID, and text sending.
3. Repeat with Daniel and Priya. Confirm each uses the correct agent ID, distinct configured voice, executive concerns, coaching, and review criteria.
4. Select each professional structure and representative MEDDPICC, Command of the Message, and technical focuses. Confirm natural behavior rather than framework recitation.
5. Import a fictional custom account and buyer. Confirm no Northstar facts appear, the generic agent follows the supplied context, and unsupported claims are challenged.
6. Test a technical-handoff moment and an intentionally unsupported ROI, customer-proof, security, or implementation claim.
7. Complete a Guided session of at least 10 minutes, inspect native history, and record a human review. Separately confirm Free practice produces only an ungraded summary.

Do not mark live verification complete from a build, mocked session, screenshot, or saved review. Usage charges and retention depend on your account and current ElevenLabs settings.
