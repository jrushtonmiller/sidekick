# Package Manifest

## Root instructions

- `README.md`: package overview, demo story, stack, and starting path
- `AGENTS.md`: binding rules for Codex implementation
- `CODEX_START_HERE.md`: slice order and stop conditions
- `IMPLEMENTATION_TASKS.md`: prioritized build checklist

## Product and workflow

- `docs/00-product-brief.md`: problem, value, users, and success measures
- `docs/01-decisions-assumptions-open-questions.md`: confirmed decisions and unresolved items
- `docs/02-mvp-scope.md`: P0, P1, and excluded scope
- `docs/03-personas-and-rbac.md`: role permissions and boundaries
- `docs/04-user-stories-and-acceptance-criteria.md`: implementable user outcomes
- `docs/05-end-to-end-workflows.md`: patient, staff, clinician, admin, and exception flows
- `docs/06-workflow-state-machine.md`: states, transitions, guards, and queue timing

## Architecture and data

- `docs/07-system-architecture.md`: frontend, backend, AI, data, and adapters
- `docs/08-repository-structure.md`: suggested code organization
- `docs/09-multitenancy.md`: organization boundary and invitation binding
- `docs/10-authentication-and-patient-matching.md`: accounts, five-identifier matching, and privacy
- `docs/11-data-model.md`: logical domain records
- `docs/12-form-template-system.md`: template concepts, validation, and versioning
- `docs/38-firestore-and-storage-layout.md`: concrete collection and object paths
- `docs/39-firebase-security-rules-blueprint.md`: default-deny Rules design and test matrix

## Starter form

- `docs/13-dmv-reg195-implementation.md`: detailed REG 195 demo behavior and caveats
- `templates/ca-dmv-reg195.template.json`: machine-readable starter recipe
- `templates/README.md`: template review and publishing process
- `examples/form-template-explained.md`: nontechnical explanation of template JSON

## AI, documents, and provenance

- `docs/14-ai-orchestration.md`: narrow capabilities and provider boundary
- `docs/15-ai-prompt-contracts.md`: typed prompt inputs, outputs, and safety rules
- `docs/16-document-ingestion-and-ocr.md`: upload, extraction, confirmation, and failure behavior
- `docs/17-provenance-confidence-and-conflicts.md`: sources, statuses, and disagreement policy
- `docs/18-emr-and-abridge-adapters.md`: mock and future integration interfaces

## API and role experiences

- `docs/19-api-contracts.md`: patient, staff, clinician, admin, document, and evidence routes
- `docs/20-patient-experience.md`: mobile patient journey and content behavior
- `docs/21-staff-experience.md`: queue, review, identity, and disposition
- `docs/22-clinician-experience.md`: source-linked verification and signature
- `docs/23-admin-experience.md`: form availability, backlog, membership, and settings
- `docs/24-signatures-and-pdf-export.md`: scope, snapshots, invalidation, and rendering

## Security, operations, and quality

- `docs/25-security-privacy-and-hipaa.md`: security architecture and production qualification
- `docs/26-audit-observability-and-operations.md`: audit, logs, metrics, jobs, and runbooks
- `docs/27-testing-and-ai-evaluation.md`: tests, adversarial evaluation, and human factors
- `docs/30-deployment-and-configuration.md`: environments, CI, configuration, and deployment gates
- `docs/31-risk-register.md`: product, clinical, security, legal, AI, and operational risks
- `docs/34-accessibility-and-content.md`: WCAG, plain language, chat, and comprehension
- `docs/35-definition-of-done.md`: feature, MVP, demo, and pilot gates
- `docs/36-data-retention-and-lifecycle.md`: configurable lifecycle and deletion design

## Demo and roadmap

- `docs/28-demo-seed-data-and-script.md`: synthetic story, five-minute script, and recovery plan
- `docs/29-implementation-plan.md`: vertical slices and two-builder work split
- `docs/32-future-roadmap.md`: prototype, pilot, integrations, and form library
- `docs/33-reference-sources.md`: official, technical, regulatory, and medical references
- `docs/37-glossary.md`: shared terminology

## Machine-readable contracts

- `schemas/form-template.schema.json`: form-template contract
- `schemas/ai-contracts.schema.json`: AI structured output definitions
- `schemas/workflow-event.schema.json`: workflow event contract
- `schemas/submission.schema.json`: top-level submission contract
- `schemas/README.md`: custom validation requirements

## Synthetic fixtures and examples

- `seed/demo-seed.json`: two tenants, users, patients, chart records, transcripts, and demo cases
- `seed/demo-conversation.md`: fixed patient, staff, and clinician text
- `seed/README.md`: fixture rules
- `examples/codex-first-prompt.md`: copy-ready first Codex task
