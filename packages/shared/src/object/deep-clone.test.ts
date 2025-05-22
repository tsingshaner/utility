import { klona } from 'klona/full'
import { describe, expect, vi } from 'vitest'

import { getStringTag } from './deep-clone'

class MyDate extends Date {
  readonly [Symbol.toStringTag]: string = 'MyDate'
}

class MyMap extends Map {}

describe.skip('test clone', (test) => {
  test.each([
    [undefined, 'Undefined'],
    [null, 'Null'],
    [true, 'Boolean'],
    [1, 'Number'],
    ['string', 'String'],
    [Symbol('symbol'), 'Symbol'],
    [() => {}, 'Function'],
    [[], 'Array'],
    [new Date(), 'Date'],
    [new Map(), 'Map'],
    [new Set(), 'Set'],
    [new RegExp(/^\$/), 'RegExp'],
    [new MyDate(), 'MyDate'],
    [new MyMap(), 'Map'],
    [new DataView(new ArrayBuffer(8)), 'DataView']
  ])('get [Symbol.toStringTag] of %o -> %s', (v, expected) => expect(getStringTag(v)).toBe(expected))

  test('test clone object', ({ expect }) => {
    const obj = {
      a: 1,
      b: 2,
      c: {
        d: 3,
        e: 4
      }
    }

    const objCloned = klona(obj)
    objCloned.c.d = 5

    expect(obj.c.d).toBe(3)
    expect(objCloned.c.d).toBe(5)
  })

  test('test clone loop object', ({ expect }) => {
    interface LoopObject {
      obj?: LoopObject
    }

    const objLoop: LoopObject = {}
    objLoop.obj = objLoop

    const objCloned = klona(objLoop)
  })

  test('test object with RegExp, Date, Map, Set', ({ expect }) => {
    const obj = {
      a: /a/,
      b: new Date(),
      c: new Map(),
      d: new Set([1, 2, 3])
    }

    const objCloned = klona(obj)

    expect(objCloned.a).not.toBe(obj.a)
    expect(objCloned.b).not.toBe(obj.b)
    expect(objCloned.c).not.toBe(obj.c)

    expect(objCloned.d.difference(obj.d).size).toBe(0)
    expect(objCloned.d).not.toBe(obj.d)
  })
})
