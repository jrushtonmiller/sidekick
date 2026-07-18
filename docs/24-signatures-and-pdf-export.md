# Signatures and PDF Export

## Scope

The MVP demonstrates patient attestation, clinician signature, immutable snapshots, and PDF export. It does not by itself establish that an electronic signature is legally accepted by every form issuer.

For the current REG 195 form, official instructions indicate an original signature requirement. Treat in-app signatures as workflow evidence and a demo capability until the clinic confirms an accepted submission process.

## Signature principles

- The signer is authenticated.
- The signer sees the exact content in scope.
- The signer affirmatively acts.
- The attestation text is versioned.
- The signed values are frozen in an immutable snapshot.
- Later changes invalidate the relevant signature.
- AI never signs.
- Staff never signs as the patient or clinician.

## Signature scopes

### Patient scope

Includes:

- Patient-owned applicant fields
- Request options
- Patient-entered prior placard or vehicle fields
- Patient attestation text

Excludes:

- Provider profile
- Provider certification
- Clinician judgment
- Internal staff and clinician notes

### Clinician scope

Includes:

- Clinician-owned form fields
- Provider identity and license information rendered on the form
- Certification selection and description
- Clinician attestation text
- Patient-signed applicant snapshot reference

Excludes:

- Internal audit metadata
- Post-sign operational notes

## Signature record

```ts
interface SignatureRecord {
  id: string;
  organizationId: string;
  submissionId: string;
  signerUserId: string;
  signerRole: 'patient' | 'clinician';
  signatureMethod: 'typed' | 'drawn' | 'demo';
  signatureDisplay: string;
  attestationVersion: string;
  attestationTextHash: string;
  snapshotId: string;
  signedFieldSnapshotHash: string;
  signedAt: Timestamp;
  requestId: string;
  invalidatedAt?: Timestamp;
  invalidationReason?: string;
}
```

Do not store a reusable clinician signature image that can be applied to arbitrary forms. A drawn signature for the demo is bound to one signed snapshot.

## Snapshot creation

Create the snapshot in a server-side transaction:

1. Authorize the signer and resource.
2. Load exact template version.
3. Validate signature readiness.
4. Select fields in the role's signature scope.
5. Canonically serialize values and evidence references.
6. Include attestation version and template version.
7. Hash the serialized content.
8. Store immutable snapshot.
9. Store signature record.
10. Transition workflow state.
11. Append audit event.

Recommended canonical representation:

- UTF-8 JSON
- Stable key order
- ISO 8601 dates
- Normalized null handling
- No transient UI fields

## Invalidation rules

Patient signature is invalidated when:

- Any patient-scope value changes
- Request type changes
- A signed uploaded value is replaced
- Patient attestation version changes before completion

Clinician signature is invalidated when:

- Any clinician-scope value changes
- Provider identity or license rendered on the form changes
- Patient signed snapshot changes
- Certification language changes
- Template version changes

Do not invalidate for:

- Viewing a record
- Adding an internal note outside signature scope
- Re-exporting the same snapshot
- Updating operational delivery status

## Re-sign flow

When invalidated:

- Preserve prior signature and snapshot as invalidated history.
- Show which fields changed.
- Return to the appropriate review state.
- Require active review and a new signature.
- Never delete the original audit event.

## Recent authentication

Production clinician signing should require a recent authenticated session and may require reauthentication or multifactor authentication based on risk and policy.

For the hackathon, label the control `Demo signature` if it does not meet production identity assurance.

## PDF rendering architecture

```text
signed snapshot
  -> rendering service loads exact template revision
  -> map canonical fields to PDF targets
  -> apply text, checkboxes, and signature representation
  -> run layout validation
  -> compute export hash
  -> store protected export
  -> attach export record to submission
```

Do not render from the mutable live submission.

## Rendering record

```ts
interface ExportRecord {
  id: string;
  organizationId: string;
  submissionId: string;
  snapshotId: string;
  templateKey: string;
  templateVersion: string;
  rendererVersion: string;
  storagePath: string;
  sha256: string;
  status: 'pending' | 'complete' | 'failed';
  warnings: string[];
  createdAt: Timestamp;
}
```

## PDF coordinate mapping

Store page and placement in the template:

```ts
interface PdfTextTarget {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  minFontSize?: number;
  align?: 'left' | 'center' | 'right';
  overflow: 'shrink' | 'wrap' | 'truncate' | 'error';
}
```

Checkbox target:

```ts
interface PdfCheckboxTarget {
  page: number;
  x: number;
  y: number;
  size: number;
  mark: 'check' | 'x';
}
```

## Layout validation

Before completion, detect:

- Text overflow
- Missing required target
- Unsupported character
- Overlapping values
- Incorrect checkbox multiplicity
- Signature outside expected region
- Wrong page count or form revision

A rendering warning can block signing when it affects an official field.

## Signature rendering

Possible demo representations:

- Typed name using a standard font plus signed timestamp
- Drawn signature captured for that transaction
- "Electronically signed by" block on a Sidekick review packet

Do not imitate a handwritten signature font to imply a wet signature.

For an official PDF with an original-signature requirement, consider exporting the completed values without an electronic signature and instructing the clinic to print for wet signature. Production behavior requires current issuer and legal review.

## Official form versus review packet

### Official form overlay

Use only when:

- The exact official revision is stored or retrieved lawfully.
- Rendering coordinates are verified.
- Required notices remain intact.
- Signature method is accepted for the intended submission channel.

### Sidekick review packet

Use when official rendering is incomplete. It must clearly say:

- Sidekick form-preparation summary
- Not the official issuer form
- Demo or review copy

The review packet can include:

- Applicant section
- Patient-reported facts
- Clinician section
- Source summary
- Signature records
- Timeline

## Access and delivery

- Store exports in private tenant-scoped storage.
- Serve through an authenticated download route or short-lived signed URL.
- Record export access.
- Do not email a PDF containing PHI through an unapproved channel.
- Do not place patient identity in the filename shown to storage systems.

A patient may receive access to the completed form only when clinic policy permits. The MVP can show a completed status and a protected download.

## Watermarking

In `DEMO_MODE`:

- Add `SYNTHETIC DEMO DATA` to generated review packets.
- Add `DEMO, NOT FOR SUBMISSION` when the export is not an official valid form.
- Do not watermark an official blank form in a way that obscures required content during development screenshots.

## Acceptance criteria

- Patient and clinician signatures cover separate, explicit scopes.
- Signature records bind to immutable snapshots.
- Signed-field changes invalidate the correct signature.
- AI and staff cannot create patient or clinician signatures.
- PDF export uses the clinician-signed snapshot.
- Layout failures are visible and do not silently truncate required content.
- Demo output is clearly distinguished from a legally accepted official submission.
- REG 195 original-signature limitations are surfaced in the workflow.
