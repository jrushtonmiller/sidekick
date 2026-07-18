# End-to-End Workflows

## Workflow A: patient has a form

1. Patient opens organization invitation.
2. Patient authenticates and completes demographic match.
3. Patient chooses "Upload my form."
4. File is validated, stored, and queued for extraction.
5. Extraction service identifies visible text and layout.
6. Form matcher compares the document with organization-enabled templates.
7. If matched, the system maps extracted values to template fields.
8. Patient sees a short confirmation step for extracted patient-owned fields.
9. Interview planner calculates unanswered, uncertain, and conditional questions.
10. Assistant asks only the required gaps.
11. Patient reviews the patient-attributed content and rendered form.
12. Patient signs.
13. Submission enters staff queue.

## Workflow B: patient does not have a form but knows the need

1. Patient opens organization invitation and authenticates.
2. Patient chooses "Help me find the form."
3. Assistant asks what they are trying to accomplish.
4. Form matcher compares the description with enabled templates.
5. If one candidate is clear, patient confirms it.
6. If several candidates are plausible, assistant asks one clarifying question at a time.
7. A form instance is created and the guided interview begins.
8. Patient reviews and signs.
9. Submission enters staff queue.

## Workflow C: unsupported or unrecognized form

1. Form matcher returns `unsupported` or `uncertain` after the allowed clarifications.
2. The patient sees:

   > Sidekick does not support this form yet. Please contact your clinic. Bring or upload the form when the clinic asks you to do so.

3. A form-request record is created with:
   - Organization ID
   - Extracted issuer and form title if safely available
   - Redacted document fingerprint
   - Request count
   - Timestamp
4. Full document access remains restricted according to clinic policy.
5. The patient can exit or start another request.

## Workflow D: staff routes review-only work

1. Staff opens a patient-signed submission.
2. Staff reviews:
   - Required field coverage
   - Patient identity status
   - Uploaded-document quality
   - Source conflicts
   - Availability of recent supporting chart data
   - AI-generated operational issue summary
3. Staff chooses `review_only`.
4. A clinician work item is created with `availableAt = now`.
5. Submission appears in the clinician review queue.

## Workflow E: staff determines appointment required

1. Staff reviews the same issue set.
2. Staff chooses `appointment_required`.
3. Scheduling occurs outside Sidekick.
4. Staff records the appointment date/time in Sidekick for the demo.
5. A clinician work item is created with `availableAt = appointmentStart`.
6. The submission appears in a future-work view but not the active clinician queue.
7. On or after `availableAt`, it appears in "Visit today."

## Workflow F: clinician review and completion

1. Clinician opens a work item.
2. The page presents:
   - Rendered form
   - Required clinician fields
   - Patient-provided provisional facts
   - Mock EMR facts
   - Abridge-style visit transcript fixture
   - Source and conflict drawer
3. Clinician accepts, modifies, or rejects each provisional clinician field.
4. Clinician completes missing professional judgments.
5. Clinician acknowledges critical conflicts.
6. Clinician reviews signature attestation.
7. Clinician signs.
8. The system creates an immutable completed snapshot.
9. PDF is rendered from that snapshot.
10. Submission moves to `complete`.

## Workflow G: patient-owned information changes after signature

1. A patient-owned signed field needs correction.
2. Server invalidates the patient signature.
3. Submission returns to patient review or a controlled staff-assisted correction flow.
4. Patient reviews the corrected patient scope and signs again.
5. Staff routing is repeated or preserved according to policy.

Clinician changes to clinician-owned fields do not invalidate the patient signature. Any change after clinician signature invalidates the clinician signature and requires re-signing.
