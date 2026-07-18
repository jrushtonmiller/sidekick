# Demo Seed Data and Judge Script

## Demo objective

Show one polished end-to-end story in approximately five minutes:

> A patient does not know the form name, Sidekick identifies it, asks the questions in plain language, routes it through staff triage, gives the clinician source-linked information to verify, and produces a completed document.

Use deterministic fixtures. Live AI can be shown only as an optional enhancement.

## Synthetic organizations

### Clinic A

```json
{
  "id": "org_harbor_demo",
  "name": "Harbor Family Medicine",
  "slug": "harbor-family",
  "timeZone": "America/Los_Angeles"
}
```

### Clinic B

```json
{
  "id": "org_cedar_demo",
  "name": "Cedar Health Clinic",
  "slug": "cedar-health",
  "timeZone": "America/Los_Angeles"
}
```

Clinic B exists to demonstrate isolation. Do not use it in the main patient story unless asked about tenancy.

## Demo users

Use obvious synthetic accounts and a shared demo password only in the local or isolated hackathon environment.

- Patient: Maya Rivera
- Staff: Jordan Lee
- Clinician: Dr. Priya Shah
- Admin: Alex Morgan
- Clinic B staff: Casey Brooks

Add a role switcher in `DEMO_MODE` or provide one-click account cards. Never ship it to production.

## Primary synthetic patient

```json
{
  "id": "pat_maya_rivera",
  "organizationId": "org_harbor_demo",
  "mrn": "DEMO-1001",
  "legalFirstName": "Maya",
  "legalLastName": "Rivera",
  "dateOfBirth": "1967-08-14",
  "address": {
    "line1": "100 Demo Street",
    "city": "Oakland",
    "state": "CA",
    "postalCode": "94601"
  },
  "phone": "+15105550123"
}
```

All names, addresses, phone numbers, MRNs, dates, and clinical content are synthetic.

## Relevant chart fixture

### Encounter 1, recent

- Date: July 10, 2026
- Clinician: Dr. Priya Shah
- Reason: worsening bilateral knee pain and mobility limitation
- Condition: bilateral knee osteoarthritis
- Observation: antalgic gait documented in synthetic note
- Plan: continue conservative treatment; mobility impact discussed

### Encounter 2, older

- Date: March 3, 2026
- Note: patient reported symptoms beginning around March
- No mobility aid documented

### Patient's current report

- Says severe walking limitation became noticeable in June
- Now uses a cane outside the home
- Can walk about half a block before stopping

This creates a useful, nonaccusatory difference: the chart has an older onset reference and the patient reports current worsening and a new aid.

## Primary demo form

- California DMV REG 195 assumption
- Request: permanent placard
- No prior placard
- No disabled plates

Preseed clinician profile:

```json
{
  "displayName": "Priya Shah, MD",
  "licenseNumber": "DEMO-CA-12345",
  "licenseState": "CA",
  "providerType": "physician",
  "practicePhone": "+15105550999"
}
```

Mark all license information as synthetic.

## Deterministic patient conversation

### Form selection

Patient:

> I need the parking form my doctor has to sign because I cannot walk far.

Sidekick:

> It sounds like you may need the California DMV application for a disabled person parking placard or plates. Is that what you need?

Patient confirms.

### Applicant questions

Ask or confirm:

- Name
- DOB
- Address
- Phone
- Request type
- Prior placard

### Patient facts

Sidekick:

> What condition is your clinician treating that affects your ability to walk or get around?

Patient:

> Arthritis in both knees.

Sidekick:

> How does it affect you when you walk from a parking area into a building?

Patient:

> I can go about half a block, then the pain gets bad and I have to stop.

Sidekick:

> Do you use anything to help you walk?

Patient:

> I started using a cane outside the house.

Sidekick:

> When did this limitation become this severe?

Patient:

> Around June.

The model normalizes but preserves exact quotes.

## Staff summary fixture

```text
Applicant section complete and patient signed.
Patient reports worsening walking limitation since June and new cane use.
Chart documents bilateral knee osteoarthritis and mobility limitation at a recent visit.
Older chart note references symptoms beginning in March. Preserve both dates for clinician review.
Sidekick suggests staff consider whether a new appointment is needed. Staff decision required.
```

For the main success path, staff selects `review_only` because the seeded clinic policy accepts the recent July 10 evaluation.

## Secondary appointment case

Create a second synthetic submission where:

- No relevant encounter in the last year
- Patient reports a new condition
- Staff selects appointment required
- Appointment time is two minutes in the future for demo or controlled by fake clock

Use this case to show that clinicians are not notified early.

## Five-minute script

### 0:00 to 0:40, problem and entry

Say:

> Patients often do not know which form they need, and clinics spend time re-entering information scattered across conversations and the chart. Sidekick turns that into a reviewed workflow.

Scan or click the Harbor Family Medicine QR link. Show clinic branding and start as Maya.

### 0:40 to 1:15, form identification

Choose "Tell us what you need." Enter the parking placard description. Confirm REG 195.

Point out:

> The patient does not need to know the official form name.

### 1:15 to 2:10, interview and review

Use quick-answer buttons or seeded chat to complete the interview. Show that the language is patient-facing.

Open the review screen and point to:

- Applicant information
- Patient's exact facts
- "Clinic will complete" section

Sign as patient.

### 2:10 to 2:55, staff triage

Switch to Jordan, staff.

Open the queue. Show:

- Completion checklist
- Source-linked conflict
- Patient conversation
- Appointment consideration

Choose review only.

Say:

> Sidekick suggests issues, but staff decides the workflow.

### 2:55 to 4:15, clinician review

Switch to Dr. Shah. Open the ready queue.

Show:

- Nearly completed form
- Patient quote source
- Chart source
- March versus June difference
- Mock Abridge transcript or visit evidence

Verify clinician fields, actively select the certification branch, and sign.

Say:

> AI never selects the clinical certification and never signs. The clinician verifies the evidence and final language.

### 4:15 to 4:45, export and timeline

Export the PDF or Sidekick review packet. Show timeline:

- Patient completed
- Patient signed
- Staff reviewed
- Clinician verified
- Clinician signed
- Export generated

### 4:45 to 5:00, platform close

Say:

> DMV is the first template. The workflow is data-driven, so the same platform can support EDD, FMLA, and other clinic forms without rebuilding the application.

## Optional tenancy proof

Open a Clinic B staff account and show an empty or different queue. Do not reveal Clinic A data. Use this only when asked about enterprise readiness.

## Optional appointment proof

Open the secondary case. Show it in staff's appointment list but absent from the clinician ready queue. Advance demo clock and refresh to make it appear.

## Demo controls

In `DEMO_MODE`, include:

- Reset all demo data
- Switch role
- Advance fake clock
- Toggle upload success or failure
- Toggle mock or live AI
- Open primary case at any stage
- Regenerate export

Protect the controls behind a secret local route or demo environment flag.

## Failure recovery

### AI fails

Switch to mock mode and continue. Do not debug a vendor call on stage.

### OCR fails

Say the patient can continue manually, then use the seeded interview.

### PDF overlay fails

Use the Sidekick review packet marked `DEMO, NOT FOR SUBMISSION`.

### Authentication fails

Use role-switch demo mode.

### State becomes inconsistent

Reset seed and use deep links to the prepared checkpoints.

## Judge questions and answers

### Is this HIPAA compliant?

> This hackathon uses synthetic data. The architecture is designed around tenant isolation, role-based access, auditability, minimum necessary data, and human verification. Production use would require vendor BAAs, covered-service verification, a formal risk analysis, operational policies, and security validation.

### What is the AI actually doing?

> It identifies supported forms, reads uploaded values, asks the missing questions in patient language, maps answers to structured fields, flags conflicts, and summarizes evidence. It cannot certify, sign, schedule, or grant access.

### What prevents hallucinations?

> Every output is structured and schema-validated. Values require source references. Patient and clinician confirmations are separate. Missing or conflicting information is flagged rather than invented.

### How does this scale to more forms?

> Each form is a versioned JSON template containing fields, ownership, questions, validation, conditions, and PDF mapping. New forms are reviewed templates, not new hard-coded applications.

### How does it integrate with an EMR?

> The demo uses a normalized fixture adapter. A future FHIR adapter can map Patient, Encounter, Condition, Observation, DocumentReference, and related resources into the same domain interface.

### What happens when a form is unsupported?

> Sidekick says it cannot complete the form, routes the patient to clinic staff, and adds a de-identified request signal to an admin backlog.

## Acceptance criteria

- Main demo completes in five minutes.
- No network dependency is required.
- Every displayed person and clinical fact is visibly synthetic.
- Staff and clinician decisions are active human actions.
- Source evidence opens in one click.
- Appointment case is hidden until the configured time.
- Export and reset work repeatedly.
