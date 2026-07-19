import { PDFDocument, PDFName, PDFDict, StandardFonts, type PDFForm } from 'pdf-lib';
import type { FormDefinition } from '../schema/types';

/** A resolved value ready to write: string for text/enum, boolean for checkbox. */
export type ResolvedValue = string | boolean | null;

/**
 * Set a button field (checkbox or radio) to a specific export value, working at
 * the AcroField/widget layer so it is robust to pdf-lib misclassifying the DMV
 * radio groups as checkboxes. `exportName === null` clears the field to Off.
 */
export function setButtonExport(form: PDFForm, fieldName: string, exportName: string | null): void {
  const acro = (form.getField(fieldName) as any).acroField;
  const target = exportName === null ? null : PDFName.of(exportName).asString();
  const off = PDFName.of('Off');
  let matched = false;

  for (const widget of acro.getWidgets()) {
    const ap = widget.dict.lookup(PDFName.of('AP'), PDFDict) as PDFDict | undefined;
    const nDict = ap?.lookup(PDFName.of('N'), PDFDict) as PDFDict | undefined;
    const hasTarget =
      target !== null && !!nDict?.keys().some((k) => k.asString() === target);
    if (hasTarget) {
      widget.setAppearanceState(PDFName.of(exportName!));
      matched = true;
    } else {
      widget.setAppearanceState(off);
    }
  }

  acro.dict.set(PDFName.of('V'), matched ? PDFName.of(exportName!) : off);
}

/**
 * Fill a form's AcroForm fields from resolved values, returning new PDF bytes.
 * The template MUST be decrypted (see templates/reg195.pdf) — pdf-lib cannot
 * read field names from the encrypted DMV original.
 */
export async function fillForm(
  template: Uint8Array,
  def: FormDefinition,
  resolved: Record<string, ResolvedValue>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(template);
  const form = doc.getForm();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const field of def.fields) {
    const value = resolved[field.key];

    // Virtual fields (no AcroForm widget) are drawn at fixed coordinates.
    if (field.stamp && value != null && value !== '') {
      const page = doc.getPage(field.stamp.page);
      page.drawText(String(value), {
        x: field.stamp.x,
        y: field.stamp.y,
        size: field.stamp.size ?? 10,
        font,
      });
      continue;
    }

    if (!field.pdf) continue;

    switch (field.pdf.kind) {
      case 'text': {
        if (value == null || value === '') break;
        const str = String(value);
        form.getTextField(field.pdf.field).setText(field.pdf.toPdf ? field.pdf.toPdf(str) : str);
        break;
      }
      case 'checkbox': {
        setButtonExport(form, field.pdf.field, value ? field.pdf.on : null);
        break;
      }
      case 'checkboxGroup': {
        for (const [option, { field: name, on }] of Object.entries(field.pdf.options)) {
          setButtonExport(form, name, value === option ? on : null);
        }
        break;
      }
      case 'radio': {
        const exportName = value == null ? null : field.pdf.options[String(value)] ?? null;
        setButtonExport(form, field.pdf.field, exportName);
        break;
      }
      case 'select': {
        if (value == null || value === '') break;
        const option = field.pdf.options?.[String(value)] ?? String(value);
        form.getDropdown(field.pdf.field).select(option);
        break;
      }
    }
  }

  return doc.save();
}
