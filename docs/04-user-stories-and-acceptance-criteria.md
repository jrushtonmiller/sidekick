# User Stories and Acceptance Criteria

## Patient invitation

**Story:** As a patient, I can open a clinic link and know which clinic I am working with.

**Acceptance criteria:**

- The invitation contains no PHI.
- The server resolves it to one active organization.
- Expired or invalid invitations show a safe error.
- The selected organization is displayed before registration.
- A submission created from the invitation stores that organization ID.

## Patient matching

**Story:** As a patient, I can link my new account to the correct mock chart without seeing other patients.

**Acceptance criteria:**

- The form asks for first name, last name, date of birth, address, and phone.
- Values are normalized server-side.
- Only one exact, unique five-field match is auto-linked in the demo.
- Ambiguous or incomplete matches do not expose candidate data.
- An ambiguous match creates a staff identity-review flag.
- No EMR information is shown until identity linking succeeds.

## Form selection by conversation

**Story:** As a patient who does not know the form name, I can describe the request.

**Acceptance criteria:**

- The assistant searches only templates enabled for the organization.
- It may ask clarifying questions.
- It never invents a supported form.
- Low-confidence classification is displayed as uncertainty.
- Unsupported requests produce a clear next step and a backlog event.

## Form upload

**Story:** As a patient with a paper or partially completed form, I can upload it.

**Acceptance criteria:**

- Supported file type and size are checked before processing.
- Malware scanning is represented by an interface, even if mocked.
- OCR output is stored separately from confirmed values.
- The system identifies the template or marks it unsupported.
- Existing values are shown for confirmation.
- The assistant asks only missing or unclear questions.

## Patient interview

**Story:** As a patient, I can answer form questions in language I understand.

**Acceptance criteria:**

- One question or closely related group appears at a time.
- Questions avoid unexplained clinical jargon.
- The patient can say "I don't know."
- Exact patient wording is preserved.
- Normalized answers are separate from raw messages.
- A patient answer never finalizes a clinician-owned certification.
- Progress saves after every accepted answer.

## Patient review and signature

**Story:** As a patient, I can review what will be attributed to me before signing.

**Acceptance criteria:**

- Patient-owned fields appear in a plain-language summary.
- The form preview is available.
- Source labels distinguish patient entry from extracted document data.
- The patient can correct patient-owned fields before signing.
- The attestation text and version are displayed.
- Signature creates an immutable patient snapshot.
- Later changes to patient-owned signed fields invalidate the signature.

## Staff review

**Story:** As staff, I can quickly decide what happens next.

**Acceptance criteria:**

- Queue shows organization-scoped submissions only.
- Each row shows status, age, form, issue count, and appointment suggestion.
- Detail page shows missing, conflicting, and low-confidence fields.
- Staff can choose appointment required or review only.
- The system records who made the decision and when.
- AI suggestion is visible as advisory, not authoritative.

## Date-gated clinician queue

**Story:** As a clinician, I am not interrupted by appointment work before it is relevant.

**Acceptance criteria:**

- Review-only cases have `availableAt` set immediately.
- Appointment cases have `availableAt` set to the appointment date/time.
- Standard clinician queue queries exclude future items.
- A separate future-work view may display them without counting them as active.
- Time-zone conversion is tested.

## Clinician source review

**Story:** As a clinician, I can understand why a field was populated.

**Acceptance criteria:**

- Every suggested field has at least one provenance record.
- Clicking or hovering opens the exact supporting excerpt and source type.
- Patient and chart conflicts are displayed together.
- The UI does not imply that confidence equals clinical truth.
- Clinician confirmation changes verification status to `clinician_verified`.

## Clinician signature and export

**Story:** As a clinician, I can verify, sign, and export a completed form.

**Acceptance criteria:**

- Required clinician fields are validated.
- All unresolved critical conflicts require acknowledgement.
- Signature scope and attestation text are shown.
- The signed snapshot is immutable.
- PDF export references the signed snapshot ID.
- Export is idempotent and auditable.
- The UI states that recipient acceptance requirements must be confirmed for production.
