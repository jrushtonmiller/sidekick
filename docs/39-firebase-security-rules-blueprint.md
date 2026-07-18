# Firebase Security Rules Blueprint

## Purpose

This is a design blueprint, not copy-paste production rules. Final rules must match the implemented data paths and pass emulator tests.

The recommended MVP sends most protected operations through server APIs using the Admin SDK. Firebase Security Rules still deny unauthorized direct client access.

## Default deny

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Add narrowly scoped rules from that baseline.

## Helper concepts

Example pseudocode:

```rules
function signedIn() {
  return request.auth != null;
}

function membershipPath(orgId) {
  return /databases/$(database)/documents/organizations/$(orgId)/memberships/$(request.auth.uid);
}

function activeMembership(orgId) {
  return signedIn()
    && exists(membershipPath(orgId))
    && get(membershipPath(orgId)).data.status == 'active';
}

function hasRole(orgId, roles) {
  return activeMembership(orgId)
    && get(membershipPath(orgId)).data.role in roles;
}

function isLinkedPatient(orgId, patientId) {
  return hasRole(orgId, ['patient'])
    && get(membershipPath(orgId)).data.patientId == patientId;
}
```

Rules reads have limits and cost. Test performance and avoid deeply nested lookups.

## Organization document

Patients and workforce may read a minimal public organization profile through a separate public collection or server endpoint. Do not expose operational settings directly.

Recommended protected organization document:

```rules
match /organizations/{orgId} {
  allow read: if hasRole(orgId, ['staff', 'clinician', 'admin']);
  allow write: if false;
}
```

Admin updates occur through server API.

## Memberships

```rules
match /organizations/{orgId}/memberships/{userId} {
  allow read: if activeMembership(orgId) && request.auth.uid == userId;
  allow read: if hasRole(orgId, ['admin']);
  allow write: if false;
}
```

Do not allow a client to set its own role or organization.

## Patient records

Direct patient read is optional. When enabled:

```rules
match /organizations/{orgId}/patients/{patientId} {
  allow read: if isLinkedPatient(orgId, patientId);
  allow read: if hasRole(orgId, ['staff', 'clinician', 'admin']);
  allow write: if false;
}
```

Use server routes for changes and matching.

## Submissions

Patient direct read may be allowed only when the parent submission belongs to the linked patient.

```rules
function patientOwnsSubmission(orgId, submissionId) {
  let sub = get(/databases/$(database)/documents/organizations/$(orgId)/submissions/$(submissionId));
  return hasRole(orgId, ['patient'])
    && sub.data.patientId == get(membershipPath(orgId)).data.patientId;
}

match /organizations/{orgId}/submissions/{submissionId} {
  allow read: if patientOwnsSubmission(orgId, submissionId);
  allow read: if hasRole(orgId, ['staff', 'clinician', 'admin']);
  allow write: if false;
}
```

All state transitions are server-only.

## Field values and conversation

Patient direct draft writes add complexity because Rules must validate field ownership against a versioned template. Prefer server API.

Safe baseline:

```rules
match /organizations/{orgId}/submissions/{submissionId}/fieldValues/{fieldId} {
  allow read: if patientOwnsSubmission(orgId, submissionId)
              || hasRole(orgId, ['staff', 'clinician', 'admin']);
  allow write: if false;
}

match /organizations/{orgId}/submissions/{submissionId}/conversations/{messageId} {
  allow read: if patientOwnsSubmission(orgId, submissionId)
              || hasRole(orgId, ['staff', 'clinician']);
  allow write: if false;
}
```

The patient posts answers to an authenticated server route.

## Evidence and clinical data

Patient view should be role-shaped by the server. A patient does not automatically read internal chart evidence or clinician notes.

```rules
match /organizations/{orgId}/submissions/{submissionId}/evidence/{evidenceId} {
  allow read: if hasRole(orgId, ['staff', 'clinician']);
  allow write: if false;
}
```

Patient-facing evidence, such as their own uploaded crop, can be served by a protected API after content filtering.

## Signatures, snapshots, exports, and audit

All direct writes denied.

```rules
match /organizations/{orgId}/submissions/{submissionId}/signatures/{id} {
  allow read: if patientOwnsSubmission(orgId, submissionId)
              || hasRole(orgId, ['staff', 'clinician', 'admin']);
  allow write: if false;
}

match /organizations/{orgId}/submissions/{submissionId}/snapshots/{id} {
  allow read: if hasRole(orgId, ['clinician', 'admin']);
  allow write: if false;
}

match /organizations/{orgId}/submissions/{submissionId}/exports/{id} {
  allow read: if false;
  allow write: if false;
}

match /organizations/{orgId}/auditEvents/{id} {
  allow read: if hasRole(orgId, ['admin']);
  allow write: if false;
}
```

Serve exports through an API that verifies role and policy.

## Work items

Direct client access can be read-only for workforce, but server APIs simplify query and role shaping.

```rules
match /organizations/{orgId}/workItems/{workItemId} {
  allow read: if hasRole(orgId, ['staff', 'clinician', 'admin']);
  allow write: if false;
}
```

The API ensures clinician-ready filtering by `availableAt`. Do not rely only on the UI to hide future tasks.

## Platform templates

```rules
match /platformFormTemplates/{templateId} {
  allow read: if signedIn();
  allow write: if false;
}
```

For tighter control, serve templates through the API. Templates contain no PHI but can contain internal prompt and workflow details.

## Storage baseline

```rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Recommended upload uses server-generated signed upload or server proxy. Direct reads remain denied.

## Optional direct upload rule

A direct upload rule must verify:

- Authenticated user
- Active patient membership in `orgId`
- Submission ownership
- Allowed path depth
- Content type allowlist
- Maximum size
- Required metadata matches path
- Create only, not overwrite

Pseudocode:

```rules
match /organizations/{orgId}/submissions/{submissionId}/documents/{documentId}/original {
  allow create: if patientOwnsSubmission(orgId, submissionId)
    && request.resource.size < 15 * 1024 * 1024
    && request.resource.contentType in [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ]
    && request.resource.metadata.organizationId == orgId
    && request.resource.metadata.submissionId == submissionId;
  allow read, update, delete: if false;
}
```

Security Rules cannot perform malware scanning. The server must quarantine and validate before use.

## Admin SDK caution

The Admin SDK bypasses Security Rules. Every server repository method must apply its own authorization and tenant scope. Do not treat Rules as protection against a buggy privileged backend.

Recommended repository signature:

```ts
async function getSubmission(
  ctx: TenantContext,
  submissionId: string
): Promise<Submission>;
```

Avoid repository methods that accept only a submission ID.

## Emulator test matrix

For every collection and storage path, test:

- Unauthenticated denied
- Same-tenant correct role allowed when intended
- Same-tenant wrong role denied
- Same-tenant wrong patient denied
- Cross-tenant denied
- Disabled membership denied
- Client role-field modification denied
- Signature and audit write denied
- Oversized or wrong-type upload denied
- Overwrite upload denied

## Deployment controls

- Keep Rules in source control.
- Test in CI with the emulator.
- Review diffs like application code.
- Deploy locked rules before application code that depends on them.
- Prevent production deploy from a branch with test-mode wildcard access.

## Acceptance criteria

- Default deny remains intact.
- Clients cannot write roles, workflow states, signatures, snapshots, exports, or audit events directly.
- Every allowed path checks tenant membership and resource relationship.
- Storage is private and upload is create-only with limits.
- Admin SDK methods independently enforce tenant scope.
- Emulator tests cover all role and tenant combinations.
