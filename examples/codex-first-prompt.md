# Suggested First Prompt for Codex

Use this after opening the package in the repository:

```text
Read AGENTS.md, CODEX_START_HERE.md, README.md, docs/02-mvp-scope.md,
docs/06-workflow-state-machine.md, docs/07-system-architecture.md,
docs/11-data-model.md, docs/12-form-template-system.md,
docs/13-dmv-reg195-implementation.md, docs/19-api-contracts.md, and
IMPLEMENTATION_TASKS.md.

Build Phase 0 and Phase 1 only:

1. Create a responsive Next.js TypeScript application.
2. Add environment validation and DEMO_MODE.
3. Add Firebase emulator configuration and locked placeholder rules.
4. Seed two organizations and the four Harbor Family Medicine roles from seed/demo-seed.json.
5. Resolve an opaque clinic link and route authenticated users to role-specific shells.
6. Create tenant-scoped repository interfaces and authorization helpers.
7. Add tests proving a Clinic B user cannot read Clinic A resources.

Do not implement live AI, OCR, signatures, or PDF export yet.
Do not invent fields or change the workflow.
Use synthetic data only.
Run lint, typecheck, tests, and build before stopping.
Report files changed, commands run, and any assumptions.
```

Then continue one vertical slice at a time using `docs/29-implementation-plan.md`.
