# Form Template Explained for a Nontechnical Teammate

A template JSON is a recipe for a blank form.

This field definition:

```json
{
  "id": "applicant.phone",
  "sectionId": "applicant_information",
  "label": "Telephone number",
  "type": "phone",
  "owner": "patient",
  "required": true,
  "patientQuestion": "What is the best phone number for this application?",
  "allowedSources": [
    "patient_chat",
    "patient_direct_entry",
    "uploaded_document",
    "emr_demographics"
  ],
  "confirmationRequired": true,
  "rendering": {
    "mode": "review_packet",
    "implemented": true
  }
}
```

means:

- The stable field name is `applicant.phone`.
- It belongs in the applicant section.
- The app should use a phone input.
- The patient owns the final value.
- It is required.
- The guided interview uses the supplied patient-friendly question.
- The app may suggest a value from the listed sources.
- The patient still confirms it.
- The demo review packet knows how to display it.

The application loops over these definitions. It does not need code such as:

```ts
if (formName === 'DMV') {
  askForPhone();
}
```

That is why a second form can reuse the same application. A developer writes and reviews a second template instead of rebuilding every screen.

## What remains code

- Authentication
- Tenant isolation
- Workflow transitions
- Signature snapshots
- API authorization
- PDF rendering engine
- AI adapters
- Validation engine

## What becomes template data

- Form sections
- Field labels and types
- Patient questions
- Required flags
- Conditional visibility
- Field ownership
- Allowed evidence sources
- Signature scope
- PDF targets
