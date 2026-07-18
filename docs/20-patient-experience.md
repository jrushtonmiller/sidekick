# Patient Experience Specification

## Experience goal

A patient should be able to prepare a form without knowing its official name, understanding clinical wording, or re-entering information already present. The experience should feel like a guided conversation, not a government form translated into a long web page.

The patient must understand that Sidekick helps prepare information and that clinic staff and the clinician make final decisions.

## Primary entry paths

### Clinic QR code

The QR code opens a clinic-specific route:

```text
/start/{opaqueClinicToken}
```

The landing page shows:

- Clinic name
- Sidekick purpose
- Privacy notice link
- Start button
- "Already started? Sign in" link

### Clinic-sent link

The clinic may send the same type of opaque link through its patient portal or another approved channel. The link identifies the tenant and optionally a general intent, but contains no patient identity or PHI.

### Returning patient

A returning patient signs in and sees their own active submissions for that clinic.

## Navigation model

Recommended patient routes:

```text
/start/{clinicToken}
/auth
/onboarding
/patient/home
/patient/submissions/new
/patient/submissions/{id}/identify
/patient/submissions/{id}/upload
/patient/submissions/{id}/interview
/patient/submissions/{id}/review
/patient/submissions/{id}/sign
/patient/submissions/{id}/status
```

Use a responsive PWA. Do not require an app-store installation for the hackathon. A QR code should work immediately in the mobile browser.

## Onboarding

### Account step

Use the simplest reliable hackathon login, such as email link, email and password, or phone authentication. Explain that the account lets the patient save and return.

### Clinic association

Resolve the clinic from the link. Show the clinic name and ask the patient to confirm that they are working with that clinic.

### Identity matching

Collect:

- First name
- Last name
- Date of birth
- Address
- Phone number

Use appropriate input types, masks, autocomplete, and validation. Explain that this information is used to connect to the clinic's record.

Possible outcomes:

- Unique match: continue
- No match: create an unlinked prototype profile and flag staff review
- Multiple or uncertain match: explain that clinic staff will verify identity

Never display another patient's details.

## Home screen

Show:

- Continue current form
- Start a new request
- Completed forms
- Clinic support contact

Each submission card shows a plain-language status:

- In progress
- Ready for your review
- Sent to clinic staff
- Clinic is reviewing
- Appointment needed
- Ready for clinician review
- Completed
- Needs your attention

Avoid internal terms such as `staff_review_pending`.

## Starting a request

Offer two primary choices:

1. Upload or photograph a form
2. Tell us what you need

Also allow browsing a short list of supported forms.

### Describe what you need

Prompt:

> Tell us what the form is for. You do not need to know the official name.

Examples:

- A parking placard
- Time away from work
- A school accommodation

When matched, confirm:

> It sounds like you may need the California DMV disabled parking placard or plates application. Is that what you are trying to complete?

When uncertain, ask one clarifying question at a time.

When unsupported:

> We cannot prepare this form in Sidekick yet. Please contact the clinic and bring or upload the form so staff can help you with the next step.

Create an unsupported form request without promising future support.

## Upload experience

The patient can:

- Take a photo
- Choose photos
- Upload a PDF
- Skip upload and answer questions

After processing, show:

> We found some information on your form. Please check it before we continue.

Display one field at a time or in small groups, with the source crop where helpful.

## Interview behavior

### Principles

- One concept at a time
- Plain language
- Short paragraphs
- Progress indicator
- Save after every answer
- Explain why sensitive information is needed
- Allow "I do not know" when safe
- Do not demand clinical terminology
- Do not make the patient repeat confirmed information

### Question components

```ts
interface PatientQuestionView {
  title?: string;
  question: string;
  helpText?: string;
  responseControl: string;
  choices?: Choice[];
  canSkip: boolean;
  whyWeAsk?: string;
}
```

### Clinical-language translation

Official clinician field:

> Description of illness or disability

Patient-facing sequence:

1. "What condition has your clinician diagnosed or treated that affects your ability to walk or get around?"
2. "How does it affect walking or getting from a parking area into a building?"
3. "Do you use a mobility aid, such as a cane, walker, wheelchair, or brace?"

Do not show a final clinical phrase as though the patient authored or certified it. Present patient facts separately.

### Conversation transcript

Store the patient's exact answers. The patient can review their conversation. Explain that clinic staff and the clinician may review it to complete the form.

## Save and resume

Autosave after every accepted answer. On return:

- Restore the exact submission
- Show progress
- Show last saved time
- Resume at the next unresolved item

After a prolonged session, require reauthentication according to the configured security policy.

## Review screen

Organize into cards:

### About you

Patient demographic and contact fields.

### What you are requesting

Form type and selected options.

### What you told us

Plain-language health and functional information.

### What the clinic will complete

List clinician-owned areas without presenting a completed certification.

Each patient-owned answer has an Edit control. Editing a signed value invalidates the patient signature and returns the submission to review.

## Patient attestation

Before signing:

- Display the exact attestation text.
- Identify the signed sections.
- Require an affirmative checkbox.
- Capture typed or drawn signature for demo.
- Capture date and time server-side.
- Warn that form acceptance requirements vary and clinic staff may need an original signature.

Do not pre-check consent or attestation boxes.

## Status after submission

Show:

> Your information was sent to Harbor Family Medicine for review.

Possible later status messages:

- "Clinic staff needs more information."
- "The clinic determined that an appointment is needed. Please follow the clinic's scheduling instructions."
- "Your form is with the clinician for review."
- "Your form is complete."

Scheduling is not performed in the MVP.

## Error and recovery states

### AI unavailable

> We are having trouble with the guided questions. Your progress is saved. You can continue with the standard questions or try again.

### Upload unreadable

> We could not read enough of this image. Retake the photo, upload a different file, or continue without it.

### Identity review

> We could not safely match your information automatically. Clinic staff will verify it before the form is completed.

### Unsupported form

Provide the clinic support path. Do not end with a dead screen.

## Health-safety content

The form assistant is not an emergency or clinical advice service. If a patient's free-text answer contains a clear statement of immediate danger or a medical emergency, show the clinic-approved emergency message and stop normal conversational elaboration. Do not attempt diagnosis or individualized treatment advice.

The exact safety copy must be approved by the clinic and localized. For a US demo, a general message may tell the user to call emergency services or seek urgent care when they believe they are having an emergency, but production behavior requires clinical and legal review.

## Accessibility

- Meet WCAG 2.2 AA targets.
- Support 200 percent zoom.
- Use labels, not placeholders alone.
- Ensure status is not conveyed only by color.
- Provide a visible focus indicator.
- Make touch targets at least approximately 44 by 44 CSS pixels.
- Announce chat responses and validation errors appropriately.
- Support keyboard completion.
- Provide text alternatives for source images.
- Avoid time limits when possible.

## Patient analytics

Use privacy-preserving product events such as:

- `patient_submission_started`
- `form_match_confirmed`
- `upload_completed`
- `interview_question_answered`
- `patient_review_opened`
- `patient_signed`

Do not send field values, patient names, uploaded filenames, transcript text, diagnoses, or form answers to general analytics.

## Acceptance criteria

- QR entry visibly associates the patient with the correct clinic.
- Patient can start by upload or description.
- Patient can save and resume.
- Confirmed information is not asked again.
- Questions use patient-friendly language and explain necessary terms.
- Patient reviews every patient-owned value before signing.
- Patient cannot sign clinician certification fields.
- Ambiguous identity never exposes another patient's data.
- Upload or AI failure has a usable fallback.
- The complete scripted patient flow works on a phone-sized screen.
