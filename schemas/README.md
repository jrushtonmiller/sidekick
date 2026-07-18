# Schemas

These JSON Schemas are implementation contracts for Codex.

- `form-template.schema.json`: form recipes, ownership, questions, conditions, signatures, and rendering metadata
- `ai-contracts.schema.json`: structured output definitions for all AI capabilities
- `workflow-event.schema.json`: workflow transition event
- `submission.schema.json`: top-level submission record

JSON Schema cannot enforce all cross-reference rules. Add custom validation for:

- Unique section and field IDs
- Every `sectionId` exists
- Every condition field exists
- Every signature scope section exists
- Patient signature excludes clinician sections
- Clinician signature includes required clinician sections
- Rendering target consistency
- No circular condition dependencies

Run validation in CI and when loading templates. Never continue with an invalid active template.
