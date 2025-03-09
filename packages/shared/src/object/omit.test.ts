import { describe } from 'vitest'

import { omit, toOmitted } from './omit'

describe('test omit', (test) => {
  test('test toOmitted', ({ expect }) => {
    const obj1 = {
      a: 1,
      b: 2,
      c: 'a'
    }

    const obj2 = toOmitted(obj1, ['c'])
    expect(obj2).toStrictEqual({ a: 1, b: 2 })

    obj2.a = 2
    expect(obj1.a).toBe(1)
  })

  test('test toOmitted', ({ expect }) => {
    const obj1 = {
      a: 1,
      b: 2,
      c: 'a'
    }

    const obj2 = omit(obj1, ['c'])
    expect(obj2).toStrictEqual({ a: 1, b: 2 })

    obj2.a = 2
    expect(obj1.a).toBe(2)
  })
})
