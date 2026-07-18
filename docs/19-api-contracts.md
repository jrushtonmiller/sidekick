# API Contracts

## API style

Use server-side route handlers or a small backend service with JSON request and response bodies. The same domain services should be callable from tests and background jobs.

Recommended base path:

```text
/api/v1
```

All protected requests require an authenticated session. Tenant and role scope are resolved on the server. Never trust an `organizationId`, role, patient ID, or clinician ID supplied by the browser without verifying it against the session and resource.

## Common response envelope

Success:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "version": 1
  }
}
```

Error:

```json
{
  "error": {
    "code": "SUBMISSION_VERSION_CONFLICT",
    "message": "This submission changed in another session. Refresh and try again.",
    "fieldErrors": []
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

Do not include raw model responses, stack traces, PHI, database paths, or vendor details in client errors.

## Concurrency

Every mutable submission has a numeric `version`. Mutating calls send `expectedVersion`.

If the stored version differs, return HTTP 409 with `SUBMISSION_VERSION_CONFLICT`. This prevents a stale AI result or open browser tab from overwriting a newer answer.

## Idempotency

Use an `Idempotency-Key` header for:

- Creating a submission
- Confirming an upload
- Patient signing
- Staff disposition
- Clinician signing
- PDF export request

Store key, actor, operation, request hash, and response reference for a limited period.

## Public tenant-resolution endpoints

### Resolve clinic link

```http
GET /api/v1/public/clinic-links/{token}
```

Response:

```json
{
  "data": {
    "organization": {
      "displayName": "Harbor Family Medicine",
      "slug": "harbor-family"
    },
    "intent": "start_form",
    "expiresAt": null
  }
}
```

The token is opaque and contains no PHI. Resolution does not expose internal organization IDs unless needed by the authenticated flow.

### Supported-form summary

```http
GET /api/v1/public/clinic-links/{token}/supported-forms
```

Return patient-friendly labels only. Do not expose internal prompts or template rules.

## Authentication and onboarding

Authentication is delegated to Firebase Authentication or Identity Platform. The application API creates or reads an organization membership after authentication.

### Complete patient onboarding

```http
POST /api/v1/patient/onboarding
```

```json
{
  "clinicLinkToken": "opaque-token",
  "identity": {
    "firstName": "Maya",
    "lastName": "Rivera",
    "dateOfBirth": "1967-08-14",
    "address": {
      "line1": "100 Demo Street",
      "city": "Oakland",
      "state": "CA",
      "postalCode": "94601"
    },
    "phone": "+15105550123"
  }
}
```

Response includes matching status. A multiple match returns a controlled `manual_review` state, not candidate details.

## Patient submission endpoints

### Create submission

```http
POST /api/v1/patient/submissions
```

```json
{
  "clinicLinkToken": "opaque-token",
  "entryMode": "describe_need",
  "initialDescription": "I need a disabled parking placard form."
}
```

`entryMode`:

- `describe_need`
- `upload_form`
- `choose_supported_form`

### List own submissions

```http
GET /api/v1/patient/submissions
```

Only return submissions owned by the authenticated patient membership.

### Get own submission

```http
GET /api/v1/patient/submissions/{submissionId}
```

Response is role-shaped. It excludes staff notes, clinician internal notes, and unrelated chart evidence.

### Select form

```http
POST /api/v1/patient/submissions/{submissionId}/form-selection
```

```json
{
  "templateKey": "ca_dmv_reg195",
  "expectedVersion": 2
}
```

The server verifies that the form is supported for the organization.

### Request next question

```http
POST /api/v1/patient/submissions/{submissionId}/interview/next
```

The server may use deterministic logic or the AI provider. It does not mutate answers.

### Submit answer

```http
POST /api/v1/patient/submissions/{submissionId}/interview/answers
```

```json
{
  "questionId": "q_functional_limit",
  "answer": "I have to stop after about half a block because of knee pain.",
  "expectedVersion": 5
}
```

The response includes normalized suggestions and whether clarification is required. Store the original answer.

### Update structured patient field

```http
PATCH /api/v1/patient/submissions/{submissionId}/fields/{fieldId}
```

Only patient-owned fields are mutable through this route.

### Review summary

```http
GET /api/v1/patient/submissions/{submissionId}/review
```

Includes:

- Patient-scope field groups
- Plain-language clinical facts collected from patient
- Items left for clinic review
- Attestation text and version
- Signature invalidation warning, when applicable

### Patient sign

```http
POST /api/v1/patient/submissions/{submissionId}/signatures/patient
```

```json
{
  "method": "typed",
  "signatureDisplay": "Maya Rivera",
  "attestationVersion": "patient-reg195-v1",
  "expectedVersion": 9,
  "idempotencyKey": "..."
}
```

The server creates a signed snapshot and transitions to `staff_review_pending`.

## Document endpoints

### Create upload session

```http
POST /api/v1/patient/submissions/{submissionId}/documents/upload-session
```

Response includes an authorized upload target and randomized document ID.

### Confirm upload

```http
POST /api/v1/patient/submissions/{submissionId}/documents/{documentId}/confirm
```

```json
{
  "expectedSize": 1048576,
  "sha256": "...",
  "expectedVersion": 1
}
```

### Get processing status

```http
GET /api/v1/patient/submissions/{submissionId}/documents/{documentId}/status
```

### Confirm extracted value

```http
POST /api/v1/patient/submissions/{submissionId}/documents/{documentId}/suggestions/{suggestionId}/confirm
```

The server confirms that the suggestion belongs to the patient and targets a patient-owned field.

## Staff endpoints

### Staff queue

```http
GET /api/v1/staff/work-items?status=open&type=staff_review
```

Allowed filters:

- status
- age bucket
- issue type
- assigned user
- template key

All queries are tenant-scoped server-side.

### Claim work item

```http
POST /api/v1/staff/work-items/{workItemId}/claim
```

Use optimistic concurrency to prevent double claim.

### Get staff review

```http
GET /api/v1/staff/submissions/{submissionId}
```

Includes applicant form, transcript, allowed chart evidence, completeness, conflicts, and appointment considerations.

### Add staff note

```http
POST /api/v1/staff/submissions/{submissionId}/notes
```

Staff notes are not patient-visible by default.

### Staff disposition

```http
POST /api/v1/staff/submissions/{submissionId}/disposition
```

```json
{
  "disposition": "appointment_required",
  "reasonCodes": ["new_or_changed_condition"],
  "appointmentAt": "2026-07-21T10:00:00-07:00",
  "assignedClinicianId": "clinician_demo_1",
  "expectedVersion": 12
}
```

Valid dispositions:

- `review_only`
- `appointment_required`
- `return_to_patient`
- `manual_process`

For `appointment_required`, `appointmentAt` is entered from a mock schedule for the MVP. The app does not book the appointment.

## Clinician endpoints

### Clinician queue

```http
GET /api/v1/clinician/work-items?status=open
```

The server returns only items where `availableAt <= now`, plus authorized direct links for an assigned appointment context.

### Get clinician review

```http
GET /api/v1/clinician/submissions/{submissionId}
```

Includes:

- Form fields
- Verification status
- Patient conversation
- Evidence records
- Conflicts
- Staff disposition
- Mock EMR summary
- Clinician signature readiness

### Verify clinician field

```http
POST /api/v1/clinician/submissions/{submissionId}/fields/{fieldId}/verify
```

```json
{
  "value": "Bilateral knee osteoarthritis causing substantial mobility limitation.",
  "selectedEvidenceIds": ["ev_patient_1", "ev_chart_3"],
  "expectedVersion": 14
}
```

Only clinician-owned fields are accepted.

### Resolve conflict

```http
POST /api/v1/clinician/submissions/{submissionId}/conflicts/{conflictId}/resolve
```

Requires a structured rationale code.

### Clinician sign

```http
POST /api/v1/clinician/submissions/{submissionId}/signatures/clinician
```

The server verifies:

- All required clinician fields are verified
- No critical unresolved conflicts remain
- Clinician profile and license data are present
- Patient signature is valid, when required
- Submission version matches

### Request export

```http
POST /api/v1/clinician/submissions/{submissionId}/exports
```

Response may return a completed artifact or a job ID.

### Download export

```http
GET /api/v1/clinician/submissions/{submissionId}/exports/{exportId}
```

Serve through authorization, not a public URL.

## Admin endpoints

### Supported templates

```http
GET /api/v1/admin/form-templates
PATCH /api/v1/admin/form-templates/{templateId}/availability
```

The MVP admin can enable or disable an existing template for an organization. It is not a visual form builder.

### Unsupported form backlog

```http
GET /api/v1/admin/unsupported-form-requests
PATCH /api/v1/admin/unsupported-form-requests/{requestId}
```

Do not expose uploaded patient forms in aggregate backlog views unless an authorized reviewer opens an individual request.

### Organization users

```http
GET /api/v1/admin/memberships
PATCH /api/v1/admin/memberships/{membershipId}
```

Only organization admins can manage organization membership. Platform administration is a separate future role.

## Evidence endpoint

```http
GET /api/v1/{role}/submissions/{submissionId}/evidence/{evidenceId}
```

Role-shaped response may include:

- Exact excerpt
- Source label
- Date
- Document page and image crop token
- Encounter or transcript context

The route authorizes the parent submission, not only the evidence ID.

## Audit and timeline

```http
GET /api/v1/{role}/submissions/{submissionId}/timeline
```

Patients see patient-appropriate events. Staff and clinicians see operational events. Raw security events are admin-only.

## Status codes

- 200 successful read or mutation
- 201 resource created
- 202 asynchronous job accepted
- 400 invalid request
- 401 unauthenticated
- 403 authenticated but not authorized
- 404 resource not found or hidden by tenant boundary
- 409 version or state conflict
- 413 upload too large
- 415 unsupported media type
- 422 domain validation failure
- 429 rate limited
- 500 controlled server failure
- 503 dependency unavailable

## Domain error codes

At minimum:

```text
AUTH_REQUIRED
FORBIDDEN
RESOURCE_NOT_FOUND
TENANT_SCOPE_VIOLATION
INVALID_WORKFLOW_TRANSITION
SUBMISSION_VERSION_CONFLICT
FIELD_NOT_EDITABLE_BY_ROLE
FIELD_VALIDATION_FAILED
SIGNATURE_NOT_READY
SIGNATURE_INVALIDATED
UNRESOLVED_CRITICAL_CONFLICT
DOCUMENT_REJECTED
DOCUMENT_PROCESSING_FAILED
FORM_UNSUPPORTED
PATIENT_MATCH_REVIEW_REQUIRED
AI_OUTPUT_REJECTED
DEPENDENCY_UNAVAILABLE
```

## Acceptance criteria

- Every route performs authentication, tenant scope, role, and resource checks.
- Client-supplied tenant IDs never determine access.
- Mutations use expected versions and audit events.
- Signing and disposition calls are idempotent.
- Responses are role-shaped and minimum necessary.
- Errors contain no PHI or vendor secrets.
- Cross-tenant tests return 404 or 403 without resource detail.
