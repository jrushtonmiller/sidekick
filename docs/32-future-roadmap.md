# Future Roadmap

## Guiding rule

Expand only after the DMV workflow is stable, measurable, and safe. New features should reuse the existing template, provenance, workflow, and signature architecture.

## Stage 1: hackathon MVP

- One clinic story
- Two logical tenants
- REG 195 assumption
- Patient description and guided interview
- Save and resume
- Patient review and demo signature
- Staff review and appointment disposition
- Delayed clinician queue for appointments
- Source-linked clinician review
- Clinician verification and demo signature
- Review-packet or PDF export
- Deterministic mock AI
- Synthetic EMR and transcript fixtures

## Stage 2: stronger prototype

- Live upload and OCR
- Live structured AI provider
- Polished official PDF overlay
- Unsupported form backlog
- Return-to-patient flow
- Patient completed-document download
- Additional synthetic scenarios
- Accessibility and mobile testing
- Basic operational dashboard

## Stage 3: pilot preparation

- Confirm first clinic and exact forms
- Execute vendor and BAA review
- Security risk analysis
- Production identity design
- MFA for workforce
- Patient portal federation
- Formal patient matching rules
- Production audit and logging controls
- Retention and deletion jobs
- Backup and restore
- Penetration test
- Clinical, legal, and operational review
- Limited synthetic-to-test-data validation

Do not use live PHI until the environment and processes are approved.

## Stage 4: first clinical pilot

Suggested narrow pilot:

- One organization
- One or two forms
- Small clinician group
- Human review of every output
- No automatic submission to external agencies
- Daily operational monitoring
- Weekly safety and quality review
- Defined pause criteria

Measure:

- Patient completion
- Staff time
- Clinician review time
- Correction rate
- Appointment routing
- Signature invalidation
- Unsupported forms
- Safety issues
- User comprehension

## Stage 5: form library

Candidate additions:

- EDD disability forms
- FMLA forms
- Employer medical certification
- School accommodation forms
- Insurance prior-authorization support forms
- Utility medical-baseline forms

Each new form requires:

1. Official-source review
2. Ownership mapping
3. Patient-language questions
4. Clinical and legal boundaries
5. Conditional rules
6. PDF mapping
7. Signature acceptance review
8. Evaluation fixtures
9. Versioning and retirement plan

Do not create a general-purpose form builder until template authoring has repeated enough to justify it.

## Stage 6: EMR integration

### Read integration

- Patient demographics
- Encounters
- Conditions
- Observations
- Medications
- Documents
- Practitioner profile

Potential FHIR resources:

- Patient
- Encounter
- Condition
- Observation
- MedicationRequest
- DocumentReference
- Practitioner
- PractitionerRole
- Provenance

### Write-back

Future, after governance:

- Completed form document reference
- Workflow status
- Staff or clinician note

Write-back requires strong idempotency, reconciliation, and clinic policy. It is not required for early value.

## Stage 7: Abridge integration

- Authorized encounter transcript retrieval
- Exact segment provenance
- Encounter summary import
- Relevant excerpt search
- User controls over transcript scope
- Retention alignment

Avoid duplicating the full transcript when a secure reference or minimum necessary excerpt is sufficient.

## Stage 8: scheduling and notifications

- Appointment request
- Scheduling integration
- Appointment confirmation
- Patient reminders
- Return-to-patient notifications
- Staff escalation
- Clinician due reminders

Channels require consent, content minimization, and vendor review. SMS and email should not contain unnecessary PHI.

## Stage 9: organization management

- Organization-specific form catalog
- Clinic policy rules
- Queue assignment rules
- Multiple locations
- Department scopes
- Delegated admins
- Clinician coverage
- Service-level targets
- Tenant-specific branding and languages

## Stage 10: template authoring tools

Only after several forms:

- Blank form upload
- OCR-drafted field schema
- Coordinate calibration UI
- Ownership assignment
- Patient question drafting
- Validation and rule editor
- Version comparison
- Clinical and legal approval workflow
- Test fixture generation
- Publish and retire controls

AI drafts, humans approve. Publishing is never automatic.

## Stage 11: multilingual experience

- Translate interface and template questions
- Preserve source language
- Qualified human review
- Medical and legal terminology review
- Language-specific readability and usability testing
- Interpreter workflow where appropriate

Do not rely on direct model translation alone for signed attestations or clinical certification language.

## Stage 12: analytics and quality

- Funnel and queue metrics
- Correction patterns
- Form-field difficulty
- AI quality by model and prompt version
- Fairness evaluation across representative groups
- Patient comprehension
- Clinician over-reliance indicators
- Operational outcomes

Use de-identified or properly governed data. Aggregate metrics must not become a route to re-identification.

## Stage 13: platform hardening

- Regional deployment
- Customer-managed encryption keys where required
- Advanced identity federation
- Fine-grained access policy
- Support-access approval workflow
- Immutable audit export
- Business continuity
- Disaster recovery exercises
- Subprocessor monitoring
- Security certifications as appropriate

## Product expansion principles

- Preserve human authority at signatures and clinical decisions.
- Keep forms data-driven and versioned.
- Make sources inspectable.
- Do not hide disagreements.
- Measure burden reduction and safety together.
- Add automation only after observing the manual workflow.
- Keep graceful manual paths.

## Acceptance criteria

- Roadmap separates demo, prototype, pilot, and production.
- Every new form follows an approval and evaluation process.
- EMR, Abridge, scheduling, and notifications remain adapter-based.
- No roadmap item bypasses clinician verification or tenant isolation.
