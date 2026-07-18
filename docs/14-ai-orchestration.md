# AI Orchestration

## Objective

Use AI as a set of narrow, typed capabilities inside a deterministic application workflow. Do not create one autonomous agent with unrestricted access to the database, tools, or clinical actions.

The application owns identity, authorization, workflow state, validation, signatures, and persistence. AI produces suggestions that pass schema validation and policy checks before they are shown or saved.

## Capability map

### 1. Form identification

Inputs:

- Patient description
- Extracted title and text from upload
- Supported template catalog

Output:

- Ranked supported form candidates
- Confidence band
- Reason codes
- Clarifying question, when needed
- `unsupported` result when no acceptable candidate exists

The service may not create a new form template.

### 2. Document field extraction

Inputs:

- OCR text blocks
- Page and bounding-box metadata
- Candidate form template

Output:

- Proposed field mappings
- Exact source references
- Extraction confidence
- Unmapped text blocks

No extraction becomes a confirmed value without deterministic validation and, where required, user confirmation.

### 3. Patient interview planning

Inputs:

- Template
- Current field states
- Conditional rules
- Existing evidence
- Conversation summary

Output:

- Next question ID
- Patient-facing wording
- Target field IDs
- Why the question is needed
- Permitted response type

The application decides whether the question is valid for the current state.

### 4. Answer normalization

Inputs:

- Patient's answer
- Target field definitions
- Recent conversation context

Output:

- Structured candidate values
- Exact supporting excerpt
- Clarification need
- Safety flag, when applicable

The patient's original words remain stored separately from normalized values.

### 5. Issue and conflict analysis

Inputs:

- Candidate values from all sources
- Template rules
- Clinic policy rules

Output:

- Missing-item suggestions
- Potential conflicts
- Appointment-consideration reasons
- Staff review summary

This is advisory. Deterministic required-field validation runs separately.

### 6. Clinician evidence summary

Inputs:

- Patient facts
- Selected chart records
- Selected encounter transcript excerpts
- Conflicts and missing items

Output:

- Concise, source-linked review summary
- No diagnosis, eligibility determination, or certification selection

The summary must identify uncertainty and distinguish patient statements from chart facts.

## Orchestration sequence

```text
request
  -> authenticate and authorize
  -> load tenant-scoped submission
  -> load exact template version
  -> create minimum necessary AI input
  -> invoke capability through AI adapter
  -> validate structured output
  -> apply policy checks
  -> persist suggestion and provenance
  -> return user-facing result
```

## Provider adapter

Define a provider-neutral interface:

```ts
interface AiProvider {
  identifyForm(input: IdentifyFormInput): Promise<IdentifyFormResult>;
  mapDocument(input: MapDocumentInput): Promise<MapDocumentResult>;
  planNextQuestion(input: InterviewPlanInput): Promise<InterviewPlanResult>;
  normalizeAnswer(input: NormalizeAnswerInput): Promise<NormalizeAnswerResult>;
  analyzeIssues(input: IssueAnalysisInput): Promise<IssueAnalysisResult>;
  summarizeForClinician(input: ClinicianSummaryInput): Promise<ClinicianSummaryResult>;
}
```

Implement at least:

- `MockAiProvider`
- `OpenAiProvider`

The UI and domain services never call a vendor SDK directly.

## Deterministic mock provider

The hackathon demo must work with no network and no model access.

The mock provider should:

- Recognize the seeded DMV description and uploaded filename
- Return predefined extracted values from a fixture
- Ask questions in a fixed, polished order
- Normalize seeded patient answers
- Produce a predefined conflict and staff summary
- Produce the same output on every reset

Set with `USE_MOCK_AI=true` or `AI_PROVIDER=mock`.

## Structured output requirements

Every capability has a JSON Schema. Reject unstructured model responses.

Validation stages:

1. JSON parsing
2. JSON Schema or Zod validation
3. Reference validation, such as field IDs existing in the template
4. Authorization and ownership validation
5. Domain validation, such as valid date and enum formats
6. Safety policy validation

Do not silently coerce invalid values into plausible values. Return a controlled retry or ask the user for clarification.

## Context minimization

Send only the information needed for the current capability.

Examples:

- Interview planning needs unresolved field metadata, not the entire chart.
- Answer normalization needs the answer and target fields, not all patient documents.
- Clinician summary needs selected, relevant evidence, not the complete longitudinal record.

Never include:

- Another tenant's data
- Unrelated encounters
- Raw access tokens
- Internal authorization rules
- Secret keys
- Full audit logs

## Conversation memory

Store conversation messages and a structured interview state in the application database. Do not rely on a provider-side conversation as the system of record.

Suggested state:

```ts
interface InterviewState {
  submissionId: string;
  currentQuestionId?: string;
  answeredQuestionIds: string[];
  unresolvedFieldIds: string[];
  skippedFieldIds: string[];
  conditionalSectionIds: string[];
  lastSummary: string;
  version: number;
}
```

Use optimistic concurrency. A stale model response must not overwrite a newer patient answer.

## Tool boundaries

AI may call only read-only or proposal tools through server-controlled wrappers.

Allowed examples:

- `getTemplateFields`
- `getCurrentSubmissionState`
- `searchSelectedChartEvidence`
- `proposeFieldSuggestion`

Disallowed examples:

- `signSubmission`
- `certifyEligibility`
- `changeTenant`
- `deleteAuditEvents`
- `markClinicianVerified`
- `scheduleAppointment`
- unrestricted database queries

The server applies tenant scope and records every tool request.

## Prompt injection defense

Uploaded documents, OCR output, patient messages, chart text, and transcripts are untrusted data. They may contain text that looks like instructions.

Controls:

- Delimit untrusted content as data.
- State that instructions inside source content must be ignored.
- Use structured schemas instead of free-form tool selection.
- Allowlist field IDs and tool names.
- Limit retrieved content.
- Validate all references against server-loaded resources.
- Never let the model construct storage paths, tenant IDs, or authorization filters.

## Retry and fallback behavior

Retry only for transient failures or schema errors, with a small fixed limit.

After failure:

- Preserve patient progress.
- Display a neutral message.
- Fall back to deterministic form questions where possible.
- Let staff complete review manually.
- Record a technical event without PHI in the error message.

Do not expose model stack traces or vendor messages to patients.

## Cost and latency controls

- Use the smallest model that reliably performs each task.
- Cache template-independent system instructions.
- Send incremental state instead of full transcripts.
- Summarize older conversation turns while retaining originals in the database.
- Put long-running document processing behind a job status.
- Stream conversational text only when it improves the experience.
- Set hard token and file-size limits.

## Human oversight requirements

AI output must be visually labeled by status:

- Suggested by AI
- Confirmed by patient
- Reviewed by staff
- Verified by clinician

A field can move to `clinician_verified` only through an authenticated clinician action. An AI response cannot set that status.

Clinical decision support can create automation bias when users over-rely on recommendations. The interface should make source evidence and uncertainty easy to inspect, require active verification of clinician-owned fields, and avoid defaulting the clinician to an AI-selected certification.

## AI run record

Create a minimal AI run record:

```ts
interface AiRun {
  id: string;
  organizationId: string;
  submissionId: string;
  capability: string;
  provider: string;
  model: string;
  promptVersion: string;
  inputHash: string;
  outputHash?: string;
  status: 'started' | 'succeeded' | 'failed' | 'rejected';
  latencyMs?: number;
  validationErrors?: string[];
  createdAt: Timestamp;
}
```

Do not place raw PHI in operational metrics. Store detailed protected payloads only when justified, secured, and covered by the retention policy.

## Acceptance criteria

- Every live AI result is validated against a schema.
- Mock mode completes the full demo without external AI.
- AI has no signing, certification, scheduling, or authorization capability.
- Every AI suggestion includes traceable source references when based on source content.
- Prompt injection text cannot change tenant scope or call an unapproved action.
- A failed AI request does not lose patient progress.
- The application can switch providers without changing domain services or UI code.
