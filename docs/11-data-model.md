# Data Model

The following model is optimized for Firestore and tenant-scoped queries. It is a logical model, not a requirement to place every nested object in one document.

## Organization

```ts
interface Organization {
  id: string;
  name: string;
  slug: string;
  timeZone: string;
  status: 'active' | 'inactive';
  settings: {
    supportMessage: string;
    allowPatientReopen: boolean;
    defaultClinicianQueueMode: 'pooled' | 'assigned';
    retentionPolicyId: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## User profile

```ts
interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}
```

Do not use the global profile as authorization. Use membership.

## Membership

```ts
interface Membership {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  status: 'active' | 'disabled' | 'invited';
  clinicianProfileId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Patient

```ts
interface Patient {
  id: string;
  organizationId: string;
  mrn: string;                  // synthetic in demo
  legalFirstName: string;
  legalLastName: string;
  middleName?: string;
  dateOfBirth: string;
  address: PostalAddress;
  phone: string;
  linkedUserId?: string;
  matchingStatus: 'unlinked' | 'linked' | 'review';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Form template

```ts
interface FormTemplate {
  id: string;
  organizationId?: string;      // absent for platform template
  key: string;                  // ca_dmv_reg195
  version: string;
  name: string;
  issuer: string;
  status: 'draft' | 'active' | 'retired';
  metadata: TemplateMetadata;
  sections: FormSection[];
  fields: FormFieldDefinition[];
  rules: FormRule[];
  rendering: RenderingDefinition;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Submission

```ts
interface Submission {
  id: string;
  organizationId: string;
  patientId?: string;
  createdByUserId: string;
  templateId?: string;
  templateVersion?: string;
  status: SubmissionStatus;
  version: number;
  title: string;
  identityStatus: 'matched' | 'review' | 'unlinked';
  patientSignatureId?: string;
  clinicianSignatureId?: string;
  disposition?: 'review_only' | 'appointment_required';
  appointmentAt?: Timestamp;
  availableAt?: Timestamp;
  assignedClinicianId?: string;
  criticalIssueCount: number;
  warningCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
}
```

## Field value

Store one canonical value plus its history and source references.

```ts
interface FieldValue {
  id: string;                    // same as fieldId
  organizationId: string;
  submissionId: string;
  fieldId: string;
  value: unknown;
  displayValue?: string;
  ownership: 'patient' | 'staff' | 'clinician' | 'system';
  status:
    | 'missing'
    | 'suggested'
    | 'patient_confirmed'
    | 'staff_reviewed'
    | 'clinician_verified'
    | 'not_applicable';
  selectedProvenanceIds: string[];
  hasConflict: boolean;
  changedAfterPatientSignature: boolean;
  changedAfterClinicianSignature: boolean;
  updatedBy: ActorRef;
  updatedAt: Timestamp;
}
```

## Provenance record

```ts
interface ProvenanceRecord {
  id: string;
  organizationId: string;
  submissionId: string;
  fieldId: string;
  sourceType:
    | 'patient_chat'
    | 'patient_form_entry'
    | 'uploaded_document'
    | 'emr_condition'
    | 'emr_observation'
    | 'emr_medication'
    | 'encounter_transcript'
    | 'staff'
    | 'clinician'
    | 'system';
  sourceRef: string;
  sourceLabel: string;
  exactExcerpt?: string;
  page?: number;
  boundingBox?: NormalizedBoundingBox;
  extractedValue?: unknown;
  attributionConfidence: 'high' | 'medium' | 'low';
  createdAt: Timestamp;
}
```

Confidence describes extraction or mapping confidence, not medical truth.

## Conversation message

```ts
interface ConversationMessage {
  id: string;
  organizationId: string;
  submissionId: string;
  role: 'patient' | 'assistant' | 'system';
  text: string;
  questionId?: string;
  fieldIds?: string[];
  createdAt: Timestamp;
}
```

## Document

```ts
interface DocumentRecord {
  id: string;
  organizationId: string;
  submissionId: string;
  type: 'uploaded_form' | 'supporting_document' | 'exported_pdf';
  storagePath: string;
  originalFileNameRedacted: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  processingStatus: 'pending' | 'processing' | 'complete' | 'failed';
  createdBy: ActorRef;
  createdAt: Timestamp;
}
```

## Work item

```ts
interface WorkItem {
  id: string;
  organizationId: string;
  submissionId: string;
  queue: 'staff' | 'clinician';
  type: 'staff_review' | 'review_only' | 'appointment';
  status: 'open' | 'claimed' | 'complete' | 'cancelled';
  assigneeUserId?: string;
  availableAt: Timestamp;
  appointmentAt?: Timestamp;
  priority: 'normal' | 'high';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

## Signature

```ts
interface SignatureRecord {
  id: string;
  organizationId: string;
  submissionId: string;
  signerUserId: string;
  signerRole: 'patient' | 'clinician';
  signatureMethod: 'typed' | 'drawn' | 'demo';
  attestationVersion: string;
  attestationTextHash: string;
  signedFieldSnapshotHash: string;
  snapshotId: string;
  signedAt: Timestamp;
  invalidatedAt?: Timestamp;
  invalidationReason?: string;
}
```

## Audit event

```ts
interface AuditEvent {
  id: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  actor: ActorRef;
  action: string;
  timestamp: Timestamp;
  requestId: string;
  beforeHash?: string;
  afterHash?: string;
  metadata: Record<string, string | number | boolean | null>;
}
```

Audit metadata must avoid raw PHI.

## Unsupported form request

```ts
interface UnsupportedFormRequest {
  id: string;
  organizationId: string;
  normalizedIssuer?: string;
  normalizedTitle?: string;
  documentFingerprint?: string;
  requestCount: number;
  firstRequestedAt: Timestamp;
  lastRequestedAt: Timestamp;
  reviewStatus: 'new' | 'planned' | 'supported' | 'declined';
}
```

## Snapshot model

At each signature, create an immutable snapshot containing:

- Template key and version
- Canonical field values in signature scope
- Selected provenance IDs
- Attestation version
- Render parameters
- Content hash

PDF export uses the clinician-signed snapshot, not mutable live documents.
