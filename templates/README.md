# Form Templates

`ca-dmv-reg195.template.json` is the starter template for the demo.

Important:

- REG 195 is an explicit assumption because the original discussion did not confirm the form number.
- The template is marked `draft`.
- Patient facts are collected separately from clinician certification.
- No clinician certification is preselected.
- Official PDF coordinates are not claimed complete.
- Current issuer signature requirements must be rechecked.

To add a form:

1. Copy the official source into a versioned, controlled location when permitted.
2. Create a new template JSON.
3. Validate against `schemas/form-template.schema.json`.
4. Run cross-reference checks.
5. Review field ownership, patient language, clinical boundaries, and signatures.
6. Add deterministic fixtures and tests.
7. Publish a new immutable template version.
