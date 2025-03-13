import { describe } from 'vitest'

import { getEnvPathKey } from './cross-platform'

describe('test get env path key', (test) => {
  test('returns the correct env path key', ({ expect }) => {
    const key = getEnvPathKey()

    expect(process.env[key]).toBeTypeOf('string')
  })
})
