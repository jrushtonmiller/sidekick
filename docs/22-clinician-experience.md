# Clinician Experience Specification

## Purpose

The clinician workspace should minimize review time while preserving active clinical judgment. It presents a near-complete form, makes every source inspectable, highlights unresolved items, and requires the clinician to verify clinician-owned content before signing.

The interface should not encourage blind acceptance of AI suggestions.

## Queue

Recommended routes:

```text
/clinician/queue
/clinician/submissions/{id}
/clinician/submissions/{id}/evidence/{evidenceId}
/clinician/submissions/{id}/timeline
```

Queue fields:

- Available since
- Patient
- Form
- Work type: review only or appointment
- Appointment time, when applicable
- Unresolved issue count
- Staff handoff
- Assignee
- Status

Only show items where `availableAt <= now`, except a direct authorized appointment-context route.

## Queue sections

- Ready for review
- Today's appointments
- In progress
- Returned to staff

Do not mix future appointment work into the main ready queue.

## Review workspace

### Header

- Patient name
- Date of birth
- Masked MRN
- Form and revision
- Staff disposition
- Appointment time, when relevant
- Last chart synchronization
- Signature readiness

### Main content

Recommended desktop layout:

1. Form and editable clinician fields
2. Evidence drawer or side panel
3. Unresolved tasks and signature controls

The form remains the central artifact. Do not force the clinician to read the full chat before seeing the form.

## Field presentation

Each field shows:

- Current value
- Final owner
- Verification status
- Source badge
- Conflict badge
- Info control

Clinician-owned field states:

- Missing
- AI or source suggested
- Edited by clinician
- Verified by clinician

A "Verify all" action is prohibited for the MVP. Each meaningful clinician-owned field requires active verification or entry. Small groups may be verified together only when their shared scope is explicit and reviewed.

## Source inspection

Opening a source control shows:

- Exact patient quote, chart text, transcript segment, or document crop
- Source type
- Date
- Extraction or attribution confidence
- Link to wider context when authorized

For a mixed-source suggestion, display each source separately.

## Conflict handling

When patient and chart differ:

- Show both values and dates.
- Preserve the patient statement.
- Do not silently preselect the chart.
- Ask the clinician to choose or enter the final clinician-owned value where necessary.
- Require a conflict-resolution reason for material conflicts.

For a patient-owned field, clinician view may acknowledge the discrepancy without editing the patient statement.

## Conversation and transcript

Provide tabs or drawers:

- Patient conversation with Sidekick
- Recent encounter transcript
- Chart evidence
- Uploaded form

Deep links from a field should open the relevant excerpt, not the top of a long transcript.

## Mock EMR panel

Show a focused record:

- Recent visits
- Relevant conditions
- Relevant observations or results
- Medications when material
- Provider notes or transcript links

Allow manual expansion. Avoid displaying unrelated history by default.

## Clinician edits

Clinician can edit:

- Clinician-owned form fields
- Provider profile fields allowed by policy
- Clinician internal note
- Conflict resolution

Clinician cannot edit:

- Patient signature
- Audit history
- Tenant identifiers
- Another clinician's identity
- Patient-owned signed value without a formal correction workflow

## Certification safety

For REG 195:

- Patient facts may be pre-collected.
- AI may summarize those facts.
- AI must not choose the qualifying certification category.
- No certification option is selected by default.
- The clinician must actively select the applicable statement or determine that the form cannot be certified.

Include a clear label:

> Patient-reported and chart-derived information. Clinician verification required.

## Unable to sign

Support alternatives:

- Return to staff for missing administrative information
- Mark appointment required, when clinic workflow permits reconsideration
- Decline or unable to certify, with reason
- Save and resume

A decline should not delete patient data or imply wrongdoing.

## Signature readiness checklist

Deterministic checklist:

- Correct patient and form confirmed
- Patient signature valid, when required
- All required clinician-owned fields verified
- Provider identity and license information present
- Required date or duration fields valid
- No critical unresolved conflicts
- Official-form signature limitation acknowledged
- Preview generated successfully

The signature button is disabled until readiness passes.

## Clinician signature

Capture:

- Authenticated clinician ID
- Signature method
- Attestation text and version
- Template version
- Signed field snapshot hash
- Timestamp
- Request ID

Require recent authentication for production. A demo mode may use a clearly labeled demo signature.

## Post-sign state

After signing:

- Create immutable clinician snapshot.
- Transition to `completed` or `export_pending`.
- Generate export.
- Show completion timeline.
- Prevent silent edits.

Any change to a signed-scope value invalidates the signature and returns to clinician review.

## PDF preview

Before signing, clinician can preview the final output. Highlight:

- Fields that may shrink due to length
- Missing rendering mappings
- Signature requirement caveat
- Demo watermark, when applicable

Do not let PDF layout errors change canonical data.

## Time-saving design

Good shortcuts:

- Jump to next unresolved field
- Open exact evidence in one action
- Reuse verified clinician profile information
- Preserve draft edits
- Keyboard navigation
- Concise staff handoff

Unsafe shortcuts:

- Preselected clinical certification
- Automatic signature
- One-click accept all AI fields
- Hidden conflicts
- Defaulting to the chart without review

## Acceptance criteria

- Future appointment cases do not appear before `availableAt`.
- Clinician sees the filled form first, with source and status badges.
- Exact patient, chart, transcript, and document evidence is inspectable.
- No clinician certification is preselected by AI.
- Clinician verifies every required clinician-owned field.
- Unresolved critical conflicts block signing.
- Signing creates an immutable snapshot and audit event.
- A signed-field change invalidates the signature.
- Export is generated from the signed snapshot, not live mutable state.
