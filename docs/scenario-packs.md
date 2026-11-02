# Plain-Markdown scenario packs

A scenario pack shares one professional role play without application-code changes. It contains a target company, buyer persona, product/service offer, practice objective, practice structure, learner track, optional focus, and mode.

## Safety and OPSEC rules

- Use `.md` only for scenario packs. Account and buyer documents may separately use `.md` or `.txt`.
- Keep account and buyer files at or below 16,000 bytes each. Keep a combined pack at or below 32,000 bytes.
- Do not include credentials, secrets, personal data, confidential customer details, or proprietary account material.
- Imported Markdown is treated as inert plain text. The app does not render it as HTML, fetch links, execute scripts, or evaluate expressions.
- HTML, JSON, PDF, DOCX, archives, executables, and macro-capable formats are not accepted.
- Text is stored in browser local storage until Reset. There is no application-server upload, but bounded context is sent to ElevenLabs during live sessions.
- Fixed agent safety rules sit outside imported reference text. Instructions inside a pack cannot override them.

## Required format

Start with the exact title and version, then include the four required sections in order:

```markdown
# Partner Readiness Lab Scenario Pack

Pack version: 1
Scenario: qualification
Track: seller
Focus: medd_metrics
Mode: guided

## Target company

Company: Example Logistics
Industry: Logistics

Add business context, priorities, workflows, stakeholders, constraints, and unknowns.

## Buyer persona

Name: Avery Singh
Role: SVP Operations

Add responsibilities, priorities, concerns, objections, and decision influence.

## Product or service

Route-exception workflow automation

## Practice objective

Qualify the exception-management problem and earn a validation session.
```

All field values and section bodies are plain text. Do not add HTML or expect Markdown formatting to carry into the interface. A line inside a section that starts with `## ` is escaped on export so it cannot be confused with a required section boundary.

## Practice structures

Use one of these `Scenario` values:

- `full`: Full discovery. Supports `seller` or `solutions-consultant`.
- `qualification`: Qualification and value. Requires `seller`.
- `technical`: Technical validation and handoff. Requires `solutions-consultant`.
- `objections`: Objection handling and proof. Requires `seller`.
- `escalation`: Customer escalation and recovery. Requires `seller`.

Evidence and review criteria are generated from the selected structure and buyer. A pack does not import executable regex rules or custom scoring code.

## Optional focuses

Use `Focus: balanced` for no special focus.

MEDDPICC values for the seller track:

- `medd_metrics`
- `medd_economic_buyer`
- `medd_decision_criteria`
- `medd_decision_process`
- `medd_paper_process`
- `medd_identify_pain`
- `medd_champion`
- `medd_competition`

Command of the Message values for the seller track:

- `cotm_current_pain`
- `cotm_desired_outcomes`
- `cotm_required_capabilities`
- `cotm_differentiation`
- `cotm_proof`
- `cotm_next_step`

Technical-discovery values for the solutions-consultant track:

- `technical_workflow`
- `technical_systems`
- `technical_integration`
- `technical_failures`
- `technical_testing`
- `technical_reliability`
- `technical_deployment`
- `technical_next`

The focus must match the track. These are optional lenses, not linear stages.

## Mode

- `guided`: local evidence, real-session and native-history gates, and human review.
- `free`: live role play and coaching without evidence scores, review gates, or completion records.

## Share a pack

1. Build the scenario in the app or copy the format above.
2. Select **Export scenario pack** to generate a normalized `.md` file.
3. Review the file for sensitive or unsupported content before sharing.
4. Another user selects **Import Markdown pack**, reviews the imported fields, configures a public generic custom-buyer agent, and starts.

For a community contribution, submit the `.md` pack and a short description of the learning outcome. Do not include real customer information, live agent IDs, API keys, or claims that the pack has passed live verification unless that verification actually occurred.
