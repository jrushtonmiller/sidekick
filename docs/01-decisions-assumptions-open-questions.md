# Decisions, Assumptions, and Open Questions

## Confirmed product decisions

| Topic | Decision |
|---|---|
| Entry | Clinic QR code and clinic-specific hyperlink |
| Tenant binding | Link identifies the organization |
| Patient identity | Match using first name, last name, date of birth, address, and phone for the prototype |
| Primary form | One DMV form first |
| Form discovery | Conversational form selection plus upload-and-recognize path |
| Existing form | Patient can upload a photo or PDF |
| Interview | Ask all useful questions in patient-facing language |
| Reuse | Extract and confirm existing answers, then ask gaps |
| Resume | Patient can save and return |
| Patient review | Patient reviews before signing |
| Staff review | Staff reviews completeness and decides whether an appointment is needed |
| Scheduling | Sidekick flags need; external scheduling remains out of scope |
| Clinician timing | Appointment cases appear on appointment date, not immediately |
| Clinician view | Filled form, patient conversation, source references, and mock EMR information |
| Conflicts | Preserve patient version and flag disagreement with chart data |
| Clinician edits | Clinician edits clinician-owned sections, not patient-owned sections |
| Output | Export completed PDF |
| Roles | Patient, staff, clinician, admin |
| Tenancy | Organization is top-level tenant |

## Implementation assumptions

### A1. Exact DMV form

The exact DMV form number was not confirmed. This package uses California REG 195 as the default because it has applicant and medical provider sections. Confirm this before polishing coordinate mapping.

### A2. Web application

The hackathon implementation is a responsive progressive web app. A QR code opens the web app immediately. Installation to the home screen is optional. Native app-store distribution is out of scope.

### A3. Synthetic data

The demo uses synthetic patient data, synthetic chart data, and synthetic transcripts. It does not process real PHI.

### A4. Patient authentication

The prototype uses email/password or a demo authentication mechanism, followed by demographic patient matching. Production should use a patient portal, identity federation, or a stronger identity-proofing design.

### A5. One active clinic per patient session

A patient account may eventually interact with multiple organizations. The MVP binds each submission and active session to one organization derived from the invitation.

### A6. AI provider

The implementation uses a provider interface. OpenAI can be the live provider, but mock AI is the default for the scripted demo.

### A7. EMR and Abridge

The MVP uses adapters over seed data. No undocumented Abridge or EMR API behavior is assumed.

### A8. Electronic signatures

The app captures attestations and renders signatures for the demonstration. Acceptance of an electronically generated or reproduced signature is form-owner specific and must be confirmed before production use. REG 195 currently contains instructions concerning original signatures, so production acceptance must not be assumed.

### A9. Appointment suggestion

The system can flag operational reasons that an appointment may be required, such as missing recent supporting information. It does not make a medical necessity determination.

## Open questions to resolve after the first working demo

1. Which exact DMV form is intended?
2. What authentication method should patients use in production?
3. May patients belong to multiple clinics in one account?
4. What clinic policy determines whether existing chart evidence is recent enough for review-only processing?
5. Can staff return a submission to the patient for missing information, or must missing information always trigger a call or appointment?
6. Which staff roles may view the full patient conversation?
7. Which administrator can see unsupported uploaded forms, and how will PHI be redacted?
8. Which signature methods are accepted by each form recipient?
9. Will the clinic submit the PDF, or will the patient receive it for submission?
10. How long should uploaded forms, transcripts, and completed PDFs be retained?
11. Which languages are required after English?
12. Which EMR and patient-portal integration is first?

## Decisions that should not block the hackathon

- Production BAA contracting
- Final retention period
- Native mobile framework
- Universal form authoring
- Real scheduling
- Real FHIR write-back
- Patient notifications
- Multiple clinician organizations per user
