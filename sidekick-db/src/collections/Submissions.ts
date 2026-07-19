import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'
import path from 'path'
import os from 'os'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import type { FormSpec } from '../interview/formSpec'
import { applySpec } from '../interview/formSpec'
import { inferAnswers } from '../interview/inferAnswers'
import { buildOpenRouterInferModel } from '../interview/openrouterInferModel'
import { writeFilledPdf } from '../interview/writeFilledPdf'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const FORMS_UPLOAD_DIR = path.resolve(dirname, '../../uploads')

/**
 * One patient's attempt at a form. Pick a Form and paste what you know about the
 * person (freeform); on create the app infers every answer it can, fills the
 * PDF, and leaves the rest as `review` for a human. Nothing auto-submits.
 */
const fillOnCreate: CollectionAfterChangeHook = ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const formId = typeof doc.form === 'object' ? doc.form?.id : doc.form
  if (!formId) return doc

  ;(async () => {
    try {
      const form = await req.payload.findByID({ collection: 'forms', id: formId })
      const spec = form?.questions as FormSpec | undefined
      if (!spec?.questions?.length || !form.filename) {
        throw new Error('form has no extracted questions yet (is its status "ready"?)')
      }
      const pdfPath = path.join(FORMS_UPLOAD_DIR, form.filename as string)

      const model = buildOpenRouterInferModel(process.env.SK_MODEL)
      const { answers, review } = await inferAnswers(spec, (doc.info as string) ?? '', model)
      const pdfBytes = await writeFilledPdf(pdfPath, applySpec(spec, answers))

      // Store the filled PDF as a Media upload so it gets a served URL.
      const tmp = path.join(os.tmpdir(), `filled-${doc.id}-${Date.now()}.pdf`)
      await writeFile(tmp, Buffer.from(pdfBytes))
      const media = await req.payload.create({
        collection: 'media',
        data: { alt: `Filled: ${form.title}` },
        filePath: tmp,
        overrideAccess: true,
      })

      await req.payload.update({
        collection: 'submissions',
        id: doc.id,
        data: {
          status: 'ready',
          answers,
          review: review.map((q) => ({ id: q.id, label: q.label })),
          filledPdf: media.id,
        },
        overrideAccess: true,
      })
    } catch (err) {
      req.payload.logger.error(`submission fill failed: ${err instanceof Error ? err.message : err}`)
      await req.payload.update({
        collection: 'submissions',
        id: doc.id,
        data: { status: 'error' },
        overrideAccess: true,
      })
    }
  })()

  return doc
}

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  // Wide open — no auth required (fine behind a private ngrok / demo).
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  admin: { useAsTitle: 'id', defaultColumns: ['form', 'status', 'createdAt'] },
  fields: [
    { name: 'form', type: 'relationship', relationTo: 'forms', required: true },
    {
      name: 'info',
      type: 'textarea',
      admin: { description: "What you know about the person (freeform — the app infers answers from this)." },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'filling',
      options: [
        { label: 'Filling…', value: 'filling' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { readOnly: true },
    },
    { name: 'answers', type: 'json', admin: { readOnly: true, description: 'Inferred field answers.' } },
    { name: 'review', type: 'json', admin: { readOnly: true, description: "Questions the app couldn't infer — for a human." } },
    { name: 'filledPdf', type: 'upload', relationTo: 'media', admin: { readOnly: true } },
  ],
  hooks: { afterChange: [fillOnCreate] },
}

export default Submissions
