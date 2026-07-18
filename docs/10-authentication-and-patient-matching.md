# Authentication and Patient Matching

## Separate two concepts

Authentication answers: "Which app account is this?"

Patient matching answers: "Which clinic patient record belongs to this account?"

The five demographic identifiers are a prototype matching method, not a replacement for authentication.

## Prototype authentication

Preferred hackathon options:

1. Email and password using Firebase Authentication
2. Email magic link if already familiar to the team
3. Seeded demo login for stage reliability

Phone OTP can be added later. Do not make account access depend solely on demographic knowledge.

## Demographic fields

- Legal first name
- Legal last name
- Date of birth
- Current address
- Phone number

These fields match the product discussion and align with common patient-matching attributes described by ONC. See `docs/33-reference-sources.md`.

## Normalization

Server-side normalization creates comparison values while preserving original input.

```ts
interface NormalizedDemographics {
  firstName: string;       // Unicode-normalized, trimmed, case-folded
  lastName: string;
  dateOfBirth: string;     // YYYY-MM-DD
  addressLine1: string;    // standardized abbreviations where safe
  postalCode: string;
  phoneE164: string;
}
```

Do not discard apartment numbers or name suffixes. The match service should be conservative.

## MVP matching policy

### Auto-link

Auto-link only when all five agreed identifiers match one and only one mock patient record after normalization.

### Staff review

Create `identity_review` when:

- More than one candidate matches
- One or more identifiers differ
- A required identifier is missing
- The patient is not found

### Privacy behavior

- Never display a list of candidate patients.
- Never reveal a candidate address, phone, diagnosis, or appointment.
- Use generic messages such as "We could not link your clinic record automatically. Staff will review it."
- Do not load EMR data until linking succeeds.

## Match result

```ts
interface PatientMatchResult {
  status: 'matched' | 'ambiguous' | 'not_found';
  patientId?: string;
  matchedFields: string[];
  mismatchedFields: string[];
  reviewReason?: string;
}
```

Do not return candidate IDs to the browser for ambiguous matches.

## Production direction

Production should prefer:

- Patient portal single sign-on
- An invitation tied to a patient record through a secure clinic workflow
- Identity federation
- Risk-based identity proofing and stronger authentication

NIST SP 800-63-4 provides current digital identity guidance. It is a risk framework, not a requirement that this product claim a particular assurance level without assessment.

## Account recovery

The hackathon can use the authentication provider's standard reset flow. Production requirements:

- No recovery questions based on medical or demographic information
- Rate limiting
- Audit events
- Session revocation after credential changes
- Multi-factor authentication for workforce users

## Workforce authentication

Staff, clinicians, and admins should use stronger controls than patients:

- MFA in production
- Organization-managed accounts or SSO when available
- Shorter idle timeout
- Device/session inventory
- Immediate role revocation

## Session behavior

- Store auth tokens using provider-supported secure mechanisms.
- Do not put PHI in cookies.
- Revalidate membership for privileged operations.
- Require recent authentication for signatures and membership administration.
