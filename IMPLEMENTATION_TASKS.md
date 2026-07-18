# Implementation Tasks

## P0: must work for the demo

- [ ] Create responsive Next.js TypeScript application
- [ ] Add `DEMO_MODE`, `USE_MOCK_AI`, and emulator configuration
- [ ] Seed two organizations to prove tenant separation
- [ ] Seed patient, staff, clinician, and admin accounts
- [ ] Resolve a clinic-specific QR or invitation link
- [ ] Register or sign in a patient
- [ ] Match a patient using the five agreed demographic identifiers
- [ ] Create a REG 195 form instance from a JSON template
- [ ] Conduct a plain-language patient interview
- [ ] Save progress and resume
- [ ] Show a plain-language review and rendered-form preview
- [ ] Capture patient attestation
- [ ] Place submission in staff queue
- [ ] Show completeness, conflicts, and appointment-review flags
- [ ] Let staff choose appointment required or review only
- [ ] Hide appointment cases from clinician queue until `availableAt`
- [ ] Show review-only cases immediately
- [ ] Display field source, exact supporting excerpt, and verification status
- [ ] Display patient conversation and mock EMR information
- [ ] Allow clinician edits only to clinician-owned fields
- [ ] Capture clinician signature
- [ ] Export a final PDF snapshot
- [ ] Record an audit timeline
- [ ] Add a one-click demo reset

## P1: strong differentiators

- [ ] Upload a partially completed form image or PDF
- [ ] Extract visible values and ask only missing questions
- [ ] Match uploaded document to supported template
- [ ] Add unsupported-form request to admin backlog
- [ ] Add source conflict flags without overwriting either source
- [ ] Add staff source viewer and clinician source drawer
- [ ] Add mock office-visit transcript and test-result panel
- [ ] Stream patient chat responses
- [ ] Add one polished mobile install/PWA experience

## P2: only after P0 and P1 are stable

- [ ] Real multi-tenant Identity Platform tenants
- [ ] Real patient portal identity federation
- [ ] Real FHIR adapter
- [ ] Real Abridge transcript adapter
- [ ] Real scheduling integration
- [ ] Additional form templates
- [ ] Organization-level template configuration
- [ ] Production retention and deletion workflows
- [ ] Compliance evidence package

## Demo polish

- [ ] Use one synthetic patient story consistently
- [ ] Keep the patient interview under two minutes
- [ ] Use a visible progress indicator
- [ ] Put "AI-assisted, human verified" near clinician actions
- [ ] Make low-confidence and conflicting fields visually obvious
- [ ] Never show raw JSON in the presentation
- [ ] Prepare a recorded fallback walkthrough
