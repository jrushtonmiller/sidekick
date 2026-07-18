# Security, Privacy, and HIPAA-Oriented Architecture

## Important qualification

This document describes a security and privacy architecture. It is not a certification of HIPAA compliance and is not legal advice.

A production deployment that creates, receives, maintains, or transmits protected health information on behalf of a covered entity requires more than secure code. It requires the correct legal relationships, business associate agreements, risk analysis, policies, workforce practices, incident response, vendor management, configuration, monitoring, and ongoing evidence.

The hackathon must use synthetic data. Do not enter real patient data into an environment that has not been approved for PHI.

## Regulatory framing

The HIPAA Privacy Rule establishes protections and limits for protected health information, and the HIPAA Security Rule requires safeguards for electronic protected health information. HHS also describes business associate contracts as a required mechanism when a covered entity uses a vendor to perform covered functions involving PHI.

Design goals for Sidekick:

- Minimum necessary access and data use
- Unique authenticated users
- Role and tenant-based authorization
- Auditability
- Integrity of signed content
- Secure transmission and storage
- Controlled vendor access
- Incident detection and response
- Data lifecycle management
- Patient rights and clinic obligations supported by operational processes

## Data classification

### Restricted health data

- Patient identifiers
- Form answers
- Uploaded forms
- Patient conversation
- Abridge transcript content
- EMR records
- Clinician notes
- Signatures
- Exported forms
- Provenance excerpts

### Sensitive operational data

- User membership
- Clinician license information
- Audit events
- Security alerts
- Integration identifiers

### Public or low sensitivity

- Clinic display name
- Supported-form marketing descriptions
- Public help content
- Opaque clinic entry token, provided it contains no PHI and can be revoked

Classification drives logging, retention, access, and encryption decisions.

## Threat model

At minimum, address:

- Patient accessing another patient's submission
- Staff or clinician crossing tenant boundaries
- Privilege escalation through client-controlled role data
- Insecure direct object reference
- Public or overly broad storage access
- Leaked tokens in URLs, logs, or screenshots
- Session theft
- Credential stuffing
- Malicious file upload
- Prompt injection through forms, transcripts, or chart text
- AI returning unauthorized identifiers
- Stale AI output overwriting new data
- Signature replay or application to changed content
- PHI in analytics or monitoring labels
- Overly broad developer or support access
- Data remaining after required deletion
- Export downloaded through an unprotected link

## Authentication

### Hackathon

Use Firebase Authentication with seeded demo accounts or a simple approved sign-in method. Require authentication for all protected routes.

### Production direction

- Use Google Cloud Identity Platform or an equivalent identity service.
- Require multifactor authentication for staff, clinicians, and admins.
- Consider phishing-resistant authenticators for privileged users.
- Use recent-authentication checks for signing and role changes.
- Apply rate limits and abuse protections.
- Use secure, HTTP-only, same-site session cookies for server-rendered web access when practical.
- Revoke sessions when membership is disabled.

NIST SP 800-63-4 provides a risk-based framework for identity proofing, authentication, and federation. Select assurance requirements based on the application's risk analysis rather than treating a hackathon login as sufficient for production.

## Authorization

### Non-negotiable checks

Every protected action verifies:

1. Authenticated user
2. Active membership
3. Organization match
4. Role permission
5. Resource relationship
6. Workflow state
7. Field ownership
8. Expected version

Do not rely on hidden buttons or client routing for authorization.

### Membership as source of truth

Use membership records for organization-specific roles. A global profile does not authorize access.

Custom claims may accelerate common checks, but the backend must validate tokens and reconcile sensitive actions against active membership. Role changes may not be visible until token refresh, so disabling a user should also revoke sessions or check server-side membership.

### Patient authorization

A patient can access only submissions linked to their authenticated user and organization. Avoid collection queries that depend solely on client-provided filters.

### Workforce authorization

Staff, clinicians, and admins can access only the minimum resources needed for their role. A clinician does not automatically get template-administration rights. Staff cannot sign or certify.

## Multi-tenant isolation

Defense in depth:

- Every tenant-owned document includes `organizationId`.
- Storage paths start with organization scope.
- Server queries include tenant scope.
- Security Rules verify tenant membership.
- Background jobs carry tenant context and reauthorize before writes.
- Cache keys include organization ID.
- Search indexes are tenant-filtered.
- AI inputs are assembled from one authorized tenant and submission.
- Tests attempt cross-tenant reads and writes for every resource type.

For the hackathon, logical multi-tenancy in one project is acceptable when rules and server checks are tested. Google Cloud Identity Platform can provide authentication multi-tenancy later, but identity tenants do not replace application-data authorization.

## Firestore and Storage rules

Start locked. Never deploy test-mode rules to a shared environment.

Recommended pattern:

- Direct client access only for narrowly scoped patient reads and writes, or use server routes for all PHI.
- Sensitive transitions, staff actions, clinician verification, signatures, and exports are server-only.
- Storage objects are private.
- Upload writes require an authorized submission and randomized path.
- Downloads require authorization or a short-lived signed URL generated after authorization.

Rules are part of the codebase and test suite.

## Server and secret management

- Keep AI, storage signing, admin SDK, and integration credentials server-side.
- Store secrets in Secret Manager or equivalent.
- Never expose service account keys in the repository or browser bundle.
- Use separate projects and credentials for development, staging, and production.
- Grant service accounts the least permissions required.
- Rotate credentials and document ownership.

## Encryption

- Use TLS for all network communication.
- Rely on approved cloud encryption at rest, with customer-managed keys when required by risk and policy.
- Protect backups and replicas to the same standard.
- Do not add homegrown field encryption unless the team can operate key management safely.
- Consider application-layer encryption for especially sensitive fields only after defining search, access, and recovery needs.

Encryption does not replace authorization or lifecycle controls.

## AI vendor controls

Before sending PHI to an AI provider in production:

- Execute an appropriate BAA.
- Confirm that the specific API features, models, tools, regions, and retention controls are covered.
- Configure provider retention and storage settings appropriately.
- Disable provider-side persistence when not needed.
- Do not use non-covered tools, such as live web search, with PHI.
- Send minimum necessary context.
- Keep the application database as the system of record.
- Document subcontractors and data flows.
- Evaluate output safety and monitor failures.

OpenAI states that eligible API customers can request a BAA and that API data is not used to train models by default. Its current data-control documentation also describes default abuse-monitoring retention and approval-based Zero Data Retention or Modified Abuse Monitoring. These settings and eligibility can change, so verify them during production procurement and configuration.

## Google Cloud and Firebase controls

Google Cloud provides guidance for HIPAA workloads and identifies covered services and customer configuration responsibilities. Verify the current covered-products list under the executed BAA.

Firebase is a collection of products with different data practices. Do not assume that every Firebase product is appropriate for PHI merely because Firestore or Cloud Storage is covered in a broader cloud agreement.

Avoid PHI in:

- Analytics event names and parameters
- Crash report messages
- Performance traces
- Remote Config labels
- Cloud Monitoring labels and dashboard titles
- Alert text
- URL paths and query strings
- Object filenames

## Logging

Application logs should contain:

- Request ID
- Actor ID or pseudonymous internal ID
- Organization ID
- Action code
- Resource ID
- Success or failure code
- Latency

Do not log:

- Patient name
- DOB
- Address
- Phone
- Form answers
- Transcript excerpts
- Uploaded filenames containing identity
- AI prompt or response payloads by default
- Access tokens

Use a protected audit store for access and workflow evidence. Operational logs and audit logs have different purposes.

## File security

- Validate actual file type.
- Enforce size and page limits.
- Scan for malware when available.
- Render risky formats in a sandboxed worker.
- Do not execute embedded scripts or macros.
- Randomize object paths.
- Remove unnecessary metadata from derived images.
- Restrict download and preview.
- Delete abandoned uploads under policy.

## Web security

- Content Security Policy
- Secure, HTTP-only cookies where used
- CSRF protection for cookie-authenticated mutations
- Strict CORS allowlist
- Output encoding
- Framework protections against XSS
- File download content disposition
- Clickjacking protection
- Rate limiting
- Bot and abuse controls
- Dependency scanning
- Secret scanning
- Software bill of materials for production

Avoid placing protected values in browser local storage. Use in-memory or secure session mechanisms and persist drafts on the server.

## AI-specific security

- Treat all user and document text as untrusted.
- Delimit source content.
- Use allowlisted tools and fields.
- Validate every structured output.
- Reauthorize all source references.
- Prevent the model from selecting tenant or storage paths.
- Use concurrency versions.
- Keep signing and workflow transitions outside AI control.
- Test prompt injection, data exfiltration, and indirect injection.

## Patient matching safety

The agreed five identifiers can support a demo match, but are not guaranteed proof of identity. Patient demographic data can be incomplete, transposed, or outdated, and inaccurate matching can create safety and privacy risks.

Production controls:

- Normalize input consistently.
- Use probabilistic or deterministic matching tuned on representative data.
- Define thresholds for unique match, no match, and manual review.
- Never show other candidates to the patient.
- Audit manual linking.
- Monitor false-match and missed-match outcomes.
- Integrate patient portal or identity proofing where possible.

## Incident response

Document before production:

- What constitutes a security or privacy incident
- On-call ownership
- Containment steps
- Evidence preservation
- Vendor notification paths
- Breach-risk assessment process
- Clinic and patient communication responsibilities
- Recovery and post-incident review

A hackathon environment with synthetic data should still have a way to revoke tokens, disable access, and delete demo resources.

## Security development lifecycle

Required gates:

- Threat model reviewed
- Data-flow diagram reviewed
- Security Rules tests pass
- Cross-tenant tests pass
- Dependency and secret scans pass
- Authorization tests cover every endpoint
- Upload abuse tests pass
- AI injection tests pass
- Signature tamper tests pass
- Backup and restore tested before production
- Risk assessment and vendor review completed before PHI

## HIPAA production checklist

This is a starting checklist, not a complete compliance program:

- Determine covered entity and business associate roles
- Execute BAAs with all required vendors and subcontractors
- Confirm covered products and configuration
- Conduct documented security risk analysis
- Implement risk management plan
- Define minimum necessary policies
- Define workforce access and termination process
- Train users
- Implement audit controls and periodic review
- Implement incident and breach response
- Implement contingency, backup, and disaster recovery plans
- Define patient access, amendment, and accounting workflows as applicable
- Define retention and secure disposal
- Document policies and required evidence
- Reassess after material system changes

## References

- HHS, The HIPAA Privacy Rule: https://www.hhs.gov/hipaa/for-professionals/privacy/index.html
- HHS, Summary of the HIPAA Privacy Rule: https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html
- HHS, Your Rights Under HIPAA: https://www.hhs.gov/hipaa/for-individuals/guidance-materials-for-consumers/index.html
- NIST SP 800-63-4 Digital Identity Guidelines: https://pages.nist.gov/800-63-4/
- Google Cloud, HIPAA Compliance: https://cloud.google.com/security/compliance/hipaa
- Firebase, Privacy and Security: https://firebase.google.com/support/privacy
- OpenAI, API BAA information: https://help.openai.com/en/articles/8660679-how-can-i-get-a-business-associate-agreement-baa-with-openai
- OpenAI, API data controls: https://developers.openai.com/api/docs/guides/your-data

## Acceptance criteria

- No real PHI is used in the hackathon.
- All protected resources are authenticated, tenant-scoped, and role-checked.
- Firestore and Storage start locked and have tested rules.
- Secrets stay server-side.
- PHI is excluded from URLs, analytics, monitoring labels, and default logs.
- AI cannot change authorization, sign, certify, or select arbitrary sources.
- Signature tampering and stale writes are detected.
- Production documentation clearly requires BAAs, risk analysis, and operational controls before PHI.
