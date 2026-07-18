# MVP Scope

## MVP objective

Demonstrate one reliable, understandable, end-to-end form workflow. The audience should see how Sidekick reduces repeated questioning and clinician administrative work while keeping people in control.

## In scope

### Patient

- Resolve clinic invitation
- Create account or use a seeded account
- Enter five demographic identifiers for patient matching
- Start a new form request
- Choose between upload and conversational selection
- Complete a REG 195 guided interview
- Save and resume
- Review extracted and entered values
- Sign an attestation
- View submission status

### Staff

- View a tenant-scoped queue
- Filter by status and issue count
- Open the patient conversation and source details
- Review completeness flags
- Review chart conflicts
- Decide "appointment required" or "review only"
- Enter an appointment date for demo purposes
- Route to the clinician

### Clinician

- View review-only and visit-today queues
- Open the rendered form
- View source badges and supporting excerpts
- View mock encounter transcript, diagnosis, medication, and result data
- Edit clinician-owned fields
- Verify provisional suggestions
- Sign and complete
- Export PDF

### Admin

- View supported templates
- Enable or disable a form for the organization
- View aggregated unsupported-form requests

### Platform

- Organization tenancy
- Role-based access
- Audit timeline
- Form templates stored as data
- Deterministic mock AI
- Optional live AI adapter
- PDF snapshot generation

## Explicitly out of scope

- App-store publishing
- Live patient portal or EMR integration
- Real Abridge API integration
- Automated appointment booking
- Text or email notifications
- Universal OCR form builder
- Autonomous clinical decisions
- Automated legal eligibility decisions
- Direct DMV submission
- Payment collection
- Production HIPAA certification
- Real patient data
- More than one polished form

## Stretch scope

- Upload a partially completed form and extract existing values
- Recognize a second supported form
- Add a second organization to the demo switcher
- Show a staff return-for-information state
- Add language preference and Spanish prompt fixture
- Display an aggregate "most requested unsupported forms" admin chart

## Scope guardrails

A feature should be deferred when it does not improve the five-minute demo path or demonstrate a reusable platform capability.

Do not build a visual form builder. The REG 195 template is authored by developers as JSON. A future admin authoring workflow can be described, but not implemented.

Do not build multiple independent AI agents that operate without orchestration. Use small, schema-validated AI tasks called by deterministic application code.

Do not create a general rules engine before the first form works. Implement reusable functions and a clear template schema, then generalize only what the second form proves necessary.
