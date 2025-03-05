import { describe } from 'vitest'

import { mergeObject } from './merge'

describe('test merge object util', (test) => {
  test('basic case', ({ expect }) => {
    const source = {
      a: 1,
      b: {
        c: 2,
        d: 3
      }
    }
    const overrides = {
      a: 2,
      b: {
        c: 3,
        e: 4
      }
    }

    const result = mergeObject(source, overrides)

    expect(source === result).toBe(true)
    expect(source).toEqual({
      a: 2,
      b: {
        c: 3,
        d: 3,
        e: 4
      }
    })
  })

  test('accept empty values', ({ expect }) => {
    expect(mergeObject({ a: 1 }, { a: null })).toEqual({ a: 1 })
    expect(mergeObject({ a: 1 }, { a: null }, { acceptEmptyValues: true })).toEqual({ a: null })
  })

  test('merge array', ({ expect }) => {
    expect(mergeObject({ a: [1, 2, 3] }, { a: [3, 4] })).toEqual({ a: [1, 2, 3, 3, 4] })
    expect(mergeObject({ a: [1, 2, 3] }, { a: [3, 4] }, { arrayMergeStrategy: 'union' })).toEqual({ a: [1, 2, 3, 4] })
    expect(mergeObject({ a: [1, 2, 3] }, { a: [3, 4] }, { arrayMergeStrategy: 'replace' })).toEqual({ a: [3, 4] })
    expect(
      mergeObject(
        { a: [1, 2, 3] },
        { a: [1, 2, 3, 4] },
        { arrayMergeStrategy: (a, b) => a.concat(b.filter((i) => (i as number) > 2)) }
      )
    ).toEqual({ a: [1, 2, 3, 3, 4] })
  })
})
