# Implementation Plan

## Build principle

Deliver one complete vertical slice before adding breadth. The order below minimizes integration risk and protects the demo.

## Phase 0: repository and guardrails

### Tasks

- Create Next.js TypeScript app
- Add linting, formatting, type checking, and test runner
- Add environment validation
- Add `DEMO_MODE`, `AI_PROVIDER`, and fake-clock configuration
- Add Firebase emulator configuration
- Create domain folders and adapter interfaces
- Add CI for lint, type check, tests, and JSON validation
- Add synthetic-data banner

### Exit criteria

- App runs locally
- CI passes
- No secret is committed
- Demo mode is visible

## Phase 1: identity, tenant, and seeded roles

### Tasks

- Seed two organizations
- Seed patient, staff, clinician, and admin memberships
- Implement clinic QR token resolution
- Implement role-shaped navigation
- Implement tenant-scoped repository methods
- Add role switcher only in demo mode
- Add cross-tenant authorization tests

### Exit criteria

- Clinic A and Clinic B data never cross
- Every role lands on the correct home
- Public clinic token contains no PHI

## Phase 2: template engine and DMV fixture

### Tasks

- Implement form-template types
- Add JSON Schema validation
- Load exact template version into a submission
- Implement conditional visibility
- Implement field ownership and required validation
- Add REG 195 starter template
- Add plain-language question metadata
- Add mock rendering target definitions

### Exit criteria

- A submission can be created from template data
- UI is generated from template fields rather than form-specific screens
- Template validation tests pass

## Phase 3: patient workflow

### Tasks

- Patient onboarding and five-identifier match fixture
- New request flow
- Mock form identification
- Interview state and autosave
- Mock next-question and normalization provider
- Review screen
- Patient attestation and signed snapshot
- Patient status screen

### Exit criteria

- Patient completes and signs the main case on mobile
- Refresh and resume work
- Clinician fields are never patient-certified

## Phase 4: staff workflow

### Tasks

- Staff work-item collection and queue
- Completion checklist
- Patient conversation viewer
- Source badges
- Mock EMR evidence panel
- Conflict fixture
- Staff claim and notes
- Review-only and appointment dispositions
- `availableAt` routing with fake clock

### Exit criteria

- Staff can route both seeded cases
- Appointment case remains hidden from clinician
- Disposition is audited

## Phase 5: clinician workflow

### Tasks

- Clinician queue
- Form-centered review workspace
- Evidence drawer
- Exact transcript and chart excerpts
- Clinician field editing and verification
- Conflict resolution
- Signature readiness
- Clinician signed snapshot

### Exit criteria

- No certification is preselected
- Every required clinician field is actively verified
- Signed-field change invalidates signature

## Phase 6: export and timeline

### Tasks

- Implement Sidekick review packet first
- Add immutable-snapshot export
- Add audit timeline
- Add official PDF overlay only after packet is stable
- Add demo watermark and original-signature caveat

### Exit criteria

- Export completes repeatedly
- Export hash matches signed snapshot
- Timeline shows the complete lifecycle

## Phase 7: upload and extraction

### Tasks

- Upload session
- Private storage path
- Fixture processing job
- OCR block fixture
- Field suggestion confirmation
- Document viewer with source crops
- Manual fallback

### Exit criteria

- Patient uploads the seeded form
- Extracted fields are confirmed
- Interview skips confirmed values
- Failure falls back to manual flow

## Phase 8: live AI option

### Tasks

- Implement OpenAI provider adapter
- Add structured output schemas
- Add minimum-necessary context builder
- Add `store: false` or approved retention configuration
- Add schema and policy retries
- Add prompt-injection tests
- Add provider timeout and mock fallback

### Exit criteria

- Live provider passes the curated fixture tests
- Demo remains fully functional in mock mode
- No AI action can sign, verify, or change access

## Phase 9: admin and polish

### Tasks

- Supported form availability
- Unsupported form backlog
- Membership list
- Clinic QR view
- Responsive and accessible polish
- Empty, loading, and error states
- Demo reset and checkpoint links
- Recorded backup walkthrough

### Exit criteria

- Admin story is credible without a form builder
- Main demo consistently fits time

## Parallel work split for two builders

### Builder A: patient and template track

- App shell and patient UI
- Template engine
- Interview state
- Patient signature
- Upload experience

### Builder B: operations and clinician track

- Data model and repositories
- Staff queue
- Clinician review
- Audit and export
- Seed and demo controls

Shared checkpoints:

- Agree TypeScript contracts before implementation
- Merge vertical slice daily
- Keep mock provider and seed data stable
- Do not let each track create separate versions of the form field model

## Suggested directory ownership

```text
src/app/patient              Builder A
src/components/patient       Builder A
src/domain/forms             Shared, one owner
src/ai                       Shared, one owner
src/app/staff                Builder B
src/app/clinician            Builder B
src/domain/workflow          Builder B
src/server/repositories      Builder B
src/server/pdf               Builder B
schemas and templates        Shared review
```

## Issue format for Codex

Each implementation issue should include:

- Goal
- User role
- In-scope routes
- Domain objects
- Authorization rule
- Acceptance criteria
- Tests required
- Out-of-scope behavior

Example:

```text
Goal: route a patient-signed submission to staff review.
Role: patient and system.
State: PATIENT_REVIEW -> STAFF_REVIEW_PENDING.
Authorization: authenticated patient owns submission in same tenant.
Acceptance: immutable patient snapshot, signature record, work item, audit event, idempotency test.
Out of scope: notifications.
```

## Scope-cut order

When time is short, cut in this order:

1. Live OCR, retain fixture upload
2. Live AI, retain mock provider
3. Official PDF overlay, retain review packet
4. Admin dashboards beyond unsupported backlog
5. Multiple forms
6. App installation polish

Never cut:

- Tenant scoping
- Role boundaries
- Patient review
- Staff decision
- Clinician verification
- Signature snapshots
- Deterministic demo

## Acceptance criteria

- Work proceeds in vertical slices.
- P0 path is complete before P1 work.
- Two builders share one domain model.
- Every issue includes authorization and test criteria.
- Scope cuts preserve the human-in-the-loop story and data isolation.
