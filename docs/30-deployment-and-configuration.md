# Deployment and Configuration

## Environments

Use separate environments:

- Local emulator
- Shared hackathon demo
- Staging
- Production, future

Do not reuse production credentials or real data in demo and staging.

## Recommended deployment shape

### Web

- Next.js application deployed to an approved web runtime
- Server-side route handlers or separate API service
- HTTPS only
- Custom domain optional for hackathon

### Data

- Cloud Firestore
- Private Cloud Storage bucket
- Firebase Authentication for hackathon
- Google Cloud Identity Platform for future advanced tenant identity

### Workers

- Cloud Functions, Cloud Run jobs, or task queue for OCR and PDF work
- Idempotent job handlers
- Separate service accounts

## Configuration variables

Example `.env.example`:

```bash
NODE_ENV=development
APP_BASE_URL=http://localhost:3000
DEMO_MODE=true
DEMO_CLOCK_MODE=fixed
DEMO_NOW=2026-07-18T09:00:00-07:00

FIREBASE_PROJECT_ID=sidekick-demo
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_STORE=false
AI_REQUEST_TIMEOUT_MS=15000

DOCUMENT_PROCESSOR=fixture
PDF_RENDERER=review_packet

MAX_UPLOAD_BYTES=15728640
MAX_UPLOAD_PAGES=10
SESSION_MAX_AGE_SECONDS=3600

ENABLE_ROLE_SWITCHER=true
ENABLE_DEMO_RESET=true
```

Validate configuration at startup. Refuse to start production with demo controls enabled.

## Configuration safety rules

Production build must fail when:

- `DEMO_MODE=true`
- role switcher enabled
- demo reset enabled
- mock patient credentials exposed
- Firestore rules are test mode
- storage allows public access
- required secret missing
- AI provider configured for PHI without approved settings

## Local setup

Recommended commands:

```bash
npm install
cp .env.example .env.local
npm run emulators
npm run seed
npm run dev
```

Separate terminals may be used for emulators and app. Provide `npm run dev:demo` to start the common local configuration.

## Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:demo": "cross-env DEMO_MODE=true AI_PROVIDER=mock next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:rules": "firebase emulators:exec --only firestore,storage 'vitest run tests/rules'",
    "validate:templates": "tsx scripts/validate-templates.ts",
    "seed": "tsx scripts/seed-demo.ts",
    "reset:demo": "tsx scripts/reset-demo.ts"
  }
}
```

## CI pipeline

On pull request:

1. Install locked dependencies
2. Lint
3. Type check
4. Unit tests
5. Template and JSON Schema validation
6. Authorization and Security Rules tests
7. Build
8. End-to-end smoke test in mock mode
9. Secret scan
10. Dependency scan

On demo deployment:

- Deploy rules first only after tests
- Deploy web and workers
- Seed synthetic data
- Run smoke test
- Generate one export
- Verify Clinic B cannot access Clinic A

## Firebase project setup

- Create separate project for demo.
- Enable only required products.
- Use locked Firestore and Storage rules.
- Configure authorized domains.
- Restrict API keys where supported.
- Enable App Check after the main flow is stable, recognizing that App Check supplements rather than replaces authorization.
- Set budgets and quotas.
- Avoid optional analytics products for the PHI architecture unless separately reviewed.

## Firestore indexes

Likely composite indexes:

```text
workItems: organizationId, queue, status, availableAt
workItems: organizationId, assigneeUserId, status, availableAt
submissions: organizationId, patientId, updatedAt
submissions: organizationId, status, updatedAt
unsupportedFormRequests: organizationId, reviewStatus, lastRequestedAt
```

Document indexes in source control.

## Security Rules deployment

Rules must:

- Deny by default
- Validate authentication
- Check active membership or claims
- Enforce owner access for patient data
- Enforce tenant match
- Disallow client writes to signatures, audit events, clinician verification, and queue routing
- Restrict storage paths and file metadata

Use server-only writes for complex protected transitions.

## Seed deployment

The seed script must be idempotent and tagged:

```json
{
  "seedVersion": "demo-v1",
  "synthetic": true
}
```

Reset deletes only resources with the demo seed marker in the demo project.

## AI configuration

### Mock

Default for the judge demo.

### Live

- Server-side key only
- Structured outputs
- Request timeout
- Maximum token and file limits
- `store: false` when applicable
- No web search with patient data
- Model and prompt version logged without raw payload
- Automatic fallback to mock only in demo mode

Do not silently fall back to mock in production clinical work as though the output were live. Display a controlled unavailable state.

## PDF assets

Store form assets by version:

```text
assets/forms/ca_dmv_reg195/2023-11/blank.pdf
assets/forms/ca_dmv_reg195/2023-11/render-map.json
```

Record checksum. Do not replace a file under the same revision path.

## Domain and transport security

- HTTPS redirect
- HSTS in production
- Secure cookies
- SameSite policy
- CSP
- Referrer policy that avoids leaking protected routes
- No PHI query parameters
- Short-lived protected download links

## Demo readiness checklist

- Fresh reset tested
- Role links tested
- QR opens on phone
- Fake clock tested
- Mock AI active
- Upload fixture local
- Export generated
- Browser cache cleared or known state
- Backup recording available
- Charger and network fallback ready

## Production readiness additions

- Infrastructure as code
- Separate service accounts
- Key rotation
- BAA and covered-service validation
- Risk assessment
- Central identity and MFA
- WAF and abuse controls
- Backup and restore
- Incident response
- Privacy and security monitoring
- Penetration testing
- Data retention jobs
- Support-access controls
- Business continuity plan

## Acceptance criteria

- Local setup is reproducible from README commands.
- Demo deployment uses synthetic data and mock AI by default.
- Production cannot start with demo controls.
- Rules, indexes, templates, and seed scripts are version-controlled.
- The build pipeline tests tenant isolation and generates an export.
- Secrets never enter the browser bundle or repository.
