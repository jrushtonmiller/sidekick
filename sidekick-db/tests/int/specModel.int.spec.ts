import { describe, it, expect, vi } from 'vitest'
import type { FillableField } from '@/interview/fillableFields'
import {
  chunk,
  reconstructQuestions,
  buildFormSpec,
  type SlimQuestion,
} from '@/interview/openrouterSpecModel'

describe('chunk', () => {
  it('splits into batches of the given size, last batch short', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })

  it('returns a single batch when smaller than the size', () => {
    expect(chunk([1, 2], 40)).toEqual([[1, 2]])
  })
})

describe('reconstructQuestions', () => {
  const fields: FillableField[] = [
    { name: 'First', kind: 'text', onValues: [] },
    { name: 'Perm Park Placard', kind: 'button', onValues: [' '] },
    { name: 'Travel Park Placard', kind: 'button', onValues: [' '] },
  ]

  it('resolves a text fill to the real field name', () => {
    const slim: SlimQuestion[] = [
      { id: 'firstName', label: 'First name', inputType: 'text', fill: [{ f: 0 }] },
    ]
    const [q] = reconstructQuestions(slim, fields)
    expect(q.fill).toEqual([{ field: 'First', kind: 'text' }])
  })

  it('resolves a button fill by field index + on-value index into a verbatim valueMap', () => {
    const slim: SlimQuestion[] = [
      {
        id: 'placardType',
        label: 'Placard type',
        inputType: 'choice',
        options: ['Permanent', 'Traveling'],
        fill: [
          { f: 1, map: { Permanent: 0 } },
          { f: 2, map: { Traveling: 0 } },
        ],
      },
    ]
    const [q] = reconstructQuestions(slim, fields)
    expect(q.fill).toEqual([
      { field: 'Perm Park Placard', kind: 'button', valueMap: { Permanent: ' ' } },
      { field: 'Travel Park Placard', kind: 'button', valueMap: { Traveling: ' ' } },
    ])
  })

  it('drops fill entries whose field or on-value index is out of range', () => {
    const slim: SlimQuestion[] = [
      {
        id: 'bad',
        label: 'Bad refs',
        inputType: 'choice',
        options: ['A', 'B'],
        fill: [
          { f: 99 }, // no such field
          { f: 1, map: { A: 0, B: 7 } }, // B's on-value index out of range
        ],
      },
    ]
    const [q] = reconstructQuestions(slim, fields)
    expect(q.fill).toEqual([
      { field: 'Perm Park Placard', kind: 'button', valueMap: { A: ' ' } },
    ])
  })
})

describe('buildFormSpec chunking', () => {
  it('splits fields into batches, calls the model per batch, and merges with per-batch local indices', async () => {
    const fields: FillableField[] = [
      { name: 'First', kind: 'text', onValues: [] },
      { name: 'Last', kind: 'text', onValues: [] },
      { name: 'SSN', kind: 'text', onValues: [] },
    ]
    const source = { pageText: 'APPLICATION', fields: fields.map((f) => f.name) }

    // One slim question per call, each referencing LOCAL index 0 of its batch.
    const responses = [
      JSON.stringify({ formTitle: 'App', questions: [{ id: 'q0', label: 'First', inputType: 'text', fill: [{ f: 0 }] }] }),
      JSON.stringify({ formTitle: 'App', questions: [{ id: 'q1', label: 'SSN', inputType: 'text', fill: [{ f: 0 }] }] }),
    ]
    const chat = vi.fn().mockImplementation(() => Promise.resolve(responses.shift()!))

    const spec = await buildFormSpec(source, fields, 'test-model', 'test-key', undefined, {
      chat,
      batchSize: 2,
    })

    expect(chat).toHaveBeenCalledTimes(2) // 3 fields / batchSize 2 => 2 batches
    expect(spec.formTitle).toBe('App')
    // Batch 1 local index 0 => 'First'; batch 2 local index 0 => 'SSN' (NOT 'First').
    expect(spec.questions.map((q) => q.fill)).toEqual([
      [{ field: 'First', kind: 'text' }],
      [{ field: 'SSN', kind: 'text' }],
    ])
  })
})
