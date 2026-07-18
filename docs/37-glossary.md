# Glossary

## Abridge transcript

A normalized transcript or related encounter content received through an Abridge integration adapter. In the hackathon it is synthetic fixture data.

## AI suggestion

A proposed value, question, issue, or summary produced by an AI capability. It is not a signed or verified value.

## Applicant section

Fields the person requesting the form completes and attests to.

## Appointment consideration

An AI- or rules-generated reason that staff may want to consider an appointment. Staff makes the disposition decision.

## Appointment work item

Clinician work associated with an appointment and hidden from the ready queue until `availableAt`.

## Attestation

Versioned text that a patient or clinician affirmatively accepts when signing a defined scope.

## Audit event

Append-only record of a security, access, or workflow action.

## Canonical value

The current value selected for a form field under the ownership and verification rules.

## Clinician-owned field

A field whose final value and verification belong to an authorized clinician. Patient, chart, transcript, upload, or AI can suggest evidence but cannot finalize it.

## Conflict

Two or more relevant sources differ in value, timing, terminology, or scope. Sidekick preserves the sources and requests human review.

## Deterministic demo mode

A mode using synthetic seed data, mock AI results, fixture OCR, and a fake clock so the demonstration works without external services.

## Evidence

A source item supporting or contextualizing a field value, such as a patient quote, uploaded document crop, chart record, or transcript segment.

## Field ownership

The role responsible for the final value: patient, staff, clinician, or system.

## Form instance or submission

One patient's workflow based on one exact form-template version.

## Form template

A versioned data definition containing sections, fields, ownership, patient questions, validation, conditions, and rendering targets for a blank form.

## Identity Platform tenant

An authentication partition offered by Google Cloud Identity Platform. It can supplement but does not replace Sidekick's organization and resource authorization.

## Immutable snapshot

A canonical, hashed record of fields and attestation in a signature scope at signing time.

## Minimum necessary

A privacy principle of limiting access, use, and disclosure to the information reasonably needed for a purpose.

## Organization

The top-level application tenant, normally a clinic or healthcare organization.

## Patient-confirmed value

A patient-owned value the patient actively reviewed or entered.

## Patient facts

Plain-language information collected from the patient that may inform clinician review but is not a clinician certification.

## PHI

Protected health information under HIPAA when held or transmitted by a covered entity or business associate in the applicable context.

## Provenance

The recorded source, date, excerpt, and location supporting a field or statement.

## Review-only work item

A clinician task that does not require an appointment and becomes available immediately after staff disposition.

## Signature invalidation

The process of marking a signature no longer valid because content in its signed scope changed.

## Source confidence

A label describing extraction, mapping, or attribution certainty. It is not a measure of medical truth.

## Staff disposition

The staff decision to route review-only, mark appointment required, return to patient, or use a manual process.

## Tenant scope

The organization boundary applied to identity, queries, storage, jobs, caches, AI context, and authorization.

## Unsupported form backlog

An admin view aggregating requests for forms that Sidekick does not yet support.

## Verification

An active human action confirming a value within the actor's authority. Clinician verification cannot be performed by AI.

## Work item

A queue record representing a staff or clinician task, availability time, assignment, and status.
