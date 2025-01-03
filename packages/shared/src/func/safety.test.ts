import { describe } from 'vitest'

import { asyncSafety, syncSafety } from './safety'

describe('Should catch fn errors.', (test) => {
  const maybeErrorFn = (throwError = false) => {
    if (throwError) {
      throw new Error('An error message')
    }

    return 0
  }

  const asyncMaybeErrorFn = async (throwError = false) => {
    await Promise.resolve(maybeErrorFn(throwError))
    return 0
  }

  test('Should catch sync errors', ({ expect }) => {
    const fn = syncSafety(maybeErrorFn)

    let [res, success] = fn()
    expect(success).toBeTruthy()
    expect(res).toBe(0)

    // should catch error.
    ;[res, success] = fn(true)
    expect(success).toBeFalsy()
    expect(res).instanceOf(Error)
    expect((res as Error).message).toBe('An error message')
  })

  test('Should catch async errors', async ({ expect }) => {
    const fn = asyncSafety(asyncMaybeErrorFn)

    let [res, success] = await fn()
    expect(success).toBeTruthy()
    expect(res).toBe(0)

    // should catch error.
    ;[res, success] = await fn(true)
    expect(success).toBeFalsy()
    expect(res).instanceOf(Error)
    expect((res as Error).message).toBe('An error message')
  })
})
