import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFormSource } from '../interview/formSource'
import { readFillableFields } from '../interview/fillableFields'
import { buildFormSpec } from '../interview/openrouterSpecModel'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(dirname, '../../uploads')

/**
 * A PDF form. You upload the PDF and give it a title; on create the app runs the
 * LLM extraction and fills in `questions` (the FormSpec) while flipping `status`
 * from "extracting" to "ready". One collection, self-contained.
 */
const extractOnCreate: CollectionAfterChangeHook = ({ doc, operation, req }) => {
  // Only kick off on create; the later status/questions write is an update and
  // must not re-trigger extraction.
  if (operation !== 'create' || !doc.filename) return doc

  const pdfPath = path.join(UPLOAD_DIR, doc.filename as string)

  // Fire-and-forget: the create returns immediately with status "extracting";
  // the record flips to "ready" (or "error") when the LLM pass finishes.
  ;(async () => {
    try {
      // Mark in-progress the moment the pass starts (visible on refresh).
      await req.payload.update({
        collection: 'forms',
        id: doc.id,
        data: { status: 'extracting' },
        overrideAccess: true,
      })
      const [source, fields] = await Promise.all([readFormSource(pdfPath), readFillableFields(pdfPath)])
      const spec = await buildFormSpec(source, fields, process.env.SK_MODEL)
      await req.payload.update({
        collection: 'forms',
        id: doc.id,
        data: { status: 'ready', questions: spec as unknown as Record<string, unknown> },
        overrideAccess: true,
      })
    } catch (err) {
      req.payload.logger.error(`form extraction failed: ${err instanceof Error ? err.message : err}`)
      await req.payload.update({
        collection: 'forms',
        id: doc.id,
        data: { status: 'error' },
        overrideAccess: true,
      })
    }
  })()

  return doc
}

export const Forms: CollectionConfig = {
  slug: 'forms',
  // Wide open — no auth required (fine behind a private ngrok / demo).
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  admin: { useAsTitle: 'title' },
  upload: {
    staticDir: UPLOAD_DIR,
    mimeTypes: ['application/pdf'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'inactive',
      options: [
        { label: 'Inactive', value: 'inactive' },
        { label: 'Extracting', value: 'extracting' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { readOnly: true, description: 'Set by the app after the LLM extraction pass.' },
    },
    {
      name: 'questions',
      type: 'json',
      admin: { readOnly: true, description: 'Extracted FormSpec (questions + PDF field bindings).' },
    },
  ],
  hooks: { afterChange: [extractOnCreate] },
}

export default Forms
