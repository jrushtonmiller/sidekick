/**
 * Writes a set of {field, value} assignments into a form PDF and returns the
 * filled bytes. Form-agnostic: text fields get their string, button fields
 * (checkboxes/radios) get set to the given on-value via the low-level widget
 * mechanism (robust to pdf-lib misclassifying DMV radio groups as checkboxes).
 * A blank/null value clears the field. Unknown field names are skipped.
 */
import { PDFDocument, type PDFForm } from 'pdf-lib';
import { setButtonExport } from '../writer/fillForm';
import { decryptToBuffer } from './formSource';

export interface Assignment {
  field: string;
  value: string | null;
}

export async function writeFilledPdf(
  pdfPath: string,
  assignments: Assignment[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(await decryptToBuffer(pdfPath));
  const form = doc.getForm();

  for (const { field, value } of assignments) {
    let f: ReturnType<typeof form.getField>;
    try {
      f = form.getField(field);
    } catch {
      continue; // field not present in this PDF
    }

    if (f.constructor.name === 'PDFTextField') {
      setTextSafely(form.getTextField(field), value ?? '');
    } else {
      setButtonExport(form, field, value && value !== '' ? value : null);
    }
  }

  return doc.save();
}

/**
 * Set a text field, tolerating comb/max-length fields. If the value overflows
 * (e.g. a dashed date into an 8-cell date comb), drop separators and truncate
 * to what fits rather than throwing and aborting the whole fill.
 */
function setTextSafely(field: ReturnType<PDFForm['getTextField']>, value: string): void {
  try {
    field.setText(value);
    return;
  } catch {
    const max = field.getMaxLength?.() ?? undefined;
    const compact = value.replace(/[^0-9A-Za-z]/g, '');
    const fitted = max ? compact.slice(0, max) : compact;
    try {
      field.setText(fitted);
    } catch {
      /* give up on this one field rather than fail the whole document */
    }
  }
}
