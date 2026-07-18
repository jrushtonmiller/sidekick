# Accessibility, Plain Language, and Content Design

## Product objective

The form assistant should reduce cognitive and administrative burden. Accessibility and plain language are functional requirements, not final polish.

## Standards target

Target WCAG 2.2 AA for patient, staff, clinician, and admin experiences.

Key requirements:

- Keyboard access
- Logical focus order
- Visible focus
- Programmatic labels and instructions
- Error identification and recovery
- Sufficient contrast
- Text resizing and reflow
- Touch target size
- Screen-reader announcements
- No information conveyed by color alone
- Captions or transcripts for any media
- Reduced motion support

## Mobile-first patient layout

- Single main column
- One primary action per screen
- Large controls
- Persistent progress and save status
- Short question text
- Help in expandable sections
- Avoid horizontal scrolling
- Keep signature review readable at 200 percent zoom

## Workforce layout

Staff and clinician dashboards may be dense, but still require:

- Keyboard-operable tables
- Responsive list alternative
- Skip links
- Sticky headings that do not cover focused content
- Accessible drawers and dialogs
- Announced queue updates
- Clearly associated field status and source controls

## Chat accessibility

- Use a standard form control for patient input.
- Associate assistant messages with an accessible region.
- Avoid repeatedly moving focus when a new message appears.
- Announce a new question without reading the entire conversation.
- Provide non-chat review and edit screens.
- Make quick-reply choices standard buttons or radios.
- Do not use typing animation that delays access to text.

## Source badges and evidence

A hover-only explanation is insufficient.

Implement:

- Focusable info button
- Accessible name, such as "View source for onset date"
- Click or Enter opens popover or drawer
- Escape closes and returns focus
- Touch support
- Source label in text, not color alone

## Conflict display

Do not use red versus green alone. Include:

- "Patient said"
- "Chart says"
- Dates
- Conflict icon with text
- Resolution status

Keep both statements readable by screen readers in logical order.

## Plain-language principles

CDC guidance emphasizes organizing for the audience, putting important messages first, using common words, and dividing information into logical chunks.

Apply:

- Use everyday words before medical terms.
- Define necessary medical or legal terms.
- Use active voice.
- Ask one concept at a time.
- Put action first.
- Use examples sparingly.
- Avoid unexplained abbreviations.
- Avoid blame or judgment.
- Do not ask patients to interpret a legal certification category.

## Content transformation examples

### Official wording

> Description of illness or disability

### Patient question

> What health condition is your clinician treating that affects your ability to walk or get around?

### Follow-up

> What happens when you walk from a parking area into a building?

### Review label

> What you told us about walking and mobility

## Sensitive questions

Before asking sensitive information:

- Explain why it is needed.
- State who will review it.
- Allow a patient to pause.
- Provide an "I do not know" option when safe.
- Avoid asking for unrelated history.

## Error messages

Structure:

1. What happened
2. What the user can do
3. Whether progress is saved

Example:

> We could not read this photo clearly. Your progress is saved. Retake the photo or continue by answering the questions.

Avoid:

> OCR confidence threshold failed.

## Status messages

Use plain operational language:

| Internal status | Patient label |
|---|---|
| `draft` | In progress |
| `patient_review` | Ready for your review |
| `staff_review_pending` | Sent to clinic staff |
| `appointment_required` | Appointment needed |
| `clinician_review_pending` | Ready for clinician review |
| `completed` | Completed |

## Attestation content

- Use concise sentences.
- Identify signed sections.
- Avoid combining consent, privacy notice, and truth attestation in one checkbox.
- Do not preselect.
- Provide print or download access to signed content where policy allows.
- Test comprehension with patients.

## Language and localization

English-only is acceptable for the hackathon, but architecture should:

- Store locale on the user and submission
- Separate UI copy from code
- Version translated attestations
- Preserve original patient language
- Record translation source
- Support right-to-left layouts in component design

For medical and legal content, use qualified human review. Machine translation can draft but should not be the sole approval mechanism.

## Reading-level tools

Readability scores can identify long words and sentences but cannot prove comprehension or clinical accuracy. Use them as a screening tool, followed by patient review and task testing.

## Teach-back-inspired testing

During usability testing, ask participants to explain:

- What Sidekick will do
- What the patient is signing
- What the clinician still decides
- What happens after submission
- What to do if the form is unsupported

Do not test by asking only "Do you understand?"

## Health and emergency copy

Production safety copy needs clinical, operational, and legal review. It should be direct, localizable, and not imply real-time monitoring.

Example placeholder:

> Sidekick is for form preparation and is not monitored for emergencies. If you think you may be having a medical emergency, call your local emergency number or seek urgent care.

Do not present this repeatedly during routine questions unless triggered or placed in persistent help.

## Accessibility testing

Automated:

- Axe or equivalent
- HTML validation
- Color contrast
- Keyboard smoke test

Manual:

- Screen reader on mobile and desktop
- 200 and 400 percent zoom or reflow checks
- Voice control where possible
- Touch target review
- Error recovery
- Low-vision contrast and focus
- Reduced motion

Representative-user testing is required before production.

## References

- CDC, Plain Language Materials and Resources: https://www.cdc.gov/health-literacy/php/develop-materials/plain-language.html
- CDC, What Is Health Literacy?: https://www.cdc.gov/health-literacy/php/about/index.html
- W3C, Web Content Accessibility Guidelines 2.2: https://www.w3.org/TR/WCAG22/
- Nouri SS, Rudd RE. Health literacy in the oral exchange. Patient Education and Counseling. 2015;98(5):565-571. doi:10.1016/j.pec.2014.12.002. PMID 25620074.

## Acceptance criteria

- Patient flow works with keyboard and screen reader.
- Evidence explanations work without hover.
- Status and conflicts are not color-only.
- Patient questions use reviewed plain language.
- Attestation scope is understandable in usability testing.
- Automated accessibility checks have no critical violations.
- Localization-ready copy is separated from business logic.
