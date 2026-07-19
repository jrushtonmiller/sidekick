/**
 * Reads a form's page text + fillable fields (with their real on-values) and
 * produces a complete FormSpec — every question, its options, any branch
 * condition, and how each answer writes to the PDF.
 *
 * The fields are processed in BATCHES (one model call each), because a large
 * form (the EDD benefits application has 254 fields) produces a questionnaire
 * far bigger than one response can hold — the single-call version truncated
 * (finish_reason=length) and the extraction failed. Each batch returns a small
 * spec fragment; the fragments are merged into one FormSpec. Downstream is
 * unchanged: the saved spec still carries real field names and verbatim
 * on-values.
 *
 * The wire format the model emits is SLIM: it references each field by its
 * index in the batch and each button on-value by its index, instead of copying
 * field names and (space-sensitive) on-values back verbatim. We reconstruct the
 * real names/on-values from the FillableField list we already extracted — the
 * model never regurgitates data we already have, and can't corrupt a trailing
 * space in the process.
 *
 * Uses portable `json_object` mode so it works across OpenRouter models
 * (deepseek/qwen/anthropic). The API key comes from OPENROUTER_API_KEY.
 */
import type { FormSource } from './formSource';
import type { FillableField } from './fillableFields';
import type { FormSpec, SpecQuestion, FillRule } from './formSpec';
import { postChat } from './openrouterClient';

/** One fill instruction in the model's slim wire format. */
export type SlimFill =
  // Text field at batch index `f`: the answer is written verbatim.
  | { f: number }
  // Button field at batch index `f`: `map` sends each choice option to one of
  // that field's on-values, referenced by its index in the field's onValues.
  | { f: number; map: Record<string, number> };

/** A question as the model emits it — fields referenced by index, not name. */
export interface SlimQuestion {
  id: string;
  label: string;
  inputType: 'text' | 'date' | 'choice';
  options?: string[];
  help?: string;
  askWhen?: { id: string; equals: string };
  fill: SlimFill[];
}

/** Transport for a chat completion. Defaults to the real OpenRouter client;
 *  injectable so the batching/merging logic can be tested without the network. */
export type ChatFn = (body: Record<string, unknown>, apiKey: string) => Promise<string>;

export interface SpecModelDeps {
  chat?: ChatFn;
  /** Fields per model call. Smaller = safer against truncation, more calls. */
  batchSize?: number;
}

const INSTRUCTIONS = `You are given a government/medical form: its readable page text and a numbered
list of its fillable fields (each with an index, a name, a kind of "text" or
"button", and — for buttons — its allowed on-values, each with an index).
Produce a JSON questionnaire a person can complete to fill these fields.

Return ONLY JSON of this shape:
{
  "formTitle": string,
  "questions": [
    {
      "id": string,                // stable slug, e.g. "applicantName"
      "label": string,             // plain-language question
      "inputType": "text" | "date" | "choice",
      "options"?: string[],        // required for "choice"
      "help"?: string,             // short clarification when the form is dense
      "askWhen"?: { "id": string, "equals": string },  // only ask if a prior answer matches
      "fill": [                    // which fields this answer writes, BY INDEX
        { "f": <fieldIndex> }                              // a text field
        | { "f": <fieldIndex>, "map": { "<option>": <onValueIndex> } }  // a button field
      ]
    }
  ]
}

Rules:
- Cover every listed field a human is expected to complete. Group related blanks
  into one natural question only when they share a single answer.
- Reference fields ONLY by their given index ("f"). Never write field names.
- For button fields, "map" sends each choice option to one of that field's
  on-values, referenced by that on-value's index (a number). A single "choice"
  question may target several button fields (one per option).
- A field's "label" (when shown) is the text physically next to it on the page.
  TRUST THE LABEL over the field name to decide what a box means.
- Use "askWhen" for conditional sections (e.g. mailing address only if it
  differs) so they're skipped unless relevant. Note: only reference question ids
  defined in THIS batch.
- Do not ask about signatures/dates the applicant fills at submission unless the
  form clearly expects them now.`;

/** Split an array into consecutive batches of at most `size`. */
export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Turn the model's slim, index-referenced questions back into full FormSpec
 * questions carrying real field names and verbatim on-values, using `fields`
 * (the batch the indices refer to). Fill entries with an out-of-range field or
 * on-value index are dropped rather than trusted.
 */
export function reconstructQuestions(slim: SlimQuestion[], fields: FillableField[]): SpecQuestion[] {
  return slim.map((q) => {
    const fill: FillRule[] = [];
    for (const entry of q.fill ?? []) {
      const field = fields[entry.f];
      if (!field) continue; // field index out of range
      if (field.kind === 'text') {
        fill.push({ field: field.name, kind: 'text' });
        continue;
      }
      const valueMap: Record<string, string> = {};
      const map = 'map' in entry && entry.map ? entry.map : {};
      for (const [option, onIdx] of Object.entries(map)) {
        const onValue = field.onValues[onIdx];
        if (onValue !== undefined) valueMap[option] = onValue; // skip bad on-value index
      }
      fill.push({ field: field.name, kind: 'button', valueMap });
    }
    const out: SpecQuestion = { id: q.id, label: q.label, inputType: q.inputType, fill };
    if (q.options) out.options = q.options;
    if (q.help) out.help = q.help;
    if (q.askWhen) out.askWhen = q.askWhen;
    return out;
  });
}

/** Render a batch as the numbered, indexed field list the model reads. */
function listFields(fields: FillableField[]): string {
  return fields
    .map((f, i) => {
      const label = f.label ? ` — label: ${JSON.stringify(f.label)}` : '';
      if (f.kind === 'text') return `${i}: ${JSON.stringify(f.name)} (text)${label}`;
      const ons = f.onValues.map((v, j) => `${j}=${JSON.stringify(v)}`).join(', ');
      return `${i}: ${JSON.stringify(f.name)} (button; on-values: ${ons})${label}`;
    })
    .join('\n');
}

/** Parse a model response that may be wrapped in ```json fences or stray prose. */
function parseSlim(raw: string): { formTitle?: string; questions?: SlimQuestion[] } {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1] : raw;
  return JSON.parse((jsonText || '{}').trim());
}

export async function buildFormSpec(
  source: FormSource,
  fields: FillableField[],
  model = 'anthropic/claude-sonnet-5',
  apiKey = process.env.OPENROUTER_API_KEY,
  /** Gaps found by a prior vision audit — the model should fix these this pass. */
  feedback?: string,
  deps: SpecModelDeps = {},
): Promise<FormSpec> {
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');
  const chat = deps.chat ?? postChat;
  const batchSize = deps.batchSize ?? 30;

  const feedbackBlock = feedback
    ? `\n\nA prior extraction of THIS form had these gaps found by reviewing the ` +
      `form image. Fix them — add the missing questions, correct options/labels, ` +
      `drop questions that don't match anything on the form:\n${feedback}`
    : '';

  const runBatch = async (batch: FillableField[]): Promise<{ formTitle: string; questions: SpecQuestion[] }> => {
    const raw = await chat(
      {
        model,
        // Generous headroom per batch: batching keeps each response well under
        // this, but a dense batch (many choice options + help text) can still
        // run long — 16k truncated a 30-field batch of the EDD form.
        max_tokens: 32000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: INSTRUCTIONS },
          {
            role: 'user',
            content:
              `FILLABLE FIELDS (index: name, kind, on-values):\n${listFields(batch)}\n\n` +
              `FORM TEXT:\n${source.pageText}${feedbackBlock}`,
          },
        ],
      },
      apiKey,
    );
    const parsed = parseSlim(raw);
    return {
      formTitle: parsed.formTitle ?? '',
      questions: reconstructQuestions(parsed.questions ?? [], batch),
    };
  };

  const results = await Promise.all(chunk(fields, batchSize).map(runBatch));
  return {
    formTitle: results.map((r) => r.formTitle).find(Boolean) ?? '',
    questions: results.flatMap((r) => r.questions),
  };
}
