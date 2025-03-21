import { afterEach, beforeEach, describe, vi } from 'vitest'

import { debounce } from './debounce'

const onInput = vi.fn(() => {})

describe('test debounce', (test) => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  test('test basic', ({ expect }) => {
    const fn = debounce(onInput)
    fn()

    expect(onInput).not.toHaveBeenCalled()
    vi.advanceTimersByTime(100)
    expect(onInput).toBeCalledTimes(1)

    const timer = setInterval(fn, 10)
    setTimeout(() => clearInterval(timer), 1000)

    vi.advanceTimersByTime(1099)
    expect(onInput).toBeCalledTimes(1)

    vi.advanceTimersByTime(10100)
    expect(onInput).toBeCalledTimes(2)
  })

  test('test at begin (leading)', ({ expect }) => {
    const fn = debounce(onInput, { atBegin: true })
    fn()
    fn()

    expect(onInput).toBeCalledTimes(1)

    vi.advanceTimersByTime(100)
    fn()

    expect(onInput).toBeCalledTimes(2)

    vi.advanceTimersByTime(50)
    fn()

    expect(onInput).toBeCalledTimes(2)
  })

  test('test cancel', ({ expect }) => {
    const fn = debounce(onInput)
    fn()
    vi.advanceTimersByTime(99)
    fn.cancel()

    vi.advanceTimersByTime(100)
    expect(onInput).not.toHaveBeenCalled()
  })

  test('test this context', ({ expect }) => {
    const obj = {
      count: 0,
      throttleOnMessage: debounce(
        function (this: { count: number }) {
          this.count++
        },
        { atBegin: true }
      )
    }

    obj.throttleOnMessage()
    vi.advanceTimersByTime(100)
    expect(obj.count).toBe(1)

    vi.advanceTimersByTime(100)
    const throttleOnMessage = obj.throttleOnMessage

    const obj2 = { count: 2 }
    throttleOnMessage.call(obj2)
    expect(obj2.count).toBe(3)
  })
})
