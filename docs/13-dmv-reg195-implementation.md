# California DMV REG 195 Implementation

## Status and assumption

The starter form is the California DMV Application for Disabled Person Placard or Plates, REG 195. The original product discussion identified a "DMV form" but did not confirm the exact form number. Treat REG 195 as a replaceable demo assumption.

Do not represent this template as legally complete until a clinic reviewer verifies it against the exact revision being used. Form layouts, instructions, accepted signatures, and certification language can change.

## Why this form works for the demo

REG 195 supports the product story because it contains:

- Applicant-owned demographic and request information
- A patient attestation
- A licensed medical provider section
- A provider certification and signature
- Conditional information for placards, plates, and prior placards
- Clinical facts that a patient can discuss, but a clinician must certify

This creates a clear separation between patient-supplied facts and clinician-owned conclusions.

## Demo scenario

Use one synthetic patient and the simplest supported branch:

- Applicant requests a permanent disabled person parking placard
- Applicant is not requesting disabled person license plates
- Applicant does not have a prior placard
- Patient reports bilateral knee osteoarthritis and substantial walking limitation
- Mock chart contains a related diagnosis and recent visit
- Patient wording and chart wording are similar but not identical
- Staff decides no additional appointment is required for the scripted success path
- Clinician verifies the qualifying limitation, selects the appropriate certification statement, signs, and exports

Add a second seeded case where an appointment is required to demonstrate delayed queue availability.

## Sections and ownership

### Section A: applicant information

Typical applicant fields include:

- Full legal name
- Date of birth
- Residential address
- Mailing address when different
- Driver license or identification card number, when requested
- Telephone number
- Email address, when included in the current revision

Final owner: patient.

Permitted suggestions:

- Uploaded form
- Clinic demographics
- Patient portal demographics
- Patient chat

Patient must confirm any suggested demographic information before attestation.

### Section B: request details

Example structured values:

```ts
type DmvRequestType =
  | 'permanent_placard'
  | 'temporary_placard'
  | 'travel_placard'
  | 'disabled_person_plates'
  | 'disabled_veteran_plates';
```

For the MVP, support `permanent_placard` and optionally `temporary_placard`. Display unsupported branches, but route them to staff instead of pretending they are fully automated.

Final owner: patient for what the applicant is requesting. Staff may correct administrative routing after discussing it with the patient, with an audit event.

### Section C: prior placard and vehicle information

Conditional fields may include:

- Existing placard number
- Existing placard expiration date
- Vehicle license plate number
- Vehicle identification number
- Vehicle make or model year

Only show vehicle information when a request includes license plates.

Final owner: patient, with staff verification as needed.

### Section D: applicant attestation and signature

The patient must review:

- Applicant information
- Request type
- Prior placard information
- Vehicle information, when applicable
- A plain-language explanation that the applicant is attesting to the truth of the applicant section

The patient signature must not cover clinician certification fields.

Important production caveat: the currently published REG 195 instructions state that original signatures are required and that photocopies or faxed copies are not accepted. Therefore, the hackathon signature is a workflow demonstration. Do not claim that an app-generated electronic signature will be accepted by DMV without a current legal and operational review.

### Section E: medical provider information

Typical fields include:

- Provider name
- Professional license or certification number
- Jurisdiction or state
- Provider type
- Practice address
- Telephone number

Final owner: clinician or trusted clinic profile. The patient may not finalize these values.

### Section F: disability certification

The form includes qualifying certification statements. The exact wording and numbered options must be copied from the approved form revision during implementation.

The patient interview may collect relevant facts, for example:

- "What condition is your clinician treating that makes walking or getting around difficult?"
- "About how far can you walk before you need to stop?"
- "Do you use a cane, walker, wheelchair, brace, oxygen, or another aid?"
- "Is this expected to be temporary or long term, based on what your clinician has told you?"
- "When did the limitation begin?"
- "Has a clinician evaluated this problem recently?"

These answers are evidence for review, not a provider certification. The system must never convert the patient's answer directly into a signed eligibility statement.

Final owner: clinician.

### Section G: provider attestation and signature

The clinician must:

1. Open the case in the clinician workspace.
2. Review each clinician-owned field.
3. View supporting sources and conflicts.
4. Select or enter the certification language.
5. Confirm that the information is accurate.
6. Sign the clinician scope.

No AI service may perform these actions on the clinician's behalf.

## Proposed field identifiers

Use stable, semantic identifiers. Do not use PDF coordinate names as canonical identifiers.

```text
applicant.legal_name.first
applicant.legal_name.middle
applicant.legal_name.last
applicant.date_of_birth
applicant.address.residential.line1
applicant.address.residential.line2
applicant.address.residential.city
applicant.address.residential.state
applicant.address.residential.postal_code
applicant.address.mailing_same_as_residential
applicant.address.mailing.*
applicant.driver_license_or_id
applicant.phone
applicant.email
request.types
request.prior_placard.has_one
request.prior_placard.number
request.prior_placard.expiration_date
vehicle.plate_number
vehicle.vin
vehicle.year
vehicle.make
patient_facts.condition_description
patient_facts.functional_limitations
patient_facts.mobility_aids
patient_facts.onset_date
patient_facts.expected_duration
provider.name
provider.license_number
provider.license_state
provider.provider_type
provider.address.*
provider.phone
certification.qualifying_category
certification.clinical_description
certification.expected_end_date
signature.patient
signature.clinician
```

The `patient_facts.*` fields are application evidence fields. They may not render directly to the official form. They support clinician review and can be mapped into a clinician-owned description only after clinician verification.

## Interview plan

### Phase 1: orient

Explain what Sidekick can and cannot do:

- It helps prepare the form.
- It does not determine eligibility.
- The clinician makes the certification decision.
- The patient can pause and return.

### Phase 2: request and identity

Ask what the patient is requesting, then confirm demographic fields. Use one question at a time on mobile.

### Phase 3: existing form extraction

When an upload exists:

- Show fields that were confidently read.
- Ask the patient to confirm them.
- Ask only for missing or low-confidence values.
- Never display a full government identifier in conversational history after confirmation. Mask where practical.

### Phase 4: functional facts

Ask behaviorally specific questions. Avoid asking the patient to select a legal certification category. Examples:

- Good: "What happens when you try to walk from a parking lot into a store?"
- Avoid: "Do you meet category 6A?"

### Phase 5: review

Group the review into:

- About you
- What you are requesting
- What you told us about your mobility
- Items the clinician still needs to decide

### Phase 6: patient attestation

The attestation must identify which sections the patient signs. It must not imply that the patient certifies clinical eligibility.

## Staff review checklist

Staff sees a generated checklist, but the app uses deterministic rules for required items:

- Patient identity matched or manually reviewed
- Required applicant fields present
- Request type selected
- Patient attestation present
- Uploaded document readable, when supplied
- Existing placard information supplied when applicable
- Vehicle information supplied when applicable
- Recent relevant visit or chart evidence available
- Patient and chart conflicts visible
- Clinician profile information available
- Appointment recommendation and reason visible

Staff chooses one disposition:

- `review_only`
- `appointment_required`
- `return_to_patient`
- `unsupported_or_manual_process`

For the MVP, `return_to_patient` may be represented as a staff note and a status without a notification integration.

## Appointment suggestion rules

These are workflow suggestions, not medical decisions. Use explicit, clinic-configurable reasons. Example demo rules:

Recommend staff consideration of an appointment when:

- No relevant encounter exists within a configured time window
- Patient reports a new or substantially changed condition
- Patient and chart information materially conflict
- Required clinician facts are absent
- The requested duration is inconsistent with available documentation
- A staff member identifies a policy reason

The UI must say "Consider appointment" rather than "Appointment required" until staff makes the decision.

## Clinician workspace layout

Recommended three-panel desktop layout:

1. Form preview and editable clinician fields
2. Evidence panel containing patient statements, uploaded-form excerpts, mock chart, and Abridge transcript excerpts
3. Task panel containing unresolved issues, verification controls, and signature

On smaller screens, use tabs or drawers.

Each populated field shows:

- Source badge
- Verification status
- Conflict indicator
- Info control that opens the exact supporting excerpt

## Rendering strategy

### Preferred approach

Use a licensed or permitted blank PDF copy and overlay values at coordinates stored in the template.

Rendering definition example:

```json
{
  "fieldId": "applicant.phone",
  "page": 1,
  "x": 412,
  "y": 612,
  "width": 138,
  "height": 18,
  "fontSize": 9,
  "overflow": "shrink"
}
```

Use PDF points and a consistent coordinate origin. Add a visual calibration page in development.

### Demo fallback

When coordinate mapping is not complete, generate a Sidekick review packet that:

- Identifies the form and revision
- Lists all applicant values
- Lists clinician certification values
- Includes signature records
- Includes a disclaimer that it is a demo output and not the official submission document

Do not label this fallback as an official DMV form.

## Acceptance criteria

- The patient can complete the scripted REG 195 path without seeing clinical jargon.
- Existing uploaded values are confirmed rather than asked again.
- Clinician-owned fields remain provisional until explicit clinician verification.
- Patient and chart conflicts are visible and neither source is deleted.
- Patient signature scope excludes clinician certification.
- Clinician signature scope includes every final clinician-owned field.
- Any change within a signed scope invalidates that signature.
- The exported PDF or review packet is generated from an immutable signed snapshot.
- The UI displays the original-signature caveat for the selected official form revision.
