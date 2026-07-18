# Codex Start Here

## First task

Open this package at the repository root and use `examples/codex-first-prompt.md` as the first Codex instruction.

Codex should read the required documents before writing code. It should implement only the requested slice, run tests, and report assumptions rather than silently inventing product behavior.

## Required initial reading

1. `AGENTS.md`
2. `README.md`
3. `docs/00-product-brief.md`
4. `docs/01-decisions-assumptions-open-questions.md`
5. `docs/02-mvp-scope.md`
6. `docs/05-end-to-end-workflows.md`
7. `docs/06-workflow-state-machine.md`
8. `docs/07-system-architecture.md`
9. `docs/09-multitenancy.md`
10. `docs/11-data-model.md`
11. `docs/12-form-template-system.md`
12. `docs/13-dmv-reg195-implementation.md`
13. `docs/19-api-contracts.md`
14. `docs/29-implementation-plan.md`
15. `IMPLEMENTATION_TASKS.md`

For the first slice, also load:

- `schemas/form-template.schema.json`
- `templates/ca-dmv-reg195.template.json`
- `seed/demo-seed.json`

## Suggested local command sequence

```bash
pnpm install
pnpm run dev:demo
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run validate:templates
pnpm run seed
```

Codex should create missing scripts during the scaffold.

## Build slices

### Slice 1: shell, identity, and tenant boundary

- Next.js TypeScript app
- Environment validation
- Firebase emulator configuration
- Two seeded organizations
- Patient, staff, clinician, and admin roles
- Opaque clinic link resolver
- Role-aware route shells
- Tenant-scoped repository and authorization helpers
- Cross-tenant tests

### Slice 2: template and patient intake

- Load REG 195 template
- Create submission
- Mock form identification
- Template-driven interview
- Save and resume
- Patient review and attestation snapshot

### Slice 3: staff operations

- Staff queue
- Deterministic completeness checks
- AI-suggested issues displayed separately
- Review-only and appointment dispositions
- `availableAt` routing with fake clock

### Slice 4: clinician completion

- Clinician queue
- Form-centered review
- Source and transcript drawer
- Conflict display
- Clinician field verification
- Clinician signature snapshot
- Review-packet export

### Slice 5: upload and AI adapters

- Private upload
- Fixture OCR and mapping
- Patient confirmation
- Live structured AI provider behind adapter
- Mock fallback
- Prompt-injection tests

### Slice 6: hardening and presentation

- Firestore and Storage Rules
- Accessibility pass
- Error and recovery states
- Admin backlog
- Demo reset and fake clock
- Judge script rehearsal

## Stop and report instead of guessing when

- The intended DMV form differs from REG 195.
- Exact official PDF coordinates or signature acceptance are needed.
- A real Abridge or EMR schema is unavailable.
- A proposed service or feature has not been approved for PHI.
- A workflow change would let AI or staff certify a clinician-owned field.
- A requirement conflicts with tenant isolation or signed-snapshot integrity.

## Expected report from every slice

1. Files changed
2. Routes and screens added
3. Data model or schema changes
4. Authorization rules implemented
5. Tests run and results
6. Known limitations
7. Exact recommended next slice
