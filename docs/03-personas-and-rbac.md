# Personas and Role-Based Access Control

## Patient

### Goals

- Understand which form is needed
- Avoid repeating information already provided
- Complete the request on a phone
- Know what happens next

### Permissions

- Read and update own profile
- Read and update own draft submissions within the active organization
- Upload documents to own submission
- View own conversation and patient-facing review
- Sign own attestation
- View own status and completed PDF when clinic policy permits

### Restrictions

- Cannot read other patients
- Cannot view internal staff notes
- Cannot edit clinician-owned fields
- Cannot route work or set appointment disposition
- Cannot sign as a clinician

## Staff

### Goals

- Determine whether a submission is complete
- Identify missing or conflicting information quickly
- Decide operational routing
- Avoid interrupting clinicians too early

### Permissions

- Read submissions for assigned organization
- Read patient conversation and source excerpts when necessary
- Add staff notes
- Set appointment disposition
- Enter appointment date/time for demo routing
- Route submission to clinician
- Reopen patient collection only if the organization enables that feature

### Restrictions

- Cannot sign clinician certification
- Cannot finalize clinician-owned fields
- Cannot read another organization's data
- Cannot alter signed patient-owned fields without invalidating patient attestation

## Clinician

### Goals

- Review a nearly complete form
- Verify where each value came from
- Focus on clinical judgments and certification
- Sign and finish with minimal clicks

### Permissions

- Read assigned or organization-visible clinician work items
- Read form, patient conversation, provenance, and chart sources
- Edit clinician-owned fields
- Accept, modify, or reject AI suggestions
- Sign clinician attestation
- Generate final PDF

### Restrictions

- Cannot manage form templates unless also an admin
- Cannot silently overwrite patient statements
- Cannot sign until required clinician fields are complete
- Cannot sign another organization's form

## Admin

### Goals

- Configure supported forms
- Understand unmet form demand
- Manage clinic settings and memberships

### Permissions

- Manage organization settings
- Manage members and roles
- Enable templates for the organization
- Review aggregate unsupported-form requests
- View operational metrics allowed by policy

### Restrictions

- A platform-level admin should not automatically receive access to patient documents.
- Unsupported-form analytics should use redacted or non-PHI metadata whenever possible.
- Admin privilege does not imply clinician signing authority.

## Permission matrix

| Capability | Patient | Staff | Clinician | Admin |
|---|---:|---:|---:|---:|
| Create own submission | Yes | No | No | No |
| View own submission | Yes | No | No | No |
| View organization queue | No | Yes | Yes, scoped | Optional |
| View patient conversation | Own | Yes | Yes | Policy-based |
| Edit patient-owned fields | Before signing | Limited reopen | No | No |
| Edit clinician-owned fields | Provide provisional facts only | No | Yes | No |
| Decide appointment routing | No | Yes | No | No |
| Sign patient attestation | Yes | No | No | No |
| Sign clinician certification | No | No | Yes | No |
| Manage templates | No | No | No | Yes |
| Export final PDF | Policy-based | Optional | Yes | Policy-based |

## Authorization model

Every authorization decision requires:

1. Authenticated user
2. Active organization membership
3. Role permission
4. Resource `organizationId` equality
5. Resource ownership or assignment where applicable
6. Valid workflow state

Hiding a button is not authorization. The server must recheck every privileged action.
