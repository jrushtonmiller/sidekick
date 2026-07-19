/**
 * OpenRouter-backed InferModel: one call that reads a freeform blob and infers
 * answers to as many form questions as it honestly can.
 *
 * The API key comes from OPENROUTER_API_KEY; it is never hard-coded.
 */
import type { FormSpec } from './formSpec';
import type { InferModel, Inference } from './inferAnswers';
import { postChat } from './openrouterClient';

const SYSTEM =
  'You fill out a form from a freeform blob of information about a person ' +
  '(self-reported details, notes, maybe pasted records). You are given the ' +
  "form's questions (id, label, options) and the blob.\n" +
  'For each question you can answer FROM THE BLOB, return {id, value, reason}:\n' +
  '- Only answer what the blob supports, directly or by clear inference (e.g. ' +
  'the state for a city it names; a mobility-related placard type from a ' +
  'described condition). Quote or paraphrase the basis in "reason".\n' +
  '- For "choice" questions, value MUST be one of the given options.\n' +
  '- Do NOT fabricate personal facts the blob does not support (names, ID ' +
  'numbers, dates) — simply omit those questions; a human will complete them.\n' +
  'Return only questions you are answering; omit the rest.';

const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    inferences: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string' },
          value: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['id', 'value', 'reason'],
      },
    },
  },
  required: ['inferences'],
};

export function buildOpenRouterInferModel(
  model = 'anthropic/claude-sonnet-5',
  apiKey = process.env.OPENROUTER_API_KEY,
): InferModel {
  return async (spec: FormSpec, blob: string) => {
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

    const questions = spec.questions.map((q) => ({
      id: q.id,
      label: q.label,
      ...(q.options ? { options: q.options } : {}),
    }));

    const content = await postChat(
      {
        model,
        max_tokens: 8000,
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'inferences', strict: true, schema: RESPONSE_SCHEMA },
        },
        messages: [
          { role: 'system', content: SYSTEM },
          {
            role: 'user',
            content: `QUESTIONS:\n${JSON.stringify(questions, null, 2)}\n\nBLOB:\n${blob}`,
          },
        ],
      },
      apiKey,
    );
    const parsed = JSON.parse(content || '{}') as { inferences?: Inference[] };
    return parsed.inferences ?? [];
  };
}
