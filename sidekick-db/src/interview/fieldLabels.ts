/**
 * Associates each fillable field with the label text physically next to it on
 * the page. Field NAMES are often cryptic and ambiguous ("Perm Park Placard.0"
 * vs ".1") — but their on-page POSITION isn't. Matching each widget to the
 * words on its row resolves what the name can't, so the binding step no longer
 * has to guess which checkbox means what.
 *
 * pdf-lib gives widget rectangles (origin bottom-left); `pdftotext -bbox-layout`
 * gives word boxes (origin top-left). We flip the widget into the word frame via
 * the page height, then take the words sitting to the right of the widget on the
 * same row.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PDFDocument } from 'pdf-lib';
import { decryptToBuffer } from './formSource';

const run = promisify(execFile);

interface Word { text: string; xMin: number; yMin: number; xMax: number; yMax: number }

/** Parse `pdftotext -bbox-layout` XML into words grouped by page (in order). */
function parseWordsByPage(xml: string): Word[][] {
  const pages: Word[][] = [];
  const pageChunks = xml.split(/<page\b/).slice(1);
  for (const chunk of pageChunks) {
    const words: Word[] = [];
    const re = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"[^>]*>([^<]*)<\/word>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(chunk))) {
      words.push({
        xMin: +m[1], yMin: +m[2], xMax: +m[3], yMax: +m[4],
        text: m[5].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      });
    }
    pages.push(words);
  }
  return pages;
}

/** Words on the same row as [yTop,yBot], to the right of xRight, nearest first. */
function labelRightOf(words: Word[], yTop: number, yBot: number, xRight: number): string {
  const rowMid = (yTop + yBot) / 2;
  const onRow = words
    .filter((w) => {
      const wMid = (w.yMin + w.yMax) / 2;
      return wMid >= yTop - 3 && wMid <= yBot + 3 && w.xMin >= xRight - 4;
    })
    .sort((a, b) => a.xMin - b.xMin);

  const picked: string[] = [];
  let prevX: number | null = null;
  for (const w of onRow) {
    if (prevX !== null && w.xMin - prevX > 45) break; // gap → next column
    picked.push(w.text);
    prevX = w.xMax;
    if (picked.length >= 10) break;
    void rowMid;
  }
  return picked.join(' ');
}

export async function readFieldLabels(pdfPath: string): Promise<Record<string, string>> {
  const bytes = await decryptToBuffer(pdfPath);
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  const pageRefs = pages.map((p) => p.ref);

  const { stdout } = await run('pdftotext', ['-bbox-layout', pdfPath, '-']);
  const wordsByPage = parseWordsByPage(stdout);

  const labels: Record<string, string> = {};

  for (const field of doc.getForm().getFields()) {
    const type = field.constructor.name;
    if (type !== 'PDFCheckBox' && type !== 'PDFRadioGroup') continue;

    const parts: string[] = [];
    for (const widget of (field as any).acroField.getWidgets()) {
      const rect = widget.getRectangle();
      const pageRef = widget.P?.();
      const pageIdx = Math.max(0, pageRefs.findIndex((r) => r === pageRef));
      const height = pages[pageIdx]?.getHeight() ?? 792;
      const words = wordsByPage[pageIdx] ?? [];

      const yTop = height - (rect.y + rect.height); // flip to top-left frame
      const yBot = height - rect.y;
      const xRight = rect.x + rect.width;
      const label = labelRightOf(words, yTop, yBot, xRight);
      if (label) parts.push(label);
    }
    if (parts.length) labels[field.getName()] = parts.join(' | ');
  }
  return labels;
}
