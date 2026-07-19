/**
 * Core payload schema — generalized form-autofill model.
 * See docs/plans/2026-07-18-payload-schema-design.md
 *
 * Two layers:
 *  - Definition layer (this + FormDefinition): PHI-free, committable.
 *  - Instance layer (FormInstance): holds PHI, encrypted at rest, role-gated.
 */

// ─────────────────────────── Definition layer ───────────────────────────

export type FieldType = 'text' | 'date' | 'enum' | 'bool';
export type FieldRole = 'patient' | 'provider';
/**
 * Where a field is expected to be filled from.
 *  - record:     the patient's FHIR record.
 *  - transcript: LLM extraction from the visit transcript.
 *  - profile:    standing office/provider profile config (e.g. the clinic's own
 *                provider name + medical license number — constant across forms).
 *  - manual:     ad-hoc, collected from a human at fill time.
 */
export type SourceHint = 'record' | 'transcript' | 'profile' | 'manual';

/**
 * How a logical field binds to the underlying AcroForm field(s) for write-back.
 * Supersedes a flat pdfFieldMap because enums map to checkbox *groups* and
 * yes/no questions map to radios with non-obvious export values.
 */
export type PdfBinding =
  // `toPdf` reformats the logical value into the string the PDF expects
  // (e.g. FHIR "1991-05-24" → "05241991" for an 8-cell comb field).
  | { kind: 'text'; field: string; toPdf?: (value: string) => string }
  | { kind: 'checkbox'; field: string; on: string }
  // one logical enum → several checkbox widgets; writer sets the matching
  // widget to `on`, all others to Off.
  | { kind: 'checkboxGroup'; options: Record<string, { field: string; on: string }> }
  // one logical enum → one radio field; value maps to the widget export name.
  | { kind: 'radio'; field: string; options: Record<string, string> }
  // an AcroForm choice/dropdown (/Ch). The value is selected directly, or
  // mapped through `options` (logical value → the dropdown's option string).
  | { kind: 'select'; field: string; options?: Record<string, string> };

export interface FieldDefinition {
  key: string;                 // logical key, e.g. "applicantName"
  label: string;               // human label for the review UI
  type: FieldType;
  options?: string[];          // for enum
  role: FieldRole;             // who owns it → drives access + who confirms
  required: boolean;
  validation?: string;         // regex / mask (string form, compiled at use)
  group?: string;              // review-UI grouping/ordering
  sourceHint: SourceHint;      // where we expect to fill it from
  extractionHint?: string;     // NL guidance for the LLM (transcript fields)
  fhir?: FhirMapping;          // for record-sourced fields (see below)
  pdf?: PdfBinding;            // omitted for virtual fields not written to PDF
  /** For virtual fields that have no AcroForm widget (e.g. REG-195 Section 5):
   *  where to draw the value. Coordinates are PDF points, origin bottom-left.
   *  `page` is 0-indexed. */
  stamp?: { page: number; x: number; y: number; size?: number };
  /** True for fields captured for the workflow but not present in the PDF
   *  AcroForm (e.g. the physician certification, which REG-195 handles on
   *  paper). Drives the escalation flow without a write-back target. */
  virtual?: boolean;
  notes?: string;              // author notes / TODOs (e.g. verify-on-form)
}

export interface FhirMapping {
  fhirPath: string;                          // e.g. "address[0].city"
  transform?: (v: any) => string | boolean | null;
}

export interface FormDefinition {
  formId: string;              // "ca-dmv-reg195"
  title: string;
  pdfPath: string;
  fields: FieldDefinition[];
}

// ──────────────────────────── Instance layer ────────────────────────────

export type FieldStatus = 'empty' | 'suggested' | 'confirmed' | 'escalated' | 'na';

export interface Citation {
  quote: string;                              // exact transcript sentence
  speaker?: 'DR' | 'PT' | 'NURSE' | 'FAMILY';
  charStart?: number;
  charEnd?: number;                           // offsets into transcript
}

export interface FieldValue {
  value: string | boolean | null;             // null = empty / needed
  source: SourceHint | 'derived' | null;
  confidence: number | null;                  // 0–1, only for 'transcript'
  citation?: Citation;                        // only transcript-sourced fields
  status: FieldStatus;
  reviewedBy?: string;
  reviewedAt?: string;                         // ISO
}

export type Role = 'patient' | 'staff' | 'doctor' | 'mod';  // mod = staff ∪ doctor
export type InstanceStatus = 'draft' | 'in_review' | 'ready' | 'exported';

export interface AuditEntry {
  at: string;                  // ISO
  actor: string;               // user id (or "sys")
  role: Role;
  action:
    | 'created'
    | 'autofilled'
    | 'edited'
    | 'confirmed'
    | 'escalated'
    | 'approved'
    | 'exported';
  fieldKey?: string;           // omitted for instance-wide actions
  from?: unknown;
  to?: unknown;
}

export interface FormInstance {
  instanceId: string;
  formId: string;
  patientRef: string;          // FHIR Patient id
  encounterRef: string;
  status: InstanceStatus;
  values: Record<string, FieldValue>;
  audit: AuditEntry[];         // append-only — the compliance story
}

/**
 * The clinic's standing provider/office profile — constant across every form.
 * Fields with `sourceHint: 'profile'` are filled from here identically each
 * time (e.g. REG-195 Section 5 provider identity). Configured once per
 * provider, not extracted or collected per-visit.
 */
export interface ProviderProfile {
  providerId: string;
  providerName: string;        // "Last, First, Middle" as forms expect
  medicalLicenseNumber: string;
  address?: string;
  city?: string;
  county?: string;
  state?: string;
  zip?: string;
  phone?: string;
  email?: string;
}
