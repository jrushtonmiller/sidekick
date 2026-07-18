# Risk Register

## Scoring

Use:

- Likelihood: low, medium, high
- Impact: low, medium, high, critical
- Owner: product, engineering, security, clinical, operations, legal, or vendor

A risk is not closed merely because a technical control exists. Validate the control in the real workflow.

## Product and scope risks

### R1. Hackathon scope expands to multiple incomplete forms

- Likelihood: high
- Impact: high
- Early signal: form-specific branches added before DMV flow is complete
- Mitigation: complete one REG 195 vertical slice; add forms only as templates after demo readiness
- Contingency: cut additional forms and show template architecture
- Owner: product

### R2. The wrong DMV form is implemented

- Likelihood: medium
- Impact: high
- Early signal: user or clinical partner names a different form number
- Mitigation: label REG 195 as an assumption; keep template replaceable; confirm before coordinate polish
- Contingency: use the Sidekick review packet and swap template metadata
- Owner: product

### R3. Product story becomes "AI chatbot" rather than clinic workflow

- Likelihood: medium
- Impact: high
- Mitigation: demo patient, staff, and clinician stages; lead with burden reduction and source-linked review
- Owner: product

## Clinical and human-factors risks

### R4. Clinician over-relies on AI suggestion

- Likelihood: medium
- Impact: critical
- Controls: no preselected certification; source evidence; explicit verification; conflict display; no accept-all action; training and evaluation
- Residual risk: remains because time pressure and interface defaults can influence behavior
- Owner: clinical and product

### R5. Patient answer is converted into an unsupported clinical conclusion

- Likelihood: medium
- Impact: critical
- Controls: separate patient facts from clinician fields; prohibit diagnosis and eligibility determination; schema and prompt tests; clinician final ownership
- Owner: engineering and clinical

### R6. Patient misunderstands attestation scope

- Likelihood: medium
- Impact: high
- Controls: plain-language review; separate patient and clinician sections; explicit scope; comprehension testing
- Owner: product and legal

### R7. Emergency or urgent health statement appears in form chat

- Likelihood: low to medium
- Impact: critical
- Controls: clinic-approved safety message; do not provide diagnosis; log and route according to policy; clarify that form chat is not monitored for emergencies
- Owner: clinical and operations

### R8. Staff treats AI appointment suggestion as a decision

- Likelihood: medium
- Impact: high
- Controls: label as consideration; require staff action and reason; audit decision; no automatic routing
- Owner: operations

## Privacy and security risks

### R9. Cross-tenant data exposure

- Likelihood: medium without controls
- Impact: critical
- Controls: tenant ID on every resource; server scope; locked Security Rules; cross-tenant tests; tenant-aware caches and jobs
- Owner: security and engineering

### R10. Patient accesses another patient's form by changing an ID

- Likelihood: medium without controls
- Impact: critical
- Controls: ownership check on parent submission; opaque IDs; role-shaped API; authorization tests
- Owner: engineering

### R11. PHI leaks through logs or analytics

- Likelihood: high without discipline
- Impact: critical
- Controls: logging allowlist; no request body capture; analytics event policy; redaction tests; monitoring labels contain no PHI
- Owner: security and operations

### R12. Public or long-lived document URL is shared

- Likelihood: medium
- Impact: critical
- Controls: private bucket; authenticated download; short-lived signed URL; access audit; no PHI filename
- Owner: engineering

### R13. Demo uses real patient information

- Likelihood: medium under time pressure
- Impact: critical
- Controls: visible synthetic banner; seeded fixtures; team rule; no production connectors; reset and screenshots use fixtures
- Owner: all team members

### R14. Prompt injection extracts or changes unauthorized data

- Likelihood: medium
- Impact: critical
- Controls: untrusted-data delimiters; allowlisted fields and tools; server-selected sources; schema validation; injection test suite
- Owner: AI engineering and security

### R15. Malicious upload compromises processing service

- Likelihood: low to medium
- Impact: critical
- Controls: file signature validation; size limits; malware scan; sandboxed rendering; no macros; private storage
- Owner: security and engineering

## Identity risks

### R16. Five-identifier match links the wrong patient

- Likelihood: medium
- Impact: critical
- Controls: thresholds; manual review; never show candidates to patient; audit links; future portal identity
- Owner: clinical operations and engineering

### R17. Duplicate patient is created

- Likelihood: medium
- Impact: high
- Controls: normalization; no-match review; merge process future; clear linked versus unlinked status
- Owner: operations

### R18. Disabled employee retains access

- Likelihood: low to medium
- Impact: critical
- Controls: membership disable; session revocation; periodic access review; MFA; termination process
- Owner: admin and security

## AI quality and reliability risks

### R19. AI identifies the wrong form with high confidence

- Likelihood: medium
- Impact: high
- Controls: exact title and form-number anchors; patient confirmation; unsupported threshold; severe evaluation metric
- Owner: AI engineering

### R20. OCR extracts a wrong value

- Likelihood: high for poor images
- Impact: high
- Controls: confidence bands; image crop; patient confirmation; type validation; clinician verification
- Owner: engineering

### R21. AI fabricates a missing value

- Likelihood: medium without controls
- Impact: critical
- Controls: structured output; source references; no-value policy; curated evaluations; reject invalid output
- Owner: AI engineering

### R22. Live provider is unavailable during demo

- Likelihood: medium
- Impact: high
- Controls: mock provider default; local fixtures; no-network rehearsal
- Owner: engineering

### R23. AI latency makes the product feel slow

- Likelihood: medium
- Impact: medium
- Controls: narrow calls; streaming; progress; cached template content; deterministic question fallback
- Owner: engineering

## Workflow risks

### R24. Appointment case appears too early in clinician queue

- Likelihood: medium
- Impact: high
- Controls: server filter on `availableAt`; fake-clock tests; no client-only filtering
- Owner: engineering

### R25. Signed content changes without re-signature

- Likelihood: medium without design
- Impact: critical
- Controls: immutable snapshots; field-scope hashes; invalidation rules; version checks; tamper tests
- Owner: engineering and security

### R26. Two reviewers overwrite each other

- Likelihood: medium
- Impact: high
- Controls: expected version; claims; 409 conflict; idempotency
- Owner: engineering

### R27. Unsupported form creates a dead end

- Likelihood: high
- Impact: medium
- Controls: clear manual path; admin backlog; clinic support message
- Owner: product

## Legal and compliance risks

### R28. Team claims HIPAA compliance without evidence

- Likelihood: medium
- Impact: high
- Controls: use "HIPAA-oriented" or "designed to support" language; synthetic data; list required production controls
- Owner: product and legal

### R29. Vendor or feature is not covered by BAA

- Likelihood: medium
- Impact: critical
- Controls: procurement review by exact service and feature; data-flow inventory; no PHI before approval
- Owner: security and legal

### R30. Electronic signature is not accepted by form issuer

- Likelihood: high for some government forms
- Impact: high
- Controls: issuer-specific policy; original-signature warning; print and wet-sign fallback; no acceptance claim
- Owner: legal and operations

### R31. Official form changes

- Likelihood: medium over time
- Impact: high
- Controls: template versioning; source revision and checksum; periodic review; retire old templates
- Owner: product and operations

## Operational risks

### R32. Queue backlog grows unnoticed

- Likelihood: medium
- Impact: high
- Controls: age metrics; alerts; ownership; escalation policy
- Owner: operations

### R33. Export rendering truncates required text

- Likelihood: medium
- Impact: high
- Controls: layout validation; visual regression; review packet fallback; clinician preview
- Owner: engineering

### R34. Data deletion leaves orphaned files

- Likelihood: medium
- Impact: high
- Controls: lifecycle job; reconciliation; deletion tombstone; verify all storage artifacts
- Owner: engineering and security

### R35. Abridge or EMR adapter is stale or unavailable

- Likelihood: medium
- Impact: medium to high
- Controls: last-updated label; cached authorized data; manual flow; no fabricated replacement
- Owner: engineering and operations

## Risk review cadence

- Before hackathon demo: review all high and critical demo risks
- Before pilot: formal cross-functional review
- Monthly during pilot
- After incidents, material model changes, form revisions, or integration changes

## Acceptance criteria

- Every critical risk has an owner and tested control before production.
- Demo-specific failure risks have fallbacks.
- Residual clinical and legal risks are stated, not hidden.
- Risk register is updated when scope, vendors, forms, or models change.
