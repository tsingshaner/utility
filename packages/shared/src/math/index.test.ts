import { describe } from 'vitest'

import { clamp } from '.'

describe('test math utils', (test) => {
  test.for([
    [1, 4, 3, 3],
    [1, 4, 5, 4],
    [1, 4, -1, 1],
    [1, 4, 2, 2],
    [1, 4, 1, 1],
    [1, 4, 4, 4],
    [1.5, 3.5, 2.5, 2.5],
    [1.5, 3.5, 0.5, 1.5],
    [1.5, 3.5, 4.5, 3.5]
  ])('[%d %d]  %d => %d', ([min, max, value, expected], { expect }) => {
    expect(clamp(value, min, max)).toBe(expected)
  })
})
