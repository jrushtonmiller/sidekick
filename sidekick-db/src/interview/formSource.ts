/**
 * Reads the two signals a model needs to understand ANY form PDF:
 *  - pageText: the text a person reads (headings, labels, instructions,
 *    eligibility rules) — extracted with `pdftotext -layout`.
 *  - fields:   the names of the fillable AcroForm widgets (the blanks that
 *    actually get filled) — read with pdf-lib.
 *
 * Nothing here is form-specific; point it at a PDF and it returns what's in it.
 * Many government PDFs are encrypted, which garbles the AcroForm field names,
 * so we decrypt to a temp copy with `qpdf` before reading the fields.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';

const run = promisify(execFile);

export interface FormSource {
  pageText: string;
  fields: string[];
}

async function extractText(pdfPath: string): Promise<string> {
  const { stdout } = await run('pdftotext', ['-layout', pdfPath, '-']);
  return stdout;
}

/**
 * Return the PDF's bytes with any encryption removed. Government PDFs are often
 * encrypted, which garbles pdf-lib's view of the AcroForm; `qpdf --decrypt`
 * yields a copy pdf-lib can read. A non-encrypted PDF is copied unchanged.
 */
export async function decryptToBuffer(pdfPath: string): Promise<Uint8Array> {
  const dir = await mkdtemp(join(tmpdir(), 'sk-form-'));
  const decrypted = join(dir, 'decrypted.pdf');
  try {
    // qpdf exits 0, or 3 for warnings, and still writes a usable file.
    await run('qpdf', ['--decrypt', pdfPath, decrypted]).catch((e) => {
      if (e?.code !== 3) throw e; // 3 = success-with-warnings
    });
    return new Uint8Array(await readFile(decrypted));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function extractFields(pdfPath: string): Promise<string[]> {
  const doc = await PDFDocument.load(await decryptToBuffer(pdfPath));
  return doc.getForm().getFields().map((f) => f.getName());
}

export async function readFormSource(pdfPath: string): Promise<FormSource> {
  const [pageText, fields] = await Promise.all([
    extractText(pdfPath),
    extractFields(pdfPath),
  ]);
  return { pageText, fields };
}
