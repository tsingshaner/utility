import { describe, expect, test } from 'vitest'

import { AppContextPlugin } from '../context'
import { endTime, measure, setTime, startTime } from './index'

describe('measure', () => {
  test('adds a completed operation to the Server-Timing response header', async () => {
    const plugin = new AppContextPlugin({ features: { serverTiming: true } })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: async () => {
        await measure('db.user.find', () => 'user', { description: 'User query' })
        return { matched: true as const, response }
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('Server-Timing')).toMatch(/^db\.user\.find;dur=\d+(?:\.\d+)?;desc="User query"$/)
  })

  test('records a failed operation before rethrowing its error', async () => {
    const plugin = new AppContextPlugin({ features: { serverTiming: true } })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: async () => {
        await expect(
          measure('cache.read', () => {
            throw new Error('unavailable')
          })
        ).rejects.toThrow('unavailable')
        return { matched: true as const, response }
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('Server-Timing')).toMatch(/^cache\.read;dur=\d+(?:\.\d+)?$/)
  })

  test('adds preset and manually measured Server-Timing metrics', async () => {
    const plugin = new AppContextPlugin({ features: { serverTiming: true } })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        setTime('cache', 1.2, 'Cache lookup')
        startTime('db', 'User query')
        endTime('db')
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('Server-Timing')).toMatch(
      /^cache;dur=1\.2;desc="Cache lookup",db;dur=\d+(?:\.\d+)?;desc="User query"$/
    )
  })

  test('runs outside an AppContextPlugin request', async () => {
    await expect(measure('background.job', () => 'done')).resolves.toBe('done')
  })

  test('normalizes metric names and escapes descriptions', async () => {
    const plugin = new AppContextPlugin({ features: { serverTiming: true } })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        setTime('cache read', 1, 'cache "primary"')
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('Server-Timing')).toBe('cache_read;dur=1.0;desc="cache \\"primary\\""')
  })
})
