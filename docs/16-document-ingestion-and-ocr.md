# Document Ingestion and OCR

## Goals

The upload flow should let a patient provide a photo or PDF of a partially completed form so Sidekick can:

1. Identify the document.
2. Extract values already present.
3. Match those values to a supported template.
4. Ask only for missing or uncertain information.
5. Preserve page and location references for reviewer verification.

The MVP may use fixtures for the demo. The architecture should support a real OCR or document-understanding service later.

## Supported inputs

P0 or P1:

- PDF
- JPEG
- PNG
- HEIC only when the client can reliably convert it

Recommended limits:

- Maximum 10 pages for a form upload
- Maximum 15 MB per file for the demo
- One primary form upload per submission
- Optional supporting documents behind a separate label

Reject password-protected or executable content. Do not attempt to process archives.

## Upload sequence

```text
client requests upload session
  -> server authorizes tenant and submission
  -> server creates randomized storage path
  -> client uploads directly to storage
  -> client confirms upload
  -> server verifies object metadata and checksum
  -> malware and file-type checks
  -> document job created
  -> page rendering and OCR
  -> form identification
  -> field mapping
  -> suggestions saved
  -> patient confirmation screen
```

Do not include patient name, DOB, form type, or diagnosis in storage filenames.

Example path:

```text
organizations/{organizationId}/submissions/{submissionId}/documents/{uuid}/original
```

## File validation

Validate using detected content, not only filename extension.

Checks:

- MIME signature
- Size
- Page count
- Image dimensions
- Corruption
- Encryption/password protection
- Malware scan when available
- Duplicate checksum

A failed validation produces a patient-friendly message and a technical reason code.

## Image quality feedback

Before upload or processing, help the patient capture a usable image:

- Place the page on a flat, contrasting surface.
- Include all four corners.
- Avoid shadows and glare.
- Use the rear camera when possible.
- Capture one page at a time.
- Retake blurry images.

Client-side checks can estimate blur, glare, and cropping, but should not block unless quality is clearly unusable.

## Processing states

```ts
type DocumentProcessingStatus =
  | 'uploaded'
  | 'validating'
  | 'rejected'
  | 'rendering_pages'
  | 'extracting_text'
  | 'identifying_form'
  | 'mapping_fields'
  | 'awaiting_confirmation'
  | 'complete'
  | 'failed';
```

The UI should show progress and allow the patient to continue with a manual interview if processing fails.

## OCR output model

Preserve layout metadata:

```ts
interface OcrBlock {
  id: string;
  documentId: string;
  page: number;
  text: string;
  normalizedBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blockType: 'line' | 'word' | 'checkbox' | 'table_cell' | 'signature_region';
  engineConfidence?: number;
}
```

Do not treat a signature image as a reusable signature. At most, note that a signature region appears occupied and require a new in-app attestation for the workflow demo.

## Form identification strategy

Use layered matching:

1. Exact form number or known title
2. Issuer and revision clues
3. Stable labels and layout fingerprints
4. AI ranking against supported templates
5. Patient clarification

Store a document fingerprint that excludes patient content where feasible. Use it to group unsupported form requests without retaining unnecessary copies for analytics.

## Field mapping strategy

### Stage 1: deterministic anchors

For known templates, use:

- Printed label anchors
- Page number
- Relative bounding boxes
- Checkbox positions
- Named PDF form fields, when present

### Stage 2: AI-assisted mapping

Use the structured mapping contract to propose field values and source block IDs.

### Stage 3: validation

Validate types and formats:

- Dates are real dates and in reasonable ranges
- State uses a valid code
- Postal code format is valid
- Phone can be normalized
- Enumerated values exist
- A checkbox has sufficient evidence

### Stage 4: confirmation

Patient-owned values from upload are suggestions until confirmed by the patient. Clinician-owned values remain suggestions for clinician review even when present on the uploaded form.

## Handwriting

Handwriting recognition can be unreliable. For handwritten text:

- Default to `medium` or `low` confidence unless independently validated.
- Show the image crop next to the proposed value.
- Ask the patient to confirm patient-owned values.
- Require clinician verification for clinician-owned values.
- Never infer text from an illegible region.

## Checkboxes and marks

Checkbox processing must account for:

- Filled boxes
- Check marks
- Cross marks
- Stray lines
- Scanning artifacts

A blank box is evidence of no selection only when the complete checkbox area is visible and image quality is adequate. Otherwise, treat it as unresolved.

## Duplicate and superseded uploads

When a patient uploads a new version:

- Preserve the old document and its provenance.
- Mark it superseded.
- Re-run extraction.
- Create new suggestions rather than silently replacing confirmed values.
- Flag any difference from confirmed or signed values.
- Invalidate a patient signature when a signed-scope value changes.

## Document viewer

Staff and clinicians need:

- Page thumbnails
- Zoom and rotate
- Highlighted source region when opening provenance
- Side-by-side field value
- Original file download only when authorized
- Clear superseded-version label

The patient review may show a simpler preview.

## Privacy and retention

- Keep uploads tenant-scoped.
- Use signed, short-lived access URLs or authenticated streaming.
- Do not make storage objects public.
- Do not place OCR text in analytics.
- Apply configured retention after completion or abandonment.
- Record access to protected documents.

## Prompt injection and malicious text

OCR text is untrusted. A document may contain text such as "ignore previous instructions" or hidden white-on-white content.

Controls:

- The OCR pipeline never treats document text as a system prompt.
- The AI receives explicit delimiters and an allowlisted task.
- The model cannot choose arbitrary tools or fields.
- The server validates all returned field IDs and source block IDs.
- Hidden or tiny text may be excluded or flagged during layout analysis.

## Demo implementation options

### Option A: fixture-first, recommended

- Include a synthetic uploaded REG 195 image or generated PDF.
- Store predefined OCR blocks and mapping output.
- Animate or display realistic processing states.
- Keep a development toggle to simulate extraction failure.

### Option B: live multimodal extraction

- Render PDF pages to images.
- Send the first pages and supported field schema to an approved model or OCR service.
- Validate the structured output.
- Fall back to fixture mode on failure.

The judge demo should use fixture mode unless the live path has been repeatedly tested.

## Acceptance criteria

- A patient can upload a supported image or PDF.
- Storage paths contain no PHI.
- Upload validation rejects unsupported or unsafe files.
- Extracted values retain page and bounding-box provenance.
- High-confidence patient fields still require patient confirmation when appropriate.
- Low-confidence values are visibly uncertain.
- A failed OCR job does not block manual completion.
- Uploaded instructions cannot alter application or AI policy.
- Replacing a document does not erase source history.
