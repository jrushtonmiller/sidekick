# Firestore and Storage Layout

## Goal

Use paths that make tenant scoping obvious, support Security Rules, and keep high-volume records out of oversized documents.

## Recommended Firestore hierarchy

```text
organizations/{orgId}
  memberships/{userId}
  clinicianProfiles/{profileId}
  patients/{patientId}
    externalLinks/{linkId}
  formTemplateAvailability/{templateKey}
  submissions/{submissionId}
    fieldValues/{fieldId}
    evidence/{evidenceId}
    conversations/{messageId}
    conflicts/{conflictId}
    documents/{documentId}
    signatures/{signatureId}
    snapshots/{snapshotId}
    exports/{exportId}
    notes/{noteId}
  workItems/{workItemId}
  unsupportedFormRequests/{requestId}
  auditEvents/{eventId}
  clinicLinks/{linkId}
  retentionPolicies/{policyId}

platformFormTemplates/{templateKey_version}
platformTemplateAssets/{assetId}
```

Platform templates contain no patient data. Organization availability records point to approved platform versions.

## Why submissions use subcollections

A submission can accumulate many messages, evidence records, and audit-related objects. Subcollections avoid Firestore document-size limits and reduce unnecessary reads.

The parent submission stores summary and routing fields needed by queues:

```ts
interface SubmissionSummaryDocument {
  id: string;
  organizationId: string;
  patientId?: string;
  templateKey?: string;
  templateVersion?: string;
  status: SubmissionStatus;
  version: number;
  title: string;
  identityStatus: 'matched' | 'review' | 'unlinked';
  disposition?: StaffDisposition;
  appointmentAt?: Timestamp;
  availableAt?: Timestamp;
  assignedClinicianId?: string;
  staffWorkItemId?: string;
  clinicianWorkItemId?: string;
  patientSignatureValid: boolean;
  clinicianSignatureValid: boolean;
  requiredMissingCount: number;
  criticalIssueCount: number;
  warningCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Do not duplicate full form answers in the queue document.

## Membership document

Path:

```text
organizations/{orgId}/memberships/{userId}
```

Using user ID as document ID makes common authorization lookups deterministic.

```ts
interface MembershipDocument {
  userId: string;
  organizationId: string;
  role: 'patient' | 'staff' | 'clinician' | 'admin';
  status: 'active' | 'disabled' | 'invited';
  patientId?: string;
  clinicianProfileId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

A patient membership can point to a linked patient record. A patient with more than one clinic has a separate membership in each organization.

## Field values

Path:

```text
organizations/{orgId}/submissions/{submissionId}/fieldValues/{fieldId}
```

Use URL-safe field IDs. Dots are permitted in Firestore document IDs, but application code must not treat an ID as a nested object path accidentally.

Recommended write pattern:

- Client sends proposed value to server route.
- Server checks ownership and state.
- Server writes field value, evidence, version increment, and audit event in a transaction or coordinated operation.

## Evidence

Evidence documents are immutable. A field value stores selected evidence IDs.

Do not embed all transcript text inside a field value. Store exact excerpts in evidence and refer to protected source records.

## Conversations

Path:

```text
organizations/{orgId}/submissions/{submissionId}/conversations/{messageId}
```

Index by `createdAt`. Store original patient text. Store structured normalization as a separate AI run or evidence record.

## Work items

Keep work items at the organization level so queue queries do not need collection-group access.

```text
organizations/{orgId}/workItems/{workItemId}
```

Fields:

- `submissionId`
- `queue`
- `type`
- `status`
- `assigneeUserId`
- `availableAt`
- `appointmentAt`
- `priority`
- `createdAt`

Queue query always includes the organization path and `availableAt <= now` for clinician-ready work.

## Audit events

Organization-level audit path supports review across resources. Store `submissionId` when applicable.

Avoid putting raw before and after values in audit metadata. Store hashes and protected resource references.

## Platform templates and tenant availability

```text
platformFormTemplates/ca_dmv_reg195_0.1.0
organizations/{orgId}/formTemplateAvailability/ca_dmv_reg195
```

Availability record:

```ts
interface FormTemplateAvailability {
  templateKey: string;
  activeVersion: string;
  enabled: boolean;
  enabledAt?: Timestamp;
  disabledAt?: Timestamp;
  organizationOverrides?: {
    supportMessage?: string;
    staffPolicyId?: string;
  };
}
```

Do not copy and edit a platform template under every organization for the MVP. Organization-specific overrides must not change legal field meaning without a new reviewed template.

## Cloud Storage hierarchy

```text
organizations/{orgId}/submissions/{submissionId}/documents/{documentId}/original
organizations/{orgId}/submissions/{submissionId}/documents/{documentId}/pages/{page}.png
organizations/{orgId}/submissions/{submissionId}/documents/{documentId}/crops/{cropId}.png
organizations/{orgId}/submissions/{submissionId}/signatures/{signatureId}/mark.png
organizations/{orgId}/submissions/{submissionId}/exports/{exportId}/output.pdf
```

Use generated IDs. Put original display filename in protected metadata after redaction, not in the object path.

## Storage metadata

Allowlisted metadata:

- `organizationId`
- `submissionId`
- `documentId` or `exportId`
- `contentSha256`
- `synthetic`
- `createdByUserId`
- `createdAt`

Do not add patient name, DOB, diagnosis, form answer, or transcript text.

## Direct client access decision

Safest simple architecture:

- Client may upload to a server-authorized object path.
- All Firestore PHI reads and writes go through server APIs.
- Protected downloads go through server authorization.

This reduces Security Rules complexity. It also means the server must scale and enforce every access.

A more Firebase-native patient experience can allow direct, owner-scoped reads and draft writes, but requires rigorous Rules tests. Staff, clinician, admin, signature, workflow, and audit writes should remain server-only.

## Transactions and consistency

Use a transaction for transitions that touch:

- Submission state and version
- Work item
- Signature or snapshot
- Critical summary fields

Write the audit event within the same transaction when feasible. When a cross-service export follows, record an `export_pending` state and use an idempotent job.

## Indexes

Likely indexes:

```text
workItems: queue ASC, status ASC, availableAt ASC
workItems: assigneeUserId ASC, status ASC, availableAt ASC
submissions: patientId ASC, updatedAt DESC
submissions: status ASC, updatedAt ASC
unsupportedFormRequests: reviewStatus ASC, lastRequestedAt DESC
auditEvents: submissionId ASC, occurredAt ASC
```

Because each collection is already under an organization, `organizationId` need not be in every index, but retain it in documents for defense, export, and validation.

## Deletion

Delete subcollections explicitly. Firestore does not automatically remove subcollections when a parent document is deleted.

Use a server-side recursive deletion job that:

- Confirms tenant and lifecycle eligibility
- Deletes storage objects
- Deletes child collections
- Deletes parent record or leaves an approved tombstone
- Verifies completion

## Acceptance criteria

- Every protected path is organization scoped.
- Queue queries never scan all organizations.
- High-volume messages and evidence use subcollections.
- Storage paths contain generated IDs and no PHI.
- Signed snapshots and signatures are immutable.
- Recursive deletion accounts for subcollections and storage.
