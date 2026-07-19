/**
 * Blob → answers. Instead of interrogating the user question by question, we
 * hand the model ONE freeform blob (self-reported patient basics, context like
 * "can't walk more than a block", optionally pasted plaintext records) and let
 * it infer answers to whatever form questions it can. Everything it can't infer
 * is left blank and returned as `review` for a human to complete.
 *
 * One model call, no loop. The model never fabricates facts absent from the
 * blob — unsupported questions simply fall to review.
 */
import type { FormSpec, SpecQuestion, Answers } from './formSpec';

export interface Inference {
  id: string;
  value: string | null; // null/'' → couldn't infer; leave for review
  reason: string;
}

export type InferModel = (spec: FormSpec, blob: string) => Promise<Inference[]>;

/** Keep only inferences that carry a usable value. */
export function toAnswers(inferences: Inference[]): Answers {
  const answers: Answers = {};
  for (const inf of inferences) {
    if (inf.value != null && inf.value !== '') answers[inf.id] = inf.value;
  }
  return answers;
}

/** Spec questions with no answer yet — the human's to-do list. */
export function pendingReview(spec: FormSpec, answers: Answers): SpecQuestion[] {
  return spec.questions.filter((q) => answers[q.id] == null);
}

export interface InferResult {
  answers: Answers;
  review: SpecQuestion[];
}

export async function inferAnswers(
  spec: FormSpec,
  blob: string,
  model: InferModel,
): Promise<InferResult> {
  const known = new Set(spec.questions.map((q) => q.id));
  const inferences = (await model(spec, blob)).filter((i) => known.has(i.id));
  const answers = toAnswers(inferences);
  return { answers, review: pendingReview(spec, answers) };
}
