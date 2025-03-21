import { afterEach, beforeEach, describe, vi } from 'vitest'

import { throttle } from './throttle'

const onMessage = vi.fn((_msg?: string) => 0)

describe('test throttle', (test) => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    vi.clearAllTimers()
    vi.restoreAllMocks()
  })

  test('test basic', ({ expect }) => {
    const throttleOnMessage = throttle(onMessage)
    const intervalId = setInterval(throttleOnMessage, 100)

    // 0ms
    throttleOnMessage()
    expect(onMessage).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)

    // 100ms will exec tailing in task queue
    expect(onMessage).toHaveBeenCalledTimes(1)

    // 101ms
    vi.advanceTimersByTime(1)
    expect(onMessage).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(99)

    // 200ms will exec tailing in task queue
    expect(onMessage).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(1)
    // 201ms
    expect(onMessage).toHaveBeenCalledTimes(3)
    clearInterval(intervalId)

    vi.runOnlyPendingTimers()
    expect(onMessage).toHaveBeenCalledTimes(3)
  })

  test('test delay option', ({ expect }) => {
    const throttleOnMessage = throttle(onMessage, { delay: 250 })
    setInterval(throttleOnMessage, 10)

    vi.advanceTimersByTime(1000)
    expect(onMessage).toHaveBeenCalledTimes(4)
  })

  test('test without leading', ({ expect }) => {
    throttle(onMessage, { trailing: false })()
    vi.advanceTimersByTime(0)
    expect(onMessage).toHaveBeenCalledOnce()

    vi.runOnlyPendingTimers()
    expect(onMessage).toHaveBeenCalledOnce()
  })

  test('test tailing & leading all set false', ({ expect }) => {
    expect(() => {
      throttle(onMessage, { leading: false, trailing: false })
    }).toThrow('`leading` and `trailing` could not all set `false`')
  })

  test('test without trailing', ({ expect }) => {
    const trailingThrottle = throttle(onMessage, { delay: 200, leading: false })
    trailingThrottle()
    setTimeout(trailingThrottle, 190)

    vi.advanceTimersByTime(199)
    expect(onMessage).not.toHaveBeenCalledOnce()

    vi.advanceTimersByTime(200)
    expect(onMessage).toHaveBeenCalledOnce()

    vi.runOnlyPendingTimers()
    expect(onMessage).toHaveBeenCalledOnce()
  })

  test('test cancel', ({ expect }) => {
    const throttleOnMessage = throttle(onMessage)
    setInterval(throttleOnMessage, 10)

    vi.advanceTimersByTime(500)
    vi.runOnlyPendingTimers()
    expect(onMessage).toHaveBeenCalledTimes(6)

    throttleOnMessage.cancel()
    vi.advanceTimersByTime(510)
    vi.runOnlyPendingTimers()
    expect(onMessage).toHaveBeenCalledTimes(6)
  })

  test('test this context', ({ expect }) => {
    const obj = {
      count: 0,
      throttleOnMessage: throttle(function (this: { count: number }) {
        this.count++
      })
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
