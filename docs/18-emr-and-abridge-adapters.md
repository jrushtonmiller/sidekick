# EMR and Abridge Adapter Boundaries

## Objective

The hackathon uses a fake EMR containing synthetic demographics, office visits, transcript text, diagnoses, test results, and possibly medications. The application should treat this as an adapter so a future FHIR or vendor integration can replace the fixture without rewriting the workflow.

Abridge transcript access should also be behind an adapter. Do not let form logic depend directly on a particular transcript payload.

## Domain interface

```ts
interface ClinicalDataAdapter {
  matchPatient(input: PatientMatchInput): Promise<PatientMatchResult>;
  getPatientSummary(input: PatientScope): Promise<PatientSummary>;
  listEncounters(input: EncounterQuery): Promise<EncounterSummary[]>;
  getEncounter(input: EncounterRef): Promise<EncounterDetail>;
  listConditions(input: PatientScope): Promise<ConditionRecord[]>;
  listObservations(input: ObservationQuery): Promise<ObservationRecord[]>;
  listMedications(input: PatientScope): Promise<MedicationRecord[]>;
  getDocument(input: DocumentRef): Promise<ClinicalDocument>;
}

interface TranscriptAdapter {
  listTranscripts(input: PatientScope): Promise<TranscriptSummary[]>;
  getTranscript(input: TranscriptRef): Promise<TranscriptDetail>;
  searchTranscript(input: TranscriptSearchInput): Promise<TranscriptExcerpt[]>;
}
```

Implement:

- `FixtureClinicalDataAdapter`
- `FixtureTranscriptAdapter`

Future implementations:

- `FhirClinicalDataAdapter`
- `AbridgeTranscriptAdapter`

## Minimum fake EMR data

Seed one synthetic clinic with:

- Patient demographics
- MRN
- Two office visits
- One relevant condition
- One irrelevant condition to prove filtering
- One relevant test or observation
- A medication list
- A recent encounter transcript
- A prior encounter transcript with older or differing information

The clinician screen should not show the entire record by default. Show selected evidence and provide a link or drawer for context.

## Patient matching interface

The demo matching input uses the agreed five demographic elements:

- First name
- Last name
- Date of birth
- Address
- Phone number

The fixture adapter returns:

```ts
interface PatientMatchResult {
  status: 'unique_match' | 'no_match' | 'multiple_matches' | 'manual_review';
  patientId?: string;
  matchedFields: string[];
  differingFields: string[];
  candidates?: Array<{
    patientId: string;
    maskedDisplay: string;
  }>;
}
```

Do not expose multiple patient candidates to the patient with enough detail to disclose another person's information. Route ambiguous matches to staff.

Production patient matching should use an approved identity and matching strategy. Demographic matching alone can produce false matches and missed matches, particularly when data are incomplete or outdated.

## Normalized patient summary

```ts
interface PatientSummary {
  patientId: string;
  organizationId: string;
  mrnMasked: string;
  legalName: HumanName;
  dateOfBirth: string;
  addresses: PostalAddress[];
  phones: string[];
  emails: string[];
}
```

Store source identifiers in the adapter mapping table, not in URLs or client-visible logs.

## Normalized encounter

```ts
interface EncounterDetail {
  id: string;
  organizationId: string;
  patientId: string;
  occurredAt: string;
  type: string;
  clinicianName: string;
  reason?: string;
  diagnoses: ConditionReference[];
  observations: ObservationReference[];
  note?: ClinicalDocumentReference;
  transcript?: TranscriptReference;
}
```

## Transcript representation

```ts
interface TranscriptDetail {
  id: string;
  organizationId: string;
  patientId: string;
  encounterId: string;
  occurredAt: string;
  speakers: Array<{
    id: string;
    role: 'patient' | 'clinician' | 'other' | 'unknown';
  }>;
  segments: Array<{
    id: string;
    speakerId: string;
    startMs?: number;
    endMs?: number;
    text: string;
  }>;
}
```

Every excerpt used as provenance references segment IDs. Do not reference only a generated summary.

## Retrieval policy

The application, not the model, defines the search scope.

Example:

1. User opens a REG 195 submission.
2. Server loads the patient and exact tenant.
3. Server queries recent encounters within a configurable window.
4. Server retrieves candidate conditions and mobility-related evidence.
5. Server sends selected evidence to an AI summarizer.
6. AI returns evidence IDs, not arbitrary chart references.

Do not give an AI agent unrestricted longitudinal-record search.

## Relevance strategy

For the demo, use deterministic tags on fixture data:

```ts
interface ClinicalRecordTags {
  formDomains: Array<'mobility' | 'work_disability' | 'school' | 'insurance'>;
  relevance: 'high' | 'medium' | 'low';
}
```

A future implementation may use terminology services, embeddings, or search, but must preserve the ability to inspect why a record was selected.

## FHIR mapping for future work

Potential resource mappings:

- Patient -> patient demographics
- Encounter -> office visits
- Condition -> diagnoses and problem list
- Observation -> test results and measured findings
- MedicationRequest or MedicationStatement -> medications
- DocumentReference -> notes and documents
- Questionnaire and QuestionnaireResponse -> form template and answers, when appropriate
- Provenance -> source lineage
- Practitioner and PractitionerRole -> clinician identity and role

Use FHIR as an exchange boundary, not necessarily as the internal UI model. Normalize into domain objects.

## Abridge boundary

An Abridge adapter should accept an encounter or transcript reference and return normalized segments and metadata. It should not:

- Decide form eligibility
- Write form fields directly
- Change workflow state
- Expose another tenant's transcript
- Return unscoped search results

Store only the transcript content needed for the authorized workflow, subject to agreements and retention policy.

## Link behavior in the clinician UI

A source link should open a protected application route such as:

```text
/clinician/submissions/{submissionId}/evidence/{evidenceId}
```

The server resolves the evidence ID after authorization. Do not put an external medical-record identifier or raw transcript text in the URL.

## Outage and stale-data behavior

When the adapter is unavailable:

- Continue showing previously synchronized data with a "last updated" timestamp.
- Do not imply the chart is current.
- Let staff or clinician proceed manually when policy allows.
- Record the integration error without PHI.
- Do not replace unavailable chart data with model-generated guesses.

## Demo fixtures

Recommended fixture files:

```text
seed/organizations.json
seed/users.json
seed/patients.json
seed/encounters.json
seed/conditions.json
seed/observations.json
seed/medications.json
seed/transcripts.json
```

A single `demo-seed.json` is acceptable for speed, but domain adapters should expose the normalized interfaces above.

## Acceptance criteria

- All mock clinical and transcript data are synthetic.
- Form workflow code depends on adapter interfaces, not fixture structure.
- Every returned record is tenant and patient scoped.
- Transcript evidence links to exact segments.
- The AI sees only server-selected records.
- Ambiguous patient matches route to staff without exposing other patients.
- Adapter outage does not erase progress or generate fabricated clinical data.
