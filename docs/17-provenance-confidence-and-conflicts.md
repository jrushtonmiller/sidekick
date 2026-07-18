# Provenance, Confidence, and Conflicts

## Core principle

Every meaningful field must answer three questions:

1. What is the current value?
2. Who or what supplied it?
3. Who has confirmed or verified it?

A source is not the same as an approver. A value extracted from the chart may be well attributed but still need clinician verification for the current form.

## Provenance model

Each evidence item is immutable:

```ts
interface EvidenceItem {
  id: string;
  organizationId: string;
  submissionId: string;
  fieldId?: string;
  sourceType: SourceType;
  sourceRef: string;
  sourceLabel: string;
  observedAt?: string;
  exactExcerpt?: string;
  structuredValue?: unknown;
  page?: number;
  boundingBox?: NormalizedBoundingBox;
  createdAt: Timestamp;
}
```

Recommended source types:

- `patient_chat`
- `patient_direct_entry`
- `uploaded_document`
- `emr_demographics`
- `emr_condition`
- `emr_observation`
- `emr_medication`
- `encounter_note`
- `encounter_transcript`
- `staff_entry`
- `clinician_entry`
- `system_derived`

## Evidence display labels

Use clear labels, not internal codes:

- Patient said
- Entered by patient
- Read from uploaded form
- From clinic demographics
- From problem list
- From test result
- From visit transcript
- Entered by staff
- Entered by clinician
- Calculated by Sidekick

## Confidence definitions

Do not use a single universal numeric confidence. Separate concepts:

### Extraction confidence

How confidently text or a mark was read from a document.

### Mapping confidence

How confidently the extracted text maps to a particular field.

### Attribution confidence

How confidently a displayed claim is supported by the cited source excerpt.

### Verification status

Who has actively confirmed the value.

```ts
type VerificationStatus =
  | 'unreviewed_suggestion'
  | 'patient_confirmed'
  | 'staff_reviewed'
  | 'clinician_verified'
  | 'not_applicable';
```

Confidence is not medical correctness, clinical validity, eligibility, or truth.

## Suggested confidence bands

Use labels that reviewers can understand:

- High: direct, clear extraction or exact structured mapping
- Medium: plausible mapping with some ambiguity
- Low: uncertain extraction, indirect statement, or incomplete context

Avoid displaying false precision such as 87 percent unless the score has been calibrated for the exact task and users understand it.

## Canonical value selection

A field may have several candidate values. Store them separately and select one canonical value for the current workflow.

Rules:

- Patient-owned fields use the value confirmed by the patient.
- Staff-owned fields use the value entered or approved by staff.
- Clinician-owned fields use the value explicitly verified by the clinician.
- System fields use deterministic logic.
- AI may propose a candidate but may not set a verified canonical value.

## Conflict types

### Direct value difference

Example:

- Patient: symptoms began in June
- Chart: onset documented in March

### Newer patient information

Example:

- Chart: no mobility aid at last visit
- Patient: now using a walker

This may be new information rather than an error. Preserve both dates and sources.

### Terminology difference

Example:

- Patient: arthritis in both knees
- Chart: bilateral knee osteoarthritis

This may be semantically consistent. The AI may label it as likely aligned, but a clinician-owned field still requires clinician verification.

### Scope difference

Example:

- Patient describes current walking limitation
- Old chart note describes a different episode

### Missing corroboration

A patient statement has no related chart item. This is not automatically a conflict.

### Internal chart conflict

Two chart sources disagree. Do not assume the most recent is always correct, but make dates visible.

## Conflict object

```ts
interface ConflictRecord {
  id: string;
  organizationId: string;
  submissionId: string;
  fieldId: string;
  evidenceIds: string[];
  type:
    | 'direct_value_difference'
    | 'newer_patient_information'
    | 'terminology_difference'
    | 'scope_difference'
    | 'chart_internal_difference'
    | 'ambiguous';
  severity: 'info' | 'warning' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved';
  summary: string;
  resolution?: {
    selectedEvidenceIds: string[];
    rationaleCode: string;
    note?: string;
    resolvedBy: ActorRef;
    resolvedAt: Timestamp;
  };
}
```

## Patient-versus-chart policy

The agreed product behavior is:

- Preserve the patient's current statement.
- Display it on the form when it belongs to a patient-owned field.
- Flag material differences from chart data.
- Do not silently replace the patient statement with chart data.
- Let staff and clinician inspect both.

For clinician-owned fields, patient statements remain evidence. The clinician chooses the final value.

## UI behavior

### Field badge

Each populated field displays one compact source badge and one status badge.

Examples:

- `Patient said` + `Patient confirmed`
- `Uploaded form` + `Needs confirmation`
- `Chart` + `Needs clinician verification`
- `Clinician` + `Verified`

### Evidence popover or drawer

On hover, focus, or tap, show:

- Source label
- Date
- Exact excerpt
- Document page or encounter link
- Confidence label
- Conflict note

A hover-only control is not accessible on touch devices. Implement a clickable info control with keyboard focus. Hover may be an enhancement.

### Conflict display

Show both values side by side, with dates and source labels. Do not make the AI-preferred value visually dominant.

## Signature interaction

At signing time, freeze the selected evidence links and values in a snapshot.

When a signed-scope value changes:

- Mark the signature invalid.
- Preserve the old signed snapshot.
- Explain which fields changed.
- Require a new review and signature.

Adding a non-signed internal note does not invalidate the signature.

## Conflict resolution reasons

Use structured reason codes to support auditability:

- `patient_reports_new_information`
- `chart_is_more_current`
- `patient_corrected_entry`
- `document_extraction_error`
- `clinician_clarified_diagnosis`
- `administrative_correction`
- `not_material_to_form`
- `other_with_note`

Do not offer a generic "AI was right" reason.

## Completeness versus confidence

A field can be complete but low confidence, and it can be high-confidence but incomplete for the form's purpose.

Track separately:

- Presence
- Format validity
- Confirmation status
- Source confidence
- Conflict status
- Ownership verification

## Acceptance criteria

- Every AI- or OCR-populated value has at least one evidence reference.
- Exact excerpts are available for document, transcript, and free-text sources.
- Patient statements are not overwritten by conflicting chart data.
- Clinician-owned values cannot become verified without clinician action.
- Confidence labels never claim medical truth.
- Conflicts show both sources and dates.
- Signature snapshots preserve the evidence that supported signed values.
- Source controls work with mouse, keyboard, and touch.
