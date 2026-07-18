# Testing and AI Evaluation

## Testing strategy

Test the application in layers:

1. Pure domain logic
2. Data validation
3. Authorization and Security Rules
4. API contracts
5. Adapter contracts
6. UI components
7. End-to-end workflows
8. AI capability evaluation
9. Security and abuse testing
10. PDF rendering and signature integrity

The deterministic demo path must pass without network access.

## Unit tests

### Workflow transitions

Test every allowed and denied transition:

- Draft to interview
- Interview to patient review
- Patient review to patient signed
- Patient signed to staff review
- Staff review to review-only clinician queue
- Staff review to appointment hold
- Appointment hold to clinician availability
- Clinician review to completed
- Signed value change to signature invalidated

### Form rules

- Required fields
- Conditional fields
- Hidden fields
- Enumeration validation
- Date validation
- Field ownership
- Signature scope
- Template version binding

### Queue availability

Use a fake clock. Test:

- Review-only item visible now
- Appointment item hidden before `availableAt`
- Appointment item visible at `availableAt`
- Time-zone conversion
- Appointment update changes availability with audit event

### Patient matching

- Exact unique match
- Normalized phone match
- Address formatting difference
- No match
- Multiple match
- Missing field
- Cross-tenant patient with identical demographics does not match

## Schema tests

Validate:

- Every form template against JSON Schema
- Every seeded AI result against its output schema
- Every workflow event fixture
- Every API request and response fixture
- No unknown field IDs
- No circular form rules
- No rendering target pointing to an absent field

## Authorization tests

Create a matrix for each endpoint and role.

At minimum:

- Patient A cannot read Patient B in same clinic
- Patient cannot read staff notes
- Staff cannot sign as clinician
- Clinician cannot manage templates
- Admin cannot edit clinician certification
- Clinic A user cannot access Clinic B data by changing an ID
- Disabled membership cannot access
- Client-provided role and organization are ignored
- Background job with wrong tenant fails
- Evidence cannot be accessed without access to parent submission

Test Firestore and Storage Rules in the emulator.

## API contract tests

- Correct status codes
- Idempotency behavior
- Version conflict behavior
- Role-shaped responses
- Field validation
- Error payload contains no protected values
- Rate limit behavior
- File-size and type rejection

## End-to-end workflows

### Scenario 1: polished success path

1. Open Clinic A QR link.
2. Sign in as patient.
3. Match synthetic patient.
4. Describe need.
5. Confirm REG 195.
6. Complete interview.
7. Review and sign.
8. Sign in as staff.
9. Choose review only.
10. Sign in as clinician.
11. Review sources and verify fields.
12. Sign and export.

### Scenario 2: upload and fill gaps

- Upload fixture with several applicant fields filled.
- Confirm extracted values.
- Verify that the interview skips those fields.
- Correct one low-confidence extraction.

### Scenario 3: appointment path

- Patient reports a new condition not in chart.
- Staff chooses appointment required.
- Item is absent from clinician ready queue.
- Advance fake clock to appointment time.
- Item appears.

### Scenario 4: conflict

- Patient reports June onset.
- Chart reports March onset.
- Both sources remain visible.
- Clinician resolves with reason.

### Scenario 5: signature invalidation

- Patient signs.
- Patient edits request type.
- Signature becomes invalid.
- Staff routing is blocked until re-signature.

### Scenario 6: tenant isolation

- Repeat ID guesses across two seeded clinics.
- No cross-tenant data appears.

## AI evaluation philosophy

Generative AI testing is not one accuracy number. Evaluate each narrow capability with curated examples, structured metrics, and failure categories.

AI can introduce automation bias when reviewers over-rely on suggestions. The product must evaluate not only model output, but also human interaction, including whether reviewers notice errors, inspect evidence, and retain decision authority.

## Form identification evaluation

Dataset:

- Supported DMV descriptions
- Similar unsupported forms
- Vague disability requests
- Wrong issuer
- Uploaded title variations
- OCR spelling errors
- Adversarial document instructions

Metrics:

- Top-1 match accuracy
- Unsupported precision and recall
- Clarification rate
- High-confidence false-match rate

High-confidence false matches should be treated as a severe failure.

## Document extraction evaluation

Use synthetic scans with:

- Typed values
- Handwriting
- Blur
- Rotation
- Glare
- Blank and marked checkboxes
- Multiple pages
- Partially cropped pages

Metrics per field:

- Exact match
- Normalized match
- Mapping accuracy
- Confidence calibration
- Source-region accuracy
- Patient correction rate

Never evaluate only OCR text accuracy. Field mapping and source linkage matter to the workflow.

## Interview planning evaluation

For each fixture state, define the expected next action and acceptable questions.

Metrics:

- Correct target field
- No repeated confirmed question
- No clinician certification question to patient
- Plain-language quality
- One-concept rule
- Appropriate clarification
- Completion detection

## Answer normalization evaluation

Failure categories:

- Fabricated date
- Lost uncertainty
- Wrong unit
- Incorrect enum
- Diagnosis inferred from symptom
- Answer mapped to wrong field
- Original patient meaning changed

Require zero fabricated required values in the release evaluation set.

## Conflict evaluation

Test:

- Direct disagreement
- Newer patient information
- Terminology alignment
- No true conflict
- Old versus recent chart source
- Multiple chart sources

Metrics:

- Conflict recall
- False-positive rate
- Preservation of both evidence IDs
- Correct dates and labels
- No unsupported truth selection

## Clinician summary evaluation

Clinician or medically knowledgeable reviewers assess:

- Source fidelity
- Clear patient-versus-chart attribution
- Material conflict inclusion
- Omission of eligibility determination
- No new clinical claims
- Usefulness and concision

## Safety and adversarial AI tests

- Prompt injection in uploaded form
- Prompt injection in transcript
- Request to reveal another tenant
- Fake field ID
- Request to sign
- Request to choose certification
- Hidden text
- Extremely long answer
- Profanity or irrelevant content
- Health-emergency statement

Expected behavior is schema-valid refusal, escalation, or controlled application response.

## Human-factors testing

Before production, conduct task-based usability evaluation with representative patients, staff, and clinicians.

Observe:

- Whether patients understand questions and attestation
- Whether staff distinguishes AI suggestion from decision
- Whether clinicians inspect evidence
- Whether source badges are discoverable
- Whether default layout causes over-reliance
- Whether low-confidence fields receive more attention
- Whether future appointment cases create noise
- Time to complete common tasks

Do not rely solely on self-reported satisfaction.

## Plain-language review

Use:

- Patient reviewers
- Readability checks as a screening tool, not the only measure
- Teach-back or comprehension questions
- Terminology review
- Spanish and other language review by qualified humans when localized

CDC and health-literacy literature support organizing information for the audience, using common words, and making spoken and written communication easier to understand and act on.

## PDF tests

- Coordinate snapshots by form revision
- Visual regression images for each page
- Long text
- Unicode characters
- Checkbox combinations
- Empty optional fields
- Temporary versus permanent branch
- Signature rendering
- Demo watermark
- Hash stability
- Export from immutable snapshot

## Performance tests

Hackathon targets:

- Patient interaction feels immediate under mock mode
- Common reads under 500 ms locally or in staging
- AI response has visible progress and fallback
- Upload processing does not block navigation
- Queue page supports at least hundreds of synthetic items

Production targets require load and capacity planning.

## Release gates

P0 demo release:

- All deterministic end-to-end scenarios pass
- Zero cross-tenant authorization failures in test suite
- Zero AI actions that sign or verify clinician fields
- Templates and fixtures validate
- PDF export completes
- Demo reset completes
- No real PHI in seed or screenshots

Production pilot release adds:

- Security risk assessment
- Vendor and BAA review
- Penetration testing
- Clinical and operational validation
- Human-factors testing
- Accessibility audit
- Incident and recovery drills
- Monitored limited rollout

## Medical and human-factors references

- Goddard K, Roudsari A, Wyatt JC. Automation bias: a systematic review of frequency, effect mediators, and mitigators. Journal of the American Medical Informatics Association. 2012;19(1):121-127. PMID 21685142.
- Lyell D, Coiera E. Automation bias and verification complexity: a systematic review. Journal of the American Medical Informatics Association. 2017;24(2):423-431. doi:10.1093/jamia/ocw105. PMID 27516495.
- Lyell D, Magrabi F, Raban MZ, et al. Automation bias in electronic prescribing. BMC Medical Informatics and Decision Making. 2017;17:28. doi:10.1186/s12911-017-0425-5. PMID 28302112.
- Nouri SS, Rudd RE. Health literacy in the oral exchange: an important element of patient-provider communication. Patient Education and Counseling. 2015;98(5):565-571. doi:10.1016/j.pec.2014.12.002. PMID 25620074.
- CDC, Plain Language Materials and Resources: https://www.cdc.gov/health-literacy/php/develop-materials/plain-language.html

## Acceptance criteria

- Deterministic demo tests run offline.
- Authorization tests cover every role and tenant boundary.
- AI evaluation is capability-specific and versioned.
- Prompt-injection and prohibited-action tests pass.
- PDF visual regression covers the demo branch.
- Human-factors risks, including automation bias, are tested before production use.
- Plain-language content is reviewed with representative patients, not only scored by software.
