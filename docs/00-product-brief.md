# Product Brief

## Product name

Sidekick

## Problem

Patients often do not know the exact name of the form they need. Forms may arrive after a visit, may be partially completed, and often mix patient information with clinician certification. Clinic staff then spend time identifying the form, collecting missing information, finding supporting chart data, deciding whether an appointment is necessary, routing the work, and asking a clinician to repeat information already available elsewhere.

## Product promise

Sidekick turns a form into a guided workflow:

- Identify the form from a description or uploaded image
- Reuse information already present
- Ask missing questions in patient-friendly language
- Preserve the patient's own words
- Route the submission through staff triage
- Bring the clinician a nearly complete, source-linked form
- Export a signed PDF

## Core value proposition

Sidekick is not merely a chat interface that fills fields. It coordinates the full operational path from patient request to completed document.

## Users

- Patient
- Clinic staff
- Clinician
- Administrator

## Demo form

Default: California DMV REG 195, Application for Disabled Person Placard or Plates.

This form is a good workflow demonstration because it includes applicant information, applicant attestation, medical provider information, medical certification, and provider signature. The exact target form remains an open product decision because the conversation identified only "the DMV form," not a form number.

## Design principles

### Ask once

Do not ask a patient to re-enter information already extracted with adequate confidence. Show the extracted value and ask for confirmation when appropriate.

### Preserve authorship

A patient statement remains a patient statement. Chart data remains chart data. A clinician certification remains a clinician action.

### Human authority

AI can organize and suggest. Staff decides operational routing. The clinician decides clinical content and signs clinician certifications.

### Explain every field

Reviewers should be able to see where each value came from and open the supporting source.

### Minimize clinician interruption

A case that requires an appointment should not appear in the clinician's active queue until the appointment date. A review-only case should appear immediately.

### Be honest when unsupported

When Sidekick cannot identify or support a form, it should say so, create a non-PHI backlog signal, and direct the patient to contact the clinic.

## Success metrics for the hackathon

- One complete form moves through all roles without manual database changes.
- The patient is asked only relevant questions.
- Staff can understand what is missing in under 30 seconds.
- The clinician can verify sources without searching multiple screens.
- Cross-tenant access is demonstrably blocked.
- The final PDF is generated from a signed immutable snapshot.

## Longer-term metrics

- Median staff handling time per form
- Median clinician handling time per form
- Percentage of forms completed without a new appointment
- Percentage of patient questions answered from existing sources
- Number of forms returned for incompleteness
- Form turnaround time
- Disagreement rate between AI suggestions and human final values
- Patient abandonment rate
