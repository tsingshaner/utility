import { describe } from 'vitest'

import { compact } from './compact'

describe('test compact', (test) => {
  test('should filter empty filed', ({ expect }) => {
    const obj = {
      a: 1,
      b: null,
      c: undefined,
      d: 'test'
    }

    const result = compact(obj)

    expect(result).toStrictEqual({
      a: 1,
      d: 'test'
    })
  })

  test('use custom filter function', ({ expect }) => {
    const obj = {
      a: 1,
      b: null,
      c: undefined,
      d: 'test',
      e: 0,
      fn: () => {}
    }

    const result = compact(obj, (v, k) => !!v && k !== 'fn')

    expect(result).toStrictEqual({
      a: 1,
      d: 'test'
    })
  })
})
