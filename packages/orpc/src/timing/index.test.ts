import { describe, expect, test } from 'vitest'

import { createTestApp } from '../context/test-utils'
import { endTime, measure, setTime, startTime } from './index'

describe('measure', () => {
  test('adds a completed operation to the Server-Timing response header', async () => {
    const app = createTestApp({ features: { serverTiming: true } }, async () => {
      await measure('db.user.find', () => 'user', { description: 'User query' })
      return new Response()
    })
    const response = await app.fetch(new Request('https://example.test'))

    expect(response.headers.get('Server-Timing')).toMatch(/^db\.user\.find;dur=\d+(?:\.\d+)?;desc="User query"$/)
  })

  test('records a failed operation before rethrowing its error', async () => {
    const app = createTestApp({ features: { serverTiming: true } }, async () => {
      await expect(
        measure('cache.read', () => {
          throw new Error('unavailable')
        })
      ).rejects.toThrow('unavailable')
      return new Response()
    })
    const response = await app.fetch(new Request('https://example.test'))

    expect(response.headers.get('Server-Timing')).toMatch(/^cache\.read;dur=\d+(?:\.\d+)?$/)
  })

  test('adds preset and manually measured Server-Timing metrics', async () => {
    const app = createTestApp({ features: { serverTiming: true } }, () => {
      setTime('cache', 1.2, 'Cache lookup')
      startTime('db', 'User query')
      endTime('db')
      return new Response()
    })
    const response = await app.fetch(new Request('https://example.test'))

    expect(response.headers.get('Server-Timing')).toMatch(
      /^cache;dur=1\.2;desc="Cache lookup",db;dur=\d+(?:\.\d+)?;desc="User query"$/
    )
  })

  test('runs outside an nitroPlugin request', async () => {
    await expect(measure('background.job', () => 'done')).resolves.toBe('done')
  })

  test('normalizes metric names and escapes descriptions', async () => {
    const app = createTestApp({ features: { serverTiming: true } }, () => {
      setTime('cache read', 1, 'cache "primary"')
      return new Response()
    })
    const response = await app.fetch(new Request('https://example.test'))

    expect(response.headers.get('Server-Timing')).toBe('cache_read;dur=1.0;desc="cache \\"primary\\""')
  })
})
