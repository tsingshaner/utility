import { afterEach, describe, expect, test, vi } from 'vitest'

import { cleanup, getAppContext, onShutdown } from './index'
import { createTestApp } from './test-utils'

describe('nitroPlugin', () => {
  afterEach(() => vi.restoreAllMocks())

  test('isolates concurrent requests across await boundaries and preserves request context', async () => {
    const app = createTestApp({ features: { serverTiming: true } }, async ({ req }) => {
      const context = getAppContext()
      await new Promise((resolve) => setTimeout(resolve, 1))
      expect(getAppContext()).toBe(context)
      expect(context?.requestId).toBe(req.headers.get('X-Request-ID'))
      expect(req.context?.existing).toBe('preserved')
      context?.serverTiming?.push(`${context.requestId};dur=1`)
      return ''
    })

    const responses = await Promise.all(
      ['first', 'second'].map((id) =>
        app.fetch(
          Object.assign(new Request('https://example.test', { headers: { 'X-Request-ID': id } }), {
            context: { existing: 'preserved' }
          })
        )
      )
    )

    expect(responses.map((res) => res.headers.get('X-Request-ID'))).toEqual(['first', 'second'])
    expect(responses.map((res) => res.headers.get('Server-Timing'))).toEqual(['first;dur=1', 'second;dur=1'])
    expect(getAppContext()).toBeUndefined()
  })

  test.each([null, undefined])('generates a UUID when the parent resolver returns %s', async (parentId) => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000456')
    const app = createTestApp({ getParentRequestId: () => parentId })

    const response = await app.fetch(new Request('https://example.test', { headers: { 'X-Request-ID': 'incoming' } }))

    expect(response.headers.get('X-Request-ID')).toBe('00000000-0000-0000-0000-000000000456')
  })

  test('uses the parent resolver with a custom response header', async () => {
    const app = createTestApp({
      getParentRequestId: ({ req }) => req.headers.get('X-Upstream-ID'),
      requestIdHeader: 'X-Correlation-ID'
    })

    const response = await app.fetch(new Request('https://example.test', { headers: { 'X-Upstream-ID': 'parent' } }))

    expect(response.headers.get('X-Correlation-ID')).toBe('parent')
  })

  test('suppresses an empty parent request ID', async () => {
    const app = createTestApp({ getParentRequestId: () => '' })

    const response = await app.fetch(new Request('https://example.test'))

    expect(response.headers.get('X-Request-ID')).toBeNull()
  })

  test('skips the parent resolver when request IDs are disabled', async () => {
    const getParentRequestId = vi.fn(() => 'parent')
    const app = createTestApp({ features: { requestId: false, serverTiming: true }, getParentRequestId }, () => {
      getAppContext()?.serverTiming?.push('db;dur=1.2')
      return ''
    })

    const response = await app.fetch(new Request('https://example.test'))

    expect(getParentRequestId).not.toHaveBeenCalled()
    expect(response.headers.get('X-Request-ID')).toBeNull()
    expect(response.headers.get('Server-Timing')).toBe('db;dur=1.2')
  })

  test('awaits custom asynchronous request loggers', async () => {
    const messages: string[] = []
    const logger = {
      debug: async (message: string) => {
        await Promise.resolve()
        messages.push(message)
      },
      info: async (message: string, props: Record<string, unknown>) => {
        await Promise.resolve()
        expect(props).toMatchObject({ pathname: '/test', query: '?a=1', requestId: 'logged', status: 201 })
        messages.push(message)
      }
    }
    const app = createTestApp({ logger }, () => new Response('', { status: 201 }))

    await app.fetch(new Request('https://example.test/test?a=1', { headers: { 'X-Request-ID': 'logged' } }))

    expect(messages).toEqual(['request start', 'request end'])
  })

  test('settles all shutdown callbacks even when one throws synchronously', async () => {
    const error = new Error('cleanup failed')
    onShutdown(() => {
      throw error
    })
    onShutdown(async () => {})

    expect(await cleanup()).toEqual([
      { reason: error, status: 'rejected' },
      { status: 'fulfilled', value: undefined }
    ])
  })
})
