/**
 * Reads a PDF's fillable fields with enough detail to WRITE them back:
 *  - text fields, and
 *  - button fields (checkboxes/radios) with their real "on" export values,
 *    decoded from the PDF name encoding (e.g. `/#20` → a literal space,
 *    `/yes.#20` → "yes. "). These export values are read off the PDF, never
 *    guessed — the whole reason the writer can be form-agnostic.
 *
 * Push buttons (Print, Clear Form) have no on-value and are omitted.
 */
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';
import { decryptToBuffer } from './formSource';
import { readFieldLabels } from './fieldLabels';

export interface FillableField {
  name: string;
  kind: 'text' | 'button';
  onValues: string[]; // non-empty only for buttons
  /** Label text sitting next to the field on the page, when detectable.
   *  Resolves what the (often cryptic) field name cannot. */
  label?: string;
}

/** Decode a PDF name token ("/yes.#20") to its logical string ("yes. "). */
function decodeName(token: string): string {
  const noSlash = token.startsWith('/') ? token.slice(1) : token;
  return noSlash.replace(/#([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function onValuesFor(field: any): string[] {
  const ons: string[] = [];
  for (const widget of field.acroField.getWidgets()) {
    const ap = widget.dict.lookup(PDFName.of('AP'), PDFDict) as PDFDict | undefined;
    const nDict = ap?.lookup(PDFName.of('N'), PDFDict) as PDFDict | undefined;
    if (!nDict) continue;
    for (const key of nDict.keys()) {
      const decoded = decodeName(key.asString());
      if (decoded !== 'Off' && !ons.includes(decoded)) ons.push(decoded);
    }
  }
  return ons;
}

export async function readFillableFields(pdfPath: string): Promise<FillableField[]> {
  const [doc, labels] = await Promise.all([
    PDFDocument.load(await decryptToBuffer(pdfPath)),
    readFieldLabels(pdfPath),
  ]);
  const out: FillableField[] = [];

  for (const field of doc.getForm().getFields()) {
    const type = field.constructor.name;
    const name = field.getName();
    const label = labels[name];
    if (type === 'PDFTextField') {
      out.push({ name, kind: 'text', onValues: [], ...(label ? { label } : {}) });
    } else if (type === 'PDFCheckBox' || type === 'PDFRadioGroup') {
      const onValues = onValuesFor(field as any);
      if (onValues.length) out.push({ name, kind: 'button', onValues, ...(label ? { label } : {}) });
    }
    // PDFButton (push buttons) and others are not fillable — skip.
  }
  return out;
}
