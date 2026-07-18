# Staff Experience Specification

## Purpose

Staff protects clinician time by reviewing completeness, resolving administrative issues, and deciding whether the request should go directly to clinician review or wait for an appointment.

AI may summarize and suggest issues. Staff owns the disposition.

## Navigation

Recommended routes:

```text
/staff/queue
/staff/submissions/{id}
/staff/submissions/{id}/documents
/staff/submissions/{id}/conversation
/staff/submissions/{id}/timeline
```

The default landing page is the queue.

## Queue columns

Recommended table or responsive list:

- Received
- Patient
- Form
- Identity status
- Completeness
- Issues
- Appointment consideration
- Assignee
- Age
- Status

Do not display sensitive clinical details in the queue. Use reason badges such as `Missing required field` or `Potential chart difference`.

## Queue filters

- New
- Assigned to me
- Unassigned
- Needs identity review
- Missing information
- Potential conflict
- Appointment consideration
- Form type
- Age bucket

Sort oldest first by default, with critical operational exceptions clearly defined.

## Claiming work

A staff member can claim an item. The claim prevents accidental duplicate work but does not create an indefinite lock.

Recommended behavior:

- Claim records assignee and timestamp.
- Another staff member can view but sees the assignee.
- Admin or original assignee can release.
- Stale claims are visibly marked.

## Submission review layout

### Header

Show:

- Patient name
- Date of birth
- Masked MRN
- Form name
- Current status
- Received time
- Assigned staff member

### Completion checklist

Use deterministic checks for:

- Patient identity status
- Required applicant fields
- Patient review and signature
- Required upload processing
- Conditional fields
- Clinician profile availability

AI-generated checks appear in a separate "Suggested issues" section.

### Form preview

Show patient-owned values, provisional clinician facts, and source badges. Staff can edit only staff-owned fields and specifically authorized administrative patient fields.

A staff correction to a patient-owned signed field must:

- Record the before and after value
- Record a reason
- Invalidate the patient signature
- Route back to patient review or require an approved alternative process

For the hackathon, avoid staff editing signed patient fields in the main demo.

### Patient conversation

Provide a searchable or collapsible transcript. Highlight messages linked to form fields. Staff can open the exact message from a source badge.

### Uploaded documents

Show pages and extraction highlights. Staff can rotate or mark a document unreadable. They cannot replace the patient's original document without preserving history.

### Mock EMR context

Show a limited view:

- Recent relevant visits
- Relevant diagnoses or conditions
- Selected results
- Transcript availability

Label the last synchronization time.

## Identity review

When patient matching is uncertain:

- Show the submitted identifiers.
- Show a minimum-necessary masked candidate comparison to authorized staff.
- Allow link, no match, or escalate.
- Require a reason for a manual link.
- Record an audit event.

The patient-facing app never sees candidate records.

## AI-assisted issue summary

Display:

- Missing or unclear items
- Potential conflicts
- New patient information
- Appointment consideration reasons
- Unsupported branches

Use wording such as:

> Sidekick found items for staff review.

Avoid:

> Sidekick determined this patient needs an appointment.

Each issue links to supporting fields and evidence.

## Disposition decision

Staff selects one:

### Review only

Use when the form is sufficiently complete and clinic policy does not require an appointment.

Required inputs:

- Assigned clinician or queue
- Optional due date
- Staff confirmation

Effect:

- Creates clinician work item
- Sets `availableAt` to now
- Transitions to `clinician_review_pending`

### Appointment required

Use when staff determines an encounter is needed.

Required inputs:

- Reason code
- Appointment date and time from external or mock scheduling process
- Assigned clinician, when known

Effect:

- Creates appointment clinician work item
- Sets `availableAt` to appointment date or configured pre-visit window
- Keeps it out of the normal clinician queue until available

The MVP records an appointment; it does not schedule one.

### Return to patient

Use for a correctable missing patient item.

Required inputs:

- Patient-facing request message
- Fields to reopen

The MVP may show the status without sending a notification. A returning patient sees the request.

### Manual process

Use when the form is unsupported, requires original paperwork, or cannot be safely completed in Sidekick.

## Appointment visibility timing

The product requirement says appointment cases should not bother clinicians early.

Recommended logic:

```ts
availableAt = appointmentAt
```

Optionally configure a pre-visit window later, such as the beginning of the appointment day. The hackathon should use the appointment timestamp or a demo-friendly near-future time.

Staff can see all cases regardless of `availableAt`.

## Notes

Support two note types:

- Internal staff note
- Clinician handoff note

Do not let staff notes alter canonical clinical fields. Notes are not patient-visible unless explicitly designed and approved.

## Audit timeline

Staff can see:

- Submission started
- Upload received
- Patient signed
- Staff claimed
- Identity reviewed
- Disposition selected
- Appointment date recorded
- Routed to clinician

Hide low-level model and security details.

## Bulk and productivity features

For MVP:

- Queue filters
- Claim
- One-click open next unassigned case
- Keyboard-friendly checklist

Avoid bulk disposition or bulk editing because each case requires individual review.

## Error states

### Concurrent review

Show that the submission changed and reload. Never overwrite another staff member's decision.

### Missing appointment date

Block appointment disposition and explain what is required.

### Clinician unavailable

Allow pooled queue routing or choose another active clinician.

### Signature invalidated

Return to patient or documented manual workflow. Do not route a stale patient signature as valid.

## Acceptance criteria

- Queue contains only the staff member's organization.
- Staff can see completeness and AI-suggested issues separately.
- Staff, not AI, selects the disposition.
- Review-only items become available to clinicians immediately.
- Appointment items remain hidden until `availableAt`.
- Staff cannot sign or verify clinician-owned fields.
- Identity matching ambiguity is handled without patient data disclosure.
- All corrections and dispositions create audit events.
- The seeded demo cases show both disposition paths.
