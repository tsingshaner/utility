import { describe } from 'vitest'

import { formatBytes } from './format-bytes'

describe('Test format bytes', (test) => {
  test.for([
    [0, '0 Bytes'],
    [1025, '1 KB'],
    [41404, '40.43 KB']
  ] as const)('', ([size, expected], { expect }) => expect(formatBytes(size)).toBe(expected))
})
