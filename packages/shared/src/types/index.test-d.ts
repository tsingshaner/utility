import { assertType, describe, expectTypeOf } from 'vitest'

import type { Xor } from '.'

describe('test types', (test) => {
  test('test Xor', () => {
    type Color = Xor<Rgb, Hex>
    type Rgb = Record<'b' | 'g' | 'r', number>
    type Hex = Record<'hex', `#${string}` | number>

    assertType<Color>({ hex: '#000000' })
    assertType<Color>({ b: 0, g: 0, r: 0 })

    expectTypeOf({ hex: '#000000', r: 1 }).not.toEqualTypeOf<Color>()
    assertType<Hex | Rgb>({ hex: '#000000', r: 1 })
  })
})
