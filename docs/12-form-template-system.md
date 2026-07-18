# Form Template System

## Plain-language explanation

A form template is a recipe for a blank form. It is not a patient's completed form.

The recipe says:

- Which fields exist
- Which section each field belongs to
- Who is responsible for the final value
- How the app should ask about it
- Whether it is required
- When it should appear
- Which sources may suggest a value
- Where it is printed in the PDF

The app reads the recipe and generates the interview and review screens. Adding a new form should primarily mean adding a new template file, not adding a new set of hard-coded screens.

## Minimal example

```json
{
  "id": "applicant.phone",
  "label": "Telephone number",
  "type": "phone",
  "owner": "patient",
  "required": true,
  "patientQuestion": "What is the best phone number for the DMV application?",
  "allowedSources": ["patient_chat", "uploaded_document", "emr_demographics"],
  "rendering": {
    "page": 2,
    "target": "applicant_phone"
  }
}
```

The UI loops through field definitions instead of containing logic such as:

```ts
if (form === 'REG195') askPhone();
```

## Template structure

```ts
interface FormTemplate {
  schemaVersion: '1.0';
  key: string;
  version: string;
  name: string;
  issuer: string;
  sourceUrl?: string;
  supportedOrganizations?: string[];
  formSelection: FormSelectionMetadata;
  sections: FormSection[];
  fields: FormFieldDefinition[];
  rules: FormRule[];
  rendering: FormRenderingDefinition;
}
```

## Field ownership

### `patient`

The patient is the author and signer of the final value.

### `clinician`

The clinician is the final author. Patient, upload, transcript, and EMR sources may provide provisional facts, but cannot finalize the field.

### `staff`

Administrative routing or clinic processing field.

### `system`

Derived value such as completion status or template version. Do not use system ownership for a clinical judgment.

## Suggested values versus final values

Each clinician-owned field can define `patientMaySuggest: true`. This does not mean the patient certifies the field. It means the interview may collect relevant facts.

Example:

- Official field: "Description of illness or disability"
- Patient question: "What condition has your clinician diagnosed that makes walking or getting around difficult?"
- Patient answer: "Arthritis in both knees"
- Chart source: "Bilateral knee osteoarthritis"
- Clinician final value: "Bilateral knee osteoarthritis causing substantial mobility limitation"

The clinician selects the final wording.

## Conditional logic

Rules use declarative expressions:

```json
{
  "when": { "field": "request.type", "includes": "license_plates" },
  "then": { "showSection": "vehicle_information" }
}
```

Supported MVP operators:

- `equals`
- `notEquals`
- `includes`
- `isTrue`
- `isFalse`
- `isPresent`
- `all`
- `any`

Do not embed executable JavaScript in template data.

## Interview metadata

A field may define:

- `patientQuestion`
- `patientHelpText`
- `clarificationPrompts`
- `unknownAllowed`
- `sensitive`
- `groupWith`
- `confirmationRequired`

The model may adapt wording, but the field definition sets the intent and safety boundaries.

## Source priority

The template can declare allowed sources, not an automatic truth hierarchy.

Example:

```json
"allowedSources": [
  "patient_chat",
  "uploaded_document",
  "emr_condition",
  "encounter_transcript",
  "clinician"
]
```

When sources disagree, preserve the disagreement. Do not choose silently based only on priority.

## Validation

Every template must pass JSON Schema validation and custom checks:

- Unique field IDs
- Valid section references
- Valid conditional references
- At least one question for patient-collected fields
- Clinician signatures cannot be patient-owned
- Patient attestations cannot include clinician-only certification fields
- Rendering targets exist or are marked unimplemented
- No circular condition dependencies

## Versioning

Never edit an active template in place after submissions exist.

- `1.0.0`: initial template
- `1.0.1`: wording or rendering correction that does not change meaning
- `1.1.0`: new optional fields or rules
- `2.0.0`: changed form revision or meaning

A submission stores the exact template version used.

## Authoring workflow for the hackathon

1. Developer reads the official form.
2. Developer writes the JSON field list and rules.
3. Developer maps PDF coordinates or named rendering targets.
4. Template validator runs.
5. Clinician/product owner reviews the template.

OCR-assisted template authoring is future work. It is not part of the hackathon.
