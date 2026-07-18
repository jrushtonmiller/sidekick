# Admin Experience Specification

## Role boundary

The hackathon admin is an organization administrator. This role manages clinic settings, memberships, supported form availability, and the unsupported-form backlog.

It is not a global platform super-admin and does not build form templates visually.

## Navigation

```text
/admin/overview
/admin/forms
/admin/unsupported-requests
/admin/memberships
/admin/settings
/admin/audit
```

## Overview

Show operational, nonclinical summaries:

- Open patient drafts
- Waiting for staff review
- Ready for clinician
- Appointment cases
- Completed this week
- Unsupported form request count

Avoid displaying diagnosis details or patient answers in aggregate cards.

## Supported forms

The form list shows:

- Form name
- Issuer
- Template key and version
- Availability for the organization
- Last reviewed date
- Signature limitation note
- Number of active submissions

Admin actions:

- Enable an approved template
- Disable a template for new submissions
- View template details
- View revision status

Disabling a template does not delete or alter existing submissions.

## No form builder in MVP

The admin cannot:

- Upload a blank PDF and auto-create a template
- Edit field definitions
- Edit AI prompt contracts
- Change PDF coordinate mappings
- Publish a new form revision

These are developer or platform operations requiring review. The UI may show "Contact platform team to add a form."

## Unsupported form backlog

Each backlog item shows:

- Normalized issuer or title, when known
- First and last request dates
- Request count
- Recognition confidence
- Organizations affected, only for platform-level future views
- Review status

Organization admin sees only their organization's requests.

Status options:

- New
- Under review
- Planned
- Supported
- Declined

Do not automatically retain patient-uploaded forms for aggregate analysis. Link to a specific protected submission only when the admin is authorized and has an operational need.

## Membership management

Admin can:

- Invite staff, clinician, or admin
- Disable a membership
- Assign role
- Associate clinician membership with clinician profile

Controls:

- A user has a separate membership per organization.
- Role changes require reauthentication or high-assurance confirmation in production.
- A clinician role requires an active clinician profile before signing.
- Disabling a membership immediately blocks access.
- At least one active organization admin must remain.

## Clinician profiles

Admin may manage administrative provider information:

- Display name
- License number
- License jurisdiction
- Provider type
- Practice address
- Phone
- Active status

Changing profile data does not alter already signed snapshots.

A clinician should confirm profile details during signing when required.

## Clinic settings

MVP settings:

- Clinic display name
- Time zone
- Support contact text
- Pooled or assigned clinician queue
- Appointment work visibility rule
- Demo mode status
- Supported form availability

Future settings:

- Retention policy
- Notification templates
- Identity matching thresholds
- Scheduling integration
- EMR connection
- AI provider configuration

Do not expose secrets in the admin UI.

## QR and invitation links

Admin can view or generate a clinic entry QR for the demo.

Properties:

- Opaque token
- Organization association
- Purpose
- Active or revoked
- Optional expiration

No patient identity is embedded. Revoking a token prevents new starts but does not invalidate existing submissions.

## Audit view

Organization admin can search high-level events by:

- Date
- Actor
- Role
- Action
- Resource type
- Submission ID

The audit list avoids raw PHI in event metadata. Opening a protected resource requires the admin to have an appropriate operational reason and permission.

## Metrics

Safe product metrics:

- Median time from patient signature to staff disposition
- Median time from staff disposition to clinician signature
- Percent routed review-only
- Percent routed appointment required
- Missing-field rates by template field ID
- Upload processing success rate
- Unsupported form request counts

Do not place patient free text or clinical content in analytics tools.

## Acceptance criteria

- Admin views and modifies only their organization.
- Admin can enable or disable approved templates without editing schemas.
- Unsupported requests are aggregated without exposing unnecessary patient content.
- Membership changes are audited.
- Clinician profile changes do not alter signed documents.
- QR tokens contain no PHI and can be revoked.
- The admin dashboard uses operational metrics, not clinical-detail analytics.
