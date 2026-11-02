---
name: Partner Readiness Lab
description: A professional voice role-play room with custom target accounts, executive buyers, and one continuous live conversation.
colors:
  white: "#ffffff"
  canvas: "#f5f5f4"
  stone: "#f5f2ef"
  ink: "#000000"
  body: "#4e4e4e"
  muted: "#6f6a64"
  danger: "#b42318"
  success: "#18794e"
  warning: "#8a5a00"
  focus: "#2563eb"
typography:
  family: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  display: "300 36 to 52px, line-height 1.06"
  body: "400 14px, line-height 1.55"
  label: "600 11px"
rounded:
  surfaces: "16px"
  fields: "12px"
  controls: "999px"
---

# Design system: Partner Readiness Lab

## Direction

The center conversation remains the product. Account, buyer, scenario, focus, and mode selection support one live role play rather than creating a generic course or a gallery of decorative scenario cards. The interface serves professional partner enablement and custom community scenarios.

The established white and warm-stone surfaces, black ink, light Inter display type, pill controls, 12 to 16px radii, and low-opacity structural edges remain authoritative. Voice and live state supply the expressive material. Semantic green, amber, red, and blue belong to assessment, error, and focus states.

## Layout

The page has a quiet header, compact title and session facts, and a four-stage Guided loop. Free practice reduces the loop to Prepare and Conversation. On wide screens a 1240px content shell centers the header and workspace. Bounded support rails frame a flexible center column, with a soft offset shadow establishing the conversation as the primary surface. The workspace contains three sibling surfaces:

- Left: Dossier, Talk track, and Resources tabs. Custom target-account and buyer content appears here as inert text.
- Center: account, buyer, scenario, focus, mode, custom text, and agent setup; live voice/transcript; one verbatim script; optional composer; evaluation or Free summary; and human review.
- Right: timer, listening estimate, compass, specialist handoffs, scenario/buyer evidence, possible buying signals, and the human review form.

Above 1240px the workspace fills the remaining viewport height. The support rails and center stage scroll internally, keeping the overall composition and center-panel chrome stationary while long setup or review content moves. At 1240px and below normal document scrolling returns, the coach rail spans the second row, and its sections become a two-column grid. At 860px the layout becomes one column. During connecting and live sessions the center comes first. During setup the dossier stays first. Script text and inputs remain at least 16px on mobile, and workflow controls remain reachable. At 480px scenario fields, track and mode choices, agent controls, upload rows, pack actions, and composer actions stack.

## Typography and copy

Inter serves every role with system fallbacks. Display text is light with balanced wrapping and tracking no tighter than -.04em. Body text stays readable at working density. Timers and IDs use tabular numerals where useful.

Copy names real actions and limitations: Custom company or industry, Product or service you are selling, Import Markdown pack, Export scenario pack, Guided review, Free practice, Configure, Start live conversation, Cancel connection, Edit this script, Send as text, End conversation, Open ElevenLabs history, and Continue to human review. Configured never means live-ready. Possible buying signals never mean purchase intent. Free practice never means assessment or completion.

## Components

### Scenario and buyer setup

Two-column field grids expose target account, built-in buyer, practice structure, and focus. Full discovery retains the two-track picker. Fixed-track structures hide it. Northstar provides Maya, Daniel, and Priya. Custom practice replaces the built-in buyer picker with target-account and buyer text areas, separate file inputs, offer, and objective.

All setup controls lock during connection, live session, evaluation, summary, and review so the scenario cannot change midstream. Agent IDs are stored per built-in buyer and for the generic custom buyer. The agent label and hint identify the required buyer and voice configuration.

### Text-only upload and packs

Paste input is always available. File controls accept only `.md` and `.txt` for account/buyer documents and `.md` for packs. Template and import/export actions use existing text and secondary-button styles. Plain-text status explains success, validation, privacy, and recovery. Uploaded text is never rendered as HTML. The privacy note distinguishes local browser reading from live ElevenLabs context transmission.

### Practice modes

Guided review and Free practice use the same two-choice vocabulary as the track picker. Guided shows evidence, native-history gating, and human review. Free hides evidence, handoffs, signals, evaluation, and review, and ends at a clear ungraded summary.

### Transcript and responses

The thread sits on warm canvas with bounded height and local scrolling. The selected buyer uses white turns, learner turns use black, and tentative text is explicitly labeled and italicized at full opacity. SDK updates patch only affected turns. A separate polite live region announces final messages only. One first-person verbatim script appears below the thread after the buyer's completed turn. Nothing auto-sends or auto-speaks. Cancel connection and End conversation remain at the top throughout connection and live sessions.

### Session evidence

The timer uses light 36px numerals. The listening bar is a simple measurement track. Evidence lists use text and small heard markers with short in-memory excerpts. The selected framework focus receives a compact Focus marker. No transcript excerpt is persisted. Free practice does not record evidence or signals.

### Evaluation and human review

Guided evaluation shows target account, buyer, scenario, track, focus, real conversation ID, elapsed time, listening estimate, evidence counts, and possible-signal counts. History opening is a gate, not a verification claim. Review criteria come from the selected scenario and buyer. Free practice shows only a summary and a return-to-setup action.

### Accessibility and browser surfaces

The app provides semantic landmarks, tabs, fieldsets, labels, a skip link, visible focus, alert errors, live status regions, reduced-motion behavior, custom scrollbar colors, text selection, caret color, underline offsets, and 44px targets. File and pack controls remain keyboard accessible. These are implementation provisions, not a completed accessibility audit.

### Print

Print hides the app and shows a dedicated record with target account, buyer, offer, scenario, track, focus, mode, local and real IDs, duration, listening estimate, ratings, evidence labels, possible signals, notes, and disclaimer. Practice review always prints a practice title. Guided completion requires a qualifying real session, opened history, and human pass. Free practice has no print completion path.

## Boundaries

Do not add gradients, decorative scenario cards, a popup coach, another AI service, sentiment scoring, consumer-role-play detours, or a visual-world replacement. Do not render imported Markdown as HTML, fetch imported links, or persist transcript text or audio. Do not imply that local rules are native ElevenLabs evaluation, that history opening verifies results, that context changes an agent's configured voice, or that a build or mock proves live behavior.

## Verification record

The expanded app uses Vite and the official `@elevenlabs/client`. Normal build and mocked browser checks are the required local gate. Desktop and mobile captures live in `.impeccable/review/`. Live WebRTC, distinct configured voices, custom buyer behavior, and native evaluation remain separate account verification tasks.
