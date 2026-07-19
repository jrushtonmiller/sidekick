/**
 * Vision audit of the extracted spec against the SOURCE form. We render the
 * blank form to images and show a vision model both the pages and the questions
 * we extracted (from text + AcroForm fields), and it flags what the text-only
 * extraction got wrong or missed: a field on the page with no question, a
 * question whose options don't match the printed choices, a checkbox bound to
 * the wrong label, a section (like a provider block) with no fillable widget.
 *
 * This validates/discovers at INGEST time — improving the saved spec — rather
 * than checking a produced PDF. The API key comes from OPENROUTER_API_KEY.
 */
import type { FormSpec } from './formSpec';
import { postChat } from './openrouterClient';

export interface AuditFinding {
  kind: 'missing' | 'mislabeled' | 'wrong-options' | 'extra' | 'other';
  location: string; // where on the form (section / label)
  detail: string;
  severity: 'high' | 'low';
}

export type SpecAuditor = (
  /** Source-form page images as base64 data URLs. */
  images: string[],
  spec: FormSpec,
) => Promise<AuditFinding[]>;

const SYSTEM =
  'You audit a form questionnaire against the actual form. You are given images ' +
  'of a blank form and the list of questions someone extracted from it (each a ' +
  'label, and options for multiple-choice). Compare them and report gaps:\n' +
  '- "missing": a field/blank/checkbox on the form with no matching question.\n' +
  '- "wrong-options": a choice question whose options don\'t match the printed ' +
  'choices (missing or extra options).\n' +
  '- "mislabeled": a question whose wording misrepresents what the form asks.\n' +
  '- "extra": a question that does not correspond to anything on the form.\n' +
  '- "other": anything else worth a human\'s attention (e.g. a section that must ' +
  'be filled but has no fillable field).\n' +
  'Report only real gaps; if the questionnaire faithfully covers the form, return ' +
  'an empty list. Give {kind, location, detail, severity}.';

const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          kind: { type: 'string', enum: ['missing', 'mislabeled', 'wrong-options', 'extra', 'other'] },
          location: { type: 'string' },
          detail: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'low'] },
        },
        required: ['kind', 'location', 'detail', 'severity'],
      },
    },
  },
  required: ['findings'],
};

export function buildOpenRouterSpecAuditor(
  model = 'anthropic/claude-sonnet-5',
  apiKey = process.env.OPENROUTER_API_KEY,
): SpecAuditor {
  return async (images, spec) => {
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

    const questions = spec.questions.map((q) => ({
      label: q.label,
      ...(q.options ? { options: q.options } : {}),
    }));

    const content: any[] = [
      {
        type: 'text',
        text:
          `EXTRACTED QUESTIONS:\n${JSON.stringify(questions, null, 2)}\n\n` +
          `Here are the pages of the blank form — audit the questions against them:`,
      },
      ...images.map((url) => ({ type: 'image_url', image_url: { url } })),
    ];

    const text = await postChat(
      {
        model,
        max_tokens: 8000,
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'spec_audit', strict: true, schema: RESPONSE_SCHEMA },
        },
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content },
        ],
      },
      apiKey,
    );
    const parsed = JSON.parse(text || '{}') as { findings?: AuditFinding[] };
    return parsed.findings ?? [];
  };
}
