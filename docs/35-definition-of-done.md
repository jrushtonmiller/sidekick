# Definition of Done

## Feature-level definition

A feature is done when all applicable items are true.

### Product

- User and workflow outcome is documented.
- Acceptance criteria pass.
- Empty, loading, success, and failure states exist.
- Out-of-scope behavior is explicit.
- Copy is understandable for the role.

### Domain logic

- Valid state transitions are enforced server-side.
- Invalid transitions are tested.
- Field ownership is enforced.
- Tenant scope is required.
- Version conflicts are handled.
- Audit event is emitted for protected mutations.

### Security and privacy

- Authentication and role checks exist.
- Parent-resource authorization exists.
- Cross-tenant test exists.
- PHI is not logged or placed in URLs.
- Secrets remain server-side.
- File and input validation is applied.
- Error messages are safe.

### AI

- Capability has an input and output schema.
- Output is validated.
- Allowed field and evidence references are checked.
- Mock fixture exists.
- Failure has a fallback.
- Prompt-injection test exists.
- AI cannot perform prohibited action.

### Accessibility

- Keyboard flow works.
- Labels and errors are programmatic.
- Focus management is correct.
- Status is not color-only.
- Touch controls are usable.
- Automated accessibility check passes.

### Testing

- Unit tests
- API or integration tests
- Authorization tests
- End-to-end happy path
- Relevant failure path
- Test data is synthetic

### Documentation

- API or type changes documented.
- Template changes versioned.
- Environment variables added to example.
- Migration or seed update included.
- Demo script updated when behavior changes.

## MVP definition of done

### Entry and identity

- [ ] Clinic QR or link resolves to the correct organization
- [ ] Patient can authenticate
- [ ] Five demographic identifiers are collected
- [ ] Unique, no-match, and review outcomes are supported
- [ ] No candidate patient details are exposed

### Form selection

- [ ] Patient can describe the need
- [ ] Mock AI identifies REG 195
- [ ] Patient confirms the form
- [ ] Unsupported path creates backlog item and manual guidance

### Patient interview

- [ ] Questions are template-driven
- [ ] Questions use patient-facing language
- [ ] Answers autosave
- [ ] Resume works
- [ ] Patient facts and clinician fields remain separate
- [ ] Review screen covers all patient-scope values
- [ ] Patient signature creates immutable snapshot

### Staff

- [ ] Patient-signed case enters staff queue
- [ ] Completeness checks are deterministic
- [ ] AI-suggested issues are visually separate
- [ ] Staff sees patient conversation and evidence
- [ ] Staff chooses review only or appointment required
- [ ] Disposition is audited

### Clinician

- [ ] Review-only case appears immediately
- [ ] Appointment case is hidden before `availableAt`
- [ ] Form, patient transcript, chart, and provenance are visible
- [ ] Conflicts preserve both sources
- [ ] No certification is preselected
- [ ] Required clinician fields are verified
- [ ] Clinician signature creates immutable snapshot

### Export

- [ ] Export is generated from signed snapshot
- [ ] Demo watermark or official-form status is accurate
- [ ] Layout validation runs
- [ ] Download is protected
- [ ] Original-signature caveat is displayed

### Tenancy and security

- [ ] Two organizations seeded
- [ ] Cross-tenant reads and writes fail
- [ ] Security Rules tests pass
- [ ] Protected storage is private
- [ ] No PHI in logs, URLs, or analytics
- [ ] Demo uses synthetic data only

### Reliability

- [ ] Full demo works with AI provider disabled
- [ ] Upload failure has manual fallback
- [ ] Export failure has review-packet fallback
- [ ] Demo reset works
- [ ] Fake clock works

### Quality

- [ ] Lint passes
- [ ] Type check passes
- [ ] Unit tests pass
- [ ] End-to-end demo tests pass
- [ ] JSON templates and schemas validate
- [ ] Accessibility smoke test passes

## Demo-ready gate

Before presenting:

- [ ] Complete three clean rehearsals
- [ ] Main flow takes no more than five minutes
- [ ] Phone QR path works
- [ ] Every account opens without setup
- [ ] Mock AI is active
- [ ] Export already tested in deployed environment
- [ ] No real patient data appears in history or browser autocomplete
- [ ] Backup recording and screenshots are available
- [ ] Team knows the fallback sequence

## Pilot-ready gate

Not part of the hackathon. Requires:

- [ ] Exact forms and issuer requirements approved
- [ ] Security risk analysis
- [ ] Vendor and BAA review
- [ ] Production identity and MFA
- [ ] Patient matching validation
- [ ] Retention and deletion policy
- [ ] Incident response and recovery
- [ ] Clinical and legal review
- [ ] Accessibility evaluation
- [ ] Human-factors and automation-bias evaluation
- [ ] Limited rollout plan and pause criteria
- [ ] Support and escalation ownership

## Completion rule

Do not mark the product "HIPAA compliant," "clinically validated," or "accepted by DMV" based on the hackathon build. The correct completion claim is:

> Sidekick demonstrates an end-to-end, synthetic-data workflow designed around tenant isolation, source transparency, staff triage, clinician verification, signatures, and PDF export.
