# OPSEC release gate

OPSEC review is required before every push, tag, release, screenshot, recording, and scenario-pack contribution. Automated checks support this review but do not replace it.

## Automated gate

Run from the repository root before staging or pushing:

```bash
npm run release:check
```

This runs `scripts/opsec-check.mjs` and the production build. The OPSEC script scans tracked files and untracked, non-ignored release candidates, then scans every commit reachable from local Git refs. It checks for:

- Private keys, common API-secret formats, GitHub tokens, AWS access keys, and assigned API keys.
- Agent-ID-shaped values that require review, including public ElevenLabs agent IDs.
- Sensitive filenames, browser profiles, environment files, private-key files, audio, and video artifacts.

The script prints finding types and paths, not matched secret values. A finding stops the release. Do not push until the finding is removed or confirmed as a false positive and handled deliberately. Rotate any real exposed credential. History rewriting requires a separate, coordinated cleanup and is not performed by this script.

The GitHub Actions workflow at `.github/workflows/opsec.yml` runs the same command with full Git history on every push and pull request. A green local run does not exempt a release from the manual checklist or required CI result.

## Manual pre-push checklist

### 1. Review the release candidates

```bash
git status --short
git diff --check
```

After staging, review the complete staged diff and file list:

```bash
git diff --cached --stat
git diff --cached
```

Check for local browser profiles, environment files, credentials, API keys, real agent IDs, real conversation IDs, customer data, personal data, transcripts, evidence excerpts, audio, recordings, logs, and confidential account material. Keep Chrome profiles and other local artifacts ignored rather than merely unstaged.

### 2. Review screenshots, recordings, and release assets

Use fictional Northstar content or clearly fictional custom scenarios. Inspect every visible field, browser address, tab title, notification, transcript, conversation ID, agent ID, local attempt ID, reviewer note, and account detail. Do not publish real customer or employer information.

Inspect image metadata and remove location, device, account, or other identifying metadata if present. Apply the same review to GitHub release assets as to files embedded in the README. Screenshots are never evidence of live ElevenLabs verification.

### 3. Confirm the application data boundary

- Public agent IDs, setup selections, custom account and buyer text, offer, objective, local attempt context, metrics, real conversation ID, evidence and signal IDs, reviewer notes, and saved decisions may be stored locally.
- Reset clears practice and custom scenario data but preserves configured public agent IDs by design. Clearing saved IDs requires a separate deliberate action.
- Transcript text, evidence excerpts, and audio must not enter local storage or release artifacts.
- Imported text remains inert. It is never rendered as HTML, executed as code, or fetched as a link.
- Bounded custom context is sent to ElevenLabs only during a live session. This is disclosed in the interface.
- Public demo agents are not production agents. Restrict allowed origins, monitor usage, set account limits where available, and disable or delete agents when finished.

### 4. Confirm verification claims

Run the relevant web and macOS builds and repeatable checks. Keep mocked sessions, screenshots, portal tests, real app WebRTC sessions, native ElevenLabs evaluation, and human review distinct in release notes. Do not claim live readiness from a build, mock, screenshot, or saved local review.

### 5. Report the gate before pushing

State the automated result, the manual review result, and any remaining verification gap in the release summary. A concise release record is:

```text
OPSEC: release candidates and Git history scanned; no findings.
Manual review: staged diff and release assets checked; fictional or non-confidential content only.
Verification: builds and mocked checks passed; live-account gaps stated explicitly.
```

## v1.1 retrospective review

After v1.1 was published, the pushed tree and all three commits were scanned. The review covered 57 tracked files and found no secret-like strings, agent-ID-shaped references, sensitive tracked filenames, or Chrome artifacts. The three release screenshots were visually inspected and contained fictional context only. Image metadata was limited to dimensions, format, DPI, and color information.

This retrospective result does not replace the mandatory gate for later releases. v1.1 was checked before adding this formal process, but the process itself was not documented or called out before that push.

## Limitations

Pattern matching cannot detect every secret or confidential detail. Git history scanning does not inspect ElevenLabs portal settings, browser local storage, external release discussions, or content outside the repository. Those surfaces require separate review.
