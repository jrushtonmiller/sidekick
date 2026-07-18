# Data Retention and Lifecycle

## Status

The exact retention periods are an open organization and legal decision. The application must support configurable lifecycle policies rather than hard-coding one universal period.

This document defines the states and controls needed to implement a policy later.

## Data categories

- Account and membership
- Patient identity linkage
- Active submission
- Conversation
- Uploaded document
- Derived page image and OCR text
- EMR or transcript excerpt copy
- Provenance
- Work item
- Signature and immutable snapshot
- Exported PDF
- Audit event
- Operational log
- Product analytics
- Unsupported-form request

Each category can have a different retention basis and period.

## Lifecycle states

```ts
type LifecycleStatus =
  | 'active'
  | 'completed'
  | 'abandoned'
  | 'archived'
  | 'deletion_pending'
  | 'deleted'
  | 'legal_hold';
```

A workflow state such as `staff_review_pending` is separate from lifecycle status.

## Policy object

```ts
interface RetentionPolicy {
  id: string;
  organizationId: string;
  version: string;
  activeSubmissionDays: number;
  abandonedSubmissionDays: number;
  completedSubmissionDays: number;
  sourceDocumentDays: number;
  derivedArtifactDays: number;
  exportDays: number;
  operationalLogDays: number;
  auditEventDays: number;
  unsupportedRequestAggregationDays: number;
  effectiveAt: Timestamp;
}
```

The values require clinic, legal, regulatory, record-management, and contractual review.

## Data minimization

Before collecting or copying data:

- Confirm it is necessary for form preparation or review.
- Prefer references and excerpts over full chart duplication.
- Do not retain uploaded form pages for aggregate analytics.
- Do not retain full AI payloads by default.
- Do not collect a field merely because the official form has space for it when the selected branch does not require it.

## Active submission

While active:

- Retain answers, sources, and workflow history needed to complete the form.
- Preserve superseded values for audit and conflict review.
- Limit access by role and tenant.
- Mark last activity.

## Abandoned submission

A submission becomes abandoned after a configurable period without activity and no staff or clinician work.

Before deletion:

- Notify or surface status according to clinic policy.
- Ensure no legal hold.
- Ensure no completed signature or record-retention requirement applies.
- Remove active work items.

The hackathon can implement a manual reset only.

## Completed submission

A completed submission may become part of the clinic's designated record set or other medical or administrative record, depending on policy and integration. Determine whether Sidekick is the system of record or a processor that transfers the final document to the EMR.

Preferred future pattern:

1. Export final signed form.
2. Write or transfer approved record to the clinic system.
3. Confirm receipt.
4. Retain Sidekick copy according to contract and policy.
5. Delete transient OCR and derived artifacts earlier when allowed.

## Signatures and snapshots

Signed snapshots need integrity and traceability. A retention or deletion decision must account for:

- Legal record requirements
- Form issuer requirements
- Clinic policy
- Dispute and audit needs
- Contractual obligations

Never delete a signed snapshot while leaving an export that claims to derive from it unless policy explicitly handles the relationship.

## Derived artifacts

Potentially shorter-lived:

- Page thumbnails
- Temporary rendered images
- OCR intermediate output
- Model input package
- Model response cache
- Temporary export files

Delete after the canonical evidence or final artifact is safely stored, when policy permits.

## Audit events

HIPAA documentation requirements can apply to specific policies and actions for six years, but that does not mean every application event or every medical record has one universal six-year rule. Define audit retention with legal and compliance review.

Separate:

- Security and access audit
- Workflow timeline
- Required HIPAA documentation
- Medical-record retention under state and clinic rules

## Patient requests and rights

Production operations may need to support:

- Access to records
- Correction or amendment requests
- Restrictions and communication preferences where applicable
- Accounting or disclosure processes where applicable
- Deletion requests under other privacy laws, subject to health-record obligations

The clinic determines the authoritative response process. Sidekick must be able to locate, export, correct through append-only history, and delete data when law and policy permit.

## Correction versus deletion

For signed or audited data:

- Preserve original value.
- Add a corrected value and reason.
- Invalidate signatures when scope changes.
- Create a new snapshot.
- Do not rewrite history.

For transient, unsent drafts, full deletion may be appropriate under policy.

## Deletion job

```text
identify eligible resource
  -> verify tenant policy version
  -> check legal hold
  -> check active work and integration receipt
  -> create deletion tombstone
  -> delete derived files
  -> delete protected source files
  -> delete or de-identify database records as policy requires
  -> verify storage absence
  -> record completion event without deleted PHI
```

Deletion is idempotent and retryable.

## Legal hold

A legal or investigation hold blocks automated deletion. Only authorized users can apply or release it. The action is audited.

## Unsupported-form analytics

Aggregate backlog can retain:

- Normalized issuer
- Normalized title
- Nonidentifying fingerprint
- Count
- Dates

Remove patient identity and document content when no longer needed for an individual request.

## AI data lifecycle

The application must document:

- What is sent
- Whether provider state is stored
- Abuse-monitoring retention
- Eligibility for modified or zero retention
- How application copies are retained
- How deletion requests are propagated when applicable

Do not assume `store: false` controls all provider logs or every endpoint. Verify current vendor documentation and contracts.

## Backups

Deletion policy must address backups:

- Backup retention
- Restoration behavior
- Reapplication of deletion tombstones after restore
- Access controls
- Expiration

A restored environment must not permanently resurrect data scheduled for deletion.

## Demo cleanup

After the hackathon:

- Delete any accidental real data immediately through the incident process.
- Remove public demo links.
- Revoke demo credentials and tokens.
- Delete synthetic projects when no longer needed.
- Preserve source code and non-PHI documentation.
- Remove screenshots or recordings that accidentally contain sensitive account information.

## Acceptance criteria

- Data categories have configurable lifecycle treatment.
- Deletion checks legal hold and signed-record relationships.
- Derived artifacts can expire earlier than canonical records.
- Deletion is verified across database and storage.
- Restore procedures reapply deletion decisions.
- Vendor AI retention is documented rather than assumed.
- Final production periods are approved before PHI use.
