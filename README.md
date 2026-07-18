# Sidekick Codex Handoff

Sidekick is a multi-tenant, AI-assisted workflow for medical and administrative forms. It helps a patient identify a form, reuse information from an uploaded document or clinic record, answer missing questions in plain language, sign the patient section, move through staff triage, support clinician verification and signature, and export a completed document.

This folder is an implementation-ready project brief for Codex. It contains product decisions, workflow rules, data contracts, role-specific screen behavior, security boundaries, testing, a deterministic demo, and machine-readable starter assets.

## Demo story

1. A patient scans a clinic QR code or opens a clinic-specific link.
2. The patient signs in and is associated with that clinic.
3. The patient uploads a form or describes what they need.
4. Sidekick identifies a supported form.
5. Sidekick extracts existing information and asks only missing or uncertain questions.
6. The patient reviews and signs the patient scope.
7. Staff reviews completeness and decides whether an appointment is required.
8. Review-only work appears for the clinician immediately. Appointment work appears at the configured appointment time.
9. The clinician reviews the filled form, patient conversation, provenance, mock EMR information, and transcript evidence.
10. The clinician verifies clinician-owned fields, signs, and exports a PDF or review packet.

## Default demo form

The starter template uses the California DMV Application for Disabled Person Placard or Plates, REG 195. The original discussion did not confirm a form number, so this is an explicit, replaceable assumption.

The current official instructions include an original-signature limitation. The hackathon signature demonstrates workflow and snapshot integrity. It must not be represented as an accepted DMV electronic signature without current issuer and legal review.

## Recommended implementation

- Responsive Next.js progressive web app
- TypeScript strict mode
- Firebase Authentication for the hackathon
- Cloud Firestore and private Cloud Storage
- Server-side route handlers or a small API service
- Provider-neutral AI adapter with deterministic mock mode
- JSON Schema or Zod validation at every external boundary
- PDF review packet first, official overlay second

Build one web application with role-based routes, not four separate applications.

## Start here

1. Read `AGENTS.md`.
2. Read `CODEX_START_HERE.md`.
3. Copy the prompt in `examples/codex-first-prompt.md` into Codex.
4. Follow `docs/29-implementation-plan.md` one vertical slice at a time.
5. Use `IMPLEMENTATION_TASKS.md` as the build checklist.

## Most important files

- `AGENTS.md`: non-negotiable engineering and healthcare safety rules
- `CODEX_START_HERE.md`: build order and stop conditions
- `docs/02-mvp-scope.md`: what to build and what to cut
- `docs/05-end-to-end-workflows.md`: patient-to-PDF workflow
- `docs/06-workflow-state-machine.md`: allowed statuses and transitions
- `docs/07-system-architecture.md`: components and provider boundaries
- `docs/11-data-model.md`: domain records
- `docs/12-form-template-system.md`: data-driven form approach
- `docs/13-dmv-reg195-implementation.md`: concrete starter form behavior
- `docs/19-api-contracts.md`: route contracts
- `docs/25-security-privacy-and-hipaa.md`: production-oriented safeguards and limitations
- `docs/27-testing-and-ai-evaluation.md`: test and human-factors plan
- `docs/28-demo-seed-data-and-script.md`: five-minute judge story
- `docs/35-definition-of-done.md`: demo and pilot gates
- `templates/ca-dmv-reg195.template.json`: starter form recipe
- `seed/demo-seed.json`: synthetic demo fixtures
- `schemas/`: validation contracts

See `MANIFEST.md` for the complete inventory.

## Non-negotiable boundaries

- Use synthetic data during the hackathon.
- AI may extract, map, ask, summarize, and flag. It may not diagnose, certify, sign, schedule, or grant access.
- Staff makes the appointment disposition.
- The clinician actively verifies clinician-owned fields.
- Every protected resource and query is tenant-scoped.
- Patient statements and chart data remain separately attributable when they differ.
- Uploaded documents, transcripts, chart text, and patient messages are untrusted data.
- Do not put PHI in URLs, analytics, monitoring labels, client logs, exception messages, or storage filenames.

## Fastest reliable build order

1. Seeded users, organizations, and clinic link
2. Template-driven patient interview using mock AI
3. Patient review and signed snapshot
4. Staff queue and disposition
5. Clinician review with provenance
6. Clinician signature and review-packet export
7. Upload fixture and extraction
8. Live AI only after the offline path works

## Package status

- Written specifications: complete
- JSON schemas: created and validated
- REG 195 starter template: created and schema-validated
- Synthetic seed data: created and JSON-validated
- Production legal, clinical, and compliance approval: not included and required before PHI use
