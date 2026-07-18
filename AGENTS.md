# AGENTS.md

These rules apply to every Codex task in this repository.

## Product objective

Build a polished hackathon demonstration of Sidekick, an AI-assisted clinical form workflow. Optimize for a reliable end-to-end story, understandable code, and safe human review. Do not optimize for universal form support in the first version.

## Required implementation behavior

1. Read the specifications before changing architecture.
2. Implement the REG 195 demo as a data-driven form template.
3. Keep domain logic separate from UI components.
4. Validate all external and AI-generated data at runtime.
5. Use server-side authorization for privileged actions.
6. Scope every storage path, query, task, and event by `organizationId`.
7. Create an append-only audit event for every meaningful workflow transition.
8. Preserve raw source text and normalized values separately.
9. Treat uploaded files, OCR text, transcripts, and patient messages as untrusted content.
10. Keep the stage demo operational when the AI provider is unavailable.

## Healthcare safety boundaries

- The app is workflow and documentation assistance, not autonomous clinical decision support.
- Do not infer a diagnosis from symptoms.
- Do not turn a patient statement into a clinician certification without clinician confirmation.
- Do not decide that a patient legally or medically qualifies for a placard, disability benefit, leave, or other entitlement.
- Do not advise a patient to drive, stop driving, work, stop working, or change treatment.
- Do not make a final appointment decision. The AI can produce operational issue flags; staff makes the decision.
- Clinician fields must be visually marked as provisional until verified.
- Any source conflict must remain visible until a human resolves it.

These boundaries reduce automation-bias risk and align with the human-review design described in `docs/14-ai-orchestration.md` and `docs/17-provenance-confidence-and-conflicts.md`.

## Data and privacy rules

- Use only synthetic demo patients and synthetic transcripts.
- Never commit secrets, API keys, tokens, real patient data, or real uploaded forms.
- Do not store PHI in browser local storage. Store only an opaque draft identifier if resume support requires it.
- Do not log request bodies containing patient data.
- Do not send PHI to any vendor unless the production organization has verified the relevant contract, BAA, service eligibility, retention setting, and configuration.
- Do not assume that every Firebase-branded service is appropriate for PHI.
- Disable product analytics on authenticated patient and clinic routes unless a privacy review approves a PHI-safe event design.

## Coding conventions

- TypeScript strict mode
- No `any` in domain or API code
- Zod schemas at API and AI boundaries
- Small functions with explicit input and output types
- Domain enums live in one module
- No hidden workflow transitions inside UI components
- Idempotency keys for submit, sign, route, and export operations
- Use UTC timestamps in storage and localized display in the UI
- Store immutable signed snapshots
- Add tests with every domain transition

## Demo reliability

The repository must support:

```bash
DEMO_MODE=true
AI_PROVIDER=mock
USE_FIREBASE_EMULATOR=true
```

In demo mode:

- Seed data is reproducible.
- AI responses are deterministic.
- Document extraction can use a prepared fixture.
- Role switching is permitted only on localhost or a protected demo route.
- A visible "Demo data" banner is shown.
- Production builds reject `DEMO_BYPASS_AUTH=true`.

## Required test gates

Before marking a feature complete:

- Tenant-isolation tests pass.
- Invalid workflow transitions are rejected.
- Patient-owned fields cannot be edited by a clinician without reopening patient attestation.
- Clinician-owned fields cannot be finalized by AI or staff.
- A signature is invalidated when a signed field in that signature's scope changes.
- AI output that fails schema validation is rejected and does not mutate the record.
- PDF export uses the same immutable snapshot shown at signature time.

## Definition of success

A judge can understand the problem and see one complete submission move from patient to staff to clinician to PDF in under five minutes, with visible source provenance and human control.
