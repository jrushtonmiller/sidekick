# Multi-Tenancy

## Tenant definition

An organization is the top-level tenant. A tenant represents one clinic or health-care organization.

Every protected resource includes `organizationId`, and tenant-owned Firestore paths are nested beneath the organization:

```text
organizations/{organizationId}/...
```

## Invitation binding

A QR code or hyperlink contains an opaque invitation token:

```text
https://sidekick.example/join/{token}
```

The token resolves server-side to:

```ts
{
  organizationId: string;
  purpose: 'patient_join';
  expiresAt: Timestamp;
  status: 'active' | 'used' | 'revoked';
}
```

The token must not include a patient name, medical record number, form name, diagnosis, or other PHI.

## MVP membership model

```ts
interface Membership {
  userId: string;
  organizationId: string;
  role: 'patient' | 'staff' | 'clinician' | 'admin';
  status: 'active' | 'invited' | 'disabled';
  createdAt: string;
}
```

A staff or clinician account belongs to one organization in the demo. A patient submission is bound to one organization, even if the future account can have several memberships.

## Tenant context

Every server operation begins by creating a trusted context from the verified auth token and membership record:

```ts
interface TenantContext {
  userId: string;
  organizationId: string;
  role: Role;
  membershipId: string;
}
```

Do not accept `organizationId` from the client as proof of access. A route may include it for navigation, but the server must compare it with the trusted membership.

## Firestore path strategy

Recommended:

```text
organizations/{orgId}
organizations/{orgId}/memberships/{userId}
organizations/{orgId}/patients/{patientId}
organizations/{orgId}/formTemplates/{templateId}
organizations/{orgId}/submissions/{submissionId}
organizations/{orgId}/workItems/{workItemId}
organizations/{orgId}/unsupportedFormRequests/{requestId}
organizations/{orgId}/auditEvents/{eventId}
```

Submissions may use subcollections for high-volume messages and provenance records.

## Query strategy

All queue queries are executed under a known organization path. Do not perform a global query and filter by organization in application memory.

Correct:

```ts
db.collection('organizations')
  .doc(ctx.organizationId)
  .collection('workItems')
  .where('assigneeRole', '==', 'clinician');
```

Incorrect:

```ts
db.collectionGroup('workItems')
  .get()
  .then(filterByOrgInMemory);
```

## Two-organization demo test

Seed:

- Harbor Family Medicine
- Cedar Health Clinic

Create one patient and one submission in each. Automated tests must prove:

- Harbor staff cannot read Cedar queue.
- Harbor clinician cannot open a Cedar submission by guessing the ID.
- A Harbor invitation cannot create a Cedar submission.
- Storage download URLs are not reusable across unauthorized sessions.

## Identity Platform tenancy

Google Cloud Identity Platform supports authentication tenant silos. It is a possible production enhancement, but not required for the first demo. Even when identity tenants are used, application data must still carry and enforce `organizationId`.

## Organization-specific configuration

Each organization can define:

- Display name and logo
- Enabled form templates and versions
- Staff routing settings
- Clinician assignment strategy
- Appointment-review rules
- Retention policy identifier
- Time zone
- Patient-facing support message

## Platform-admin isolation

Platform operations should not rely on unrestricted patient-data access. A global administrator can manage organizations and aggregate template demand without receiving automatic access to clinical documents. Break-glass access, if ever implemented, requires separate authorization and audit controls.
