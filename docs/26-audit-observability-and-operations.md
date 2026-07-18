# Audit, Observability, and Operations

## Three distinct records

Do not confuse:

1. Audit trail: who accessed or changed a protected resource and what workflow action occurred
2. Application logs: technical events used to operate the service
3. Product analytics: aggregate use and funnel behavior

They have different access, content, and retention rules.

## Audit trail goals

The audit trail should support:

- Reconstruction of a submission lifecycle
- Investigation of access and changes
- Signature integrity
- Tenant administration review
- Incident response
- Compliance evidence, when applicable

Audit events are append-only. Corrections create new events rather than editing history.

## Audit event model

```ts
interface AuditEvent {
  id: string;
  organizationId: string;
  actor: {
    userId?: string;
    role: 'patient' | 'staff' | 'clinician' | 'admin' | 'system';
    service?: string;
  };
  action: string;
  resourceType: string;
  resourceId: string;
  submissionId?: string;
  occurredAt: Timestamp;
  requestId: string;
  outcome: 'success' | 'denied' | 'failure';
  beforeHash?: string;
  afterHash?: string;
  reasonCode?: string;
  metadata: Record<string, string | number | boolean | null>;
}
```

Avoid raw PHI in metadata. A protected UI can resolve resource IDs after authorization.

## Required audit actions

### Identity and access

- Sign-in success and high-risk failure summary
- Sign-out
- Membership created, changed, disabled
- Role changed
- Session revoked
- Manual patient match linked or rejected

### Submission lifecycle

- Submission created
- Form identified or selected
- Template version bound
- Upload created, replaced, rejected, or deleted
- Patient answer added or changed
- Patient review opened
- Patient signed or signature invalidated
- Staff claimed or released
- Staff disposition selected
- Appointment date recorded or changed
- Clinician field verified or changed
- Conflict resolved
- Clinician signed or signature invalidated
- Export created or downloaded
- Submission completed, archived, or deleted

### Security

- Authorization denied
- Cross-tenant attempt
- Rate limit triggered
- Malicious upload detected
- AI output rejected by schema or policy
- Prompt-injection detection event
- Administrative export or support access

Do not create so many read events that the audit store becomes unusable. For PHI views, record meaningful access events or session-level access according to policy.

## Timeline view

The user-facing timeline is derived from audit events, but role-shaped:

Patient sees:

- Started
- Saved
- Signed
- Sent to staff
- Appointment needed
- Sent to clinician
- Completed

Staff and clinicians see operational transitions. Admin sees authorized organization events. Security personnel use a separate protected view.

## Application logging

Use structured JSON logs:

```json
{
  "severity": "INFO",
  "service": "sidekick-api",
  "event": "submission_transition",
  "requestId": "req_123",
  "organizationId": "org_demo_a",
  "actorId": "usr_123",
  "submissionId": "sub_123",
  "from": "staff_review_pending",
  "to": "clinician_review_pending",
  "latencyMs": 48
}
```

In production, consider pseudonymous or hashed identifiers in general logs while retaining protected audit records separately.

## Error reporting

Exceptions sent to an error tracker must be scrubbed.

Prohibit:

- Request body capture on PHI routes
- AI prompt and response capture
- Form values in breadcrumbs
- Transcript text in exception messages
- Uploaded filenames
- Authorization headers

Use controlled error codes and request IDs.

## Metrics

### Reliability

- API success rate
- P50, P95, and P99 latency
- Error rate by endpoint
- Document-processing duration
- AI schema-rejection rate
- Export success rate
- Queue age
- Dependency availability

### Workflow

- Patient completion rate
- Median patient completion time
- Staff review age
- Time to disposition
- Clinician review age
- Time to signature
- Review-only versus appointment rate
- Return-to-patient rate
- Unsupported-form rate

### Quality

- Missing required field rate
- OCR confirmation correction rate
- Conflict rate
- Signature invalidation rate
- AI next-question accuracy on evaluation fixtures
- Clinician edit rate by suggested field

Do not interpret clinician edit rate alone as model error. Edits may reflect style, updated information, or clinical judgment.

## Alerts

P0 production-oriented alerts:

- Cross-tenant authorization failure spike
- Repeated export or download failures
- Document-processing backlog
- AI output rejection spike
- Queue items older than threshold
- Storage or database access errors
- Authentication abuse spike
- Signature hash mismatch

Alert names and payloads must not contain PHI.

## Tracing

Propagate `requestId` and trace context across:

- Web request
- Domain service
- Firestore operation
- Document job
- AI call
- Export job

Do not attach protected payloads to trace spans.

## Background jobs

Jobs should be:

- Idempotent
- Tenant-scoped
- Version-aware
- Retry limited
- Dead-lettered after repeated failure
- Audited on state change

Job payload contains resource IDs, not full patient content. The worker reloads and authorizes the current resource.

## Operational runbooks

Create runbooks for:

- AI provider outage
- OCR failure backlog
- Export rendering failure
- Authentication outage
- Incorrect template revision
- Cross-tenant security alert
- Signature integrity failure
- Accidental data exposure
- Storage deletion failure
- Demo reset failure

Each runbook lists detection, containment, user impact, recovery, and escalation owner.

## Backup and recovery

Before production:

- Define recovery point and recovery time objectives.
- Back up database and protected storage as required.
- Encrypt backups.
- Test restore to an isolated environment.
- Verify tenant and authorization controls after restore.
- Keep audit evidence for backup operations.
- Include template versions and signing snapshots in recovery scope.

The hackathon can document this without implementing full backup automation.

## Data reconciliation

A periodic consistency job can identify:

- Work item without submission
- Submission state without matching work item
- Signature pointing to missing snapshot
- Export pointing to wrong snapshot
- Orphaned document
- Missing tenant ID
- Future clinician work visible too early

The job reports issues. It should not auto-repair signed records without a reviewed procedure.

## Demo observability

Provide a developer panel gated by `DEMO_MODE` that shows:

- Current workflow state
- Mock AI calls
- Queue routing
- `availableAt`
- Signature snapshot IDs
- Export status

Do not show this panel to judges unless it helps answer a technical question.

## Acceptance criteria

- Audit events are append-only and tenant-scoped.
- Protected values are absent from normal logs and analytics.
- Every signature and workflow transition has an audit event.
- Background jobs are idempotent and reload current state.
- Alerts contain no PHI.
- A submission timeline can be reconstructed from audit data.
- Demo mode exposes enough diagnostics to recover quickly without compromising the main UI.
