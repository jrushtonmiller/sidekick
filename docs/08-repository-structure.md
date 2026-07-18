# Repository Structure

Use one repository and one deployable web app for the hackathon.

```text
sidekick/
  AGENTS.md
  README.md
  MANIFEST.md
  docs/
  schemas/
  templates/
  seed/
  examples/
  package.json
  next.config.ts
  middleware.ts
  firebase.json
  firestore.rules
  storage.rules
  public/
    manifest.webmanifest
    icons/
    demo/
  scripts/
    seed-demo.ts
    reset-demo.ts
    validate-templates.ts
  src/
    app/
      join/[token]/page.tsx
      auth/
      patient/
        dashboard/page.tsx
        submissions/new/page.tsx
        submissions/[id]/page.tsx
        submissions/[id]/review/page.tsx
      staff/
        queue/page.tsx
        submissions/[id]/page.tsx
      clinician/
        queue/page.tsx
        visits/page.tsx
        submissions/[id]/page.tsx
      admin/
        forms/page.tsx
        unsupported/page.tsx
      api/
        invitations/resolve/route.ts
        patient-match/route.ts
        submissions/route.ts
        submissions/[id]/messages/route.ts
        submissions/[id]/patient-sign/route.ts
        submissions/[id]/staff-disposition/route.ts
        submissions/[id]/clinician-sign/route.ts
        submissions/[id]/export/route.ts
    components/
      form/
      chat/
      provenance/
      queue/
      signature/
      layout/
    domain/
      enums.ts
      types.ts
      errors.ts
      workflow.ts
      signatures.ts
      form-evaluation.ts
    server/
      auth/
      firebase/
      repositories/
      services/
      ai/
        providers/mock.ts
        providers/openai.ts
        orchestrator.ts
        schemas.ts
      documents/
      pdf/
      adapters/
        emr/mock.ts
        abridge/mock.ts
    templates/
      ca-dmv-reg195.json
    test/
      fixtures/
      unit/
      integration/
      e2e/
```

## Separation rules

### `domain`

Pure business logic. No React, Firebase, or provider imports.

### `server/repositories`

Tenant-scoped persistence. Every public function requires a `TenantContext`.

### `server/services`

Coordinates domain logic and repositories.

### `server/ai`

Contains provider adapters and validation. It cannot directly mutate Firestore.

### `components`

Presentational and interactive UI. Components receive explicit permissions and state, but server authorization remains authoritative.

### `templates`

Developer-authored form templates. Validate them in CI and at startup.

## Naming conventions

- IDs are opaque strings, never names or dates of birth.
- Firestore fields use `camelCase`.
- Template field IDs use dot notation, such as `applicant.physicalAddress.city`.
- Status values use `snake_case` for stable serialized enums.
- React components use `PascalCase`.
- Domain functions use verbs, such as `canTransition`, `invalidateSignature`, and `deriveWorkItems`.

## Dependency direction

```text
UI -> API/service -> domain -> types
                    -> repository/provider adapters
```

The domain layer must not depend on Firebase, Next.js, or OpenAI.
