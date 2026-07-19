/**
 * A FormSpec is the form's questionnaire, extracted from the PDF in ONE model
 * pass and then saved. Everything after that — deciding what to ask next,
 * mapping answers back onto the PDF — is deterministic and instant, with no
 * further model calls. That's what keeps the interview fast.
 *
 * Each question carries how its answer writes to the PDF (`fill`) and, when the
 * model judged a question conditional, the branch it depends on (`askWhen`).
 */
import type { Assignment } from './writeFilledPdf';

/** Answers collected so far, keyed by question id. null = asked but left blank. */
export type Answers = Record<string, string | null>;

/** How one answer writes into the PDF. */
export type FillRule =
  // Text field: write the answer string verbatim.
  | { field: string; kind: 'text' }
  // Button field: set it to valueMap[answer] (the on-value read off the PDF),
  // or clear it to Off when the answer isn't in the map. One choice question
  // can target several button fields — the matching option turns its box on.
  | { field: string; kind: 'button'; valueMap: Record<string, string> };

export interface SpecQuestion {
  id: string;
  label: string;
  inputType: 'text' | 'date' | 'choice';
  options?: string[];
  help?: string;
  /** Only ask this when a prior answer matches (model-authored branch). */
  askWhen?: { id: string; equals: string };
  fill: FillRule[];
}

export interface FormSpec {
  formTitle: string;
  questions: SpecQuestion[];
}

function conditionMet(q: SpecQuestion, answers: Answers): boolean {
  if (!q.askWhen) return true;
  return answers[q.askWhen.id] === q.askWhen.equals;
}

function isAnswered(answers: Answers, id: string): boolean {
  return id in answers && answers[id] != null;
}

/** Questions still worth asking: condition satisfied and not yet answered. */
export function selectQuestions(spec: FormSpec, answers: Answers): SpecQuestion[] {
  return spec.questions.filter(
    (q) => conditionMet(q, answers) && !isAnswered(answers, q.id),
  );
}

/** Turn collected answers into PDF field assignments, deterministically. */
export function applySpec(spec: FormSpec, answers: Answers): Assignment[] {
  const out: Assignment[] = [];
  for (const q of spec.questions) {
    const answer = answers[q.id];
    if (answer == null || answer === '') continue;
    const key = String(answer);
    for (const rule of q.fill) {
      if (rule.kind === 'text') {
        out.push({ field: rule.field, value: key });
      } else {
        out.push({ field: rule.field, value: rule.valueMap[key] ?? null });
      }
    }
  }
  return out;
}
