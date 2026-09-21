import { afterEach, describe, expect, test, vi } from 'vitest'

import { AppContextPlugin, getAppContext } from './index'

describe('AppContextPlugin', () => {
  afterEach(() => vi.restoreAllMocks())

  test('uses the parent resolver instead of the incoming request ID header', async () => {
    const plugin = new AppContextPlugin({
      getParentRequestId: ({ request }) => request.headers.get('X-Upstream-Request-ID'),
      requestIdHeader: 'X-Correlation-ID'
    })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        expect(getAppContext()?.requestId).toBe('parent-id')
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test', {
        headers: { 'X-Correlation-ID': 'incoming-id', 'X-Upstream-Request-ID': 'parent-id' }
      }),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('X-Correlation-ID')).toBe('parent-id')
    expect(getAppContext()).toBeUndefined()
  })

  test.each([null, undefined])('generates a UUID when the parent resolver returns %s', async (parentId) => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000456')
    const plugin = new AppContextPlugin({ getParentRequestId: () => parentId })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        expect(getAppContext()?.requestId).toBe('00000000-0000-0000-0000-000000000456')
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test', { headers: { 'X-Request-ID': 'incoming-id' } }),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('X-Request-ID')).toBe('00000000-0000-0000-0000-000000000456')
  })

  test('suppresses the request ID when the parent resolver returns an empty string', async () => {
    const randomUUID = vi.spyOn(crypto, 'randomUUID')
    const plugin = new AppContextPlugin({ getParentRequestId: () => '' })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        expect(getAppContext()?.requestId).toBeUndefined()
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test', { headers: { 'X-Request-ID': 'incoming-id' } }),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('X-Request-ID')).toBeNull()
    expect(randomUUID).not.toHaveBeenCalled()
  })

  test('skips the parent resolver when request IDs are disabled', async () => {
    const getParentRequestId = vi.fn(() => 'parent-id')
    const plugin = new AppContextPlugin({ features: { requestId: false }, getParentRequestId })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        expect(getAppContext()?.requestId).toBeUndefined()
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('X-Request-ID')).toBeNull()
    expect(getParentRequestId).not.toHaveBeenCalled()
  })

  test('propagates parent resolver errors before running the handler', () => {
    const error = new Error('Parent ID unavailable')
    const plugin = new AppContextPlugin({
      getParentRequestId: () => {
        throw error
      }
    })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const next = vi.fn(() => Promise.resolve({ matched: false as const }))

    expect(() =>
      interceptor?.({
        context: {},
        next,
        request: new Request('https://example.test'),
        toFetchResponseOptions: undefined
      })
    ).toThrow(error)
    expect(next).not.toHaveBeenCalled()
    expect(getAppContext()).toBeUndefined()
  })

  test('exposes the request ID to matched handlers and adds it to the response', async () => {
    const plugin = new AppContextPlugin({})
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    const result = await interceptor?.({
      context: {},
      next: () => {
        expect(getAppContext()).toEqual({ requestId: 'request-123' })
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test', { headers: { 'X-Request-ID': 'request-123' } }),
      toFetchResponseOptions: undefined
    })

    expect(result).toEqual({ matched: true, response })
    expect(response.headers.get('X-Request-ID')).toBe('request-123')
    expect(getAppContext()).toBeUndefined()
  })

  test('generates an ID for unmatched requests without adding a response header', async () => {
    const randomUUID = vi.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-0000-0000-000000000123')
    const plugin = new AppContextPlugin({})
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]

    const result = await interceptor?.({
      context: {},
      next: () => {
        expect(getAppContext()).toEqual({ requestId: '00000000-0000-0000-0000-000000000123' })
        return Promise.resolve({ matched: false as const })
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(result).toEqual({ matched: false })
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  test('uses a custom request ID header and preserves existing interceptors', async () => {
    const existingInterceptor = vi.fn()
    const plugin = new AppContextPlugin({ requestIdHeader: 'X-Correlation-ID' })

    const options = plugin.initFetchHandlerOptions({ fetchInterceptors: [existingInterceptor] })
    const response = new Response()
    const result = await options.fetchInterceptors?.[0]?.({
      context: {},
      next: () => {
        expect(getAppContext()).toEqual({ requestId: 'correlation-123' })
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test', { headers: { 'X-Correlation-ID': 'correlation-123' } }),
      toFetchResponseOptions: undefined
    })

    expect(options.fetchInterceptors).toEqual([expect.any(Function), existingInterceptor])
    expect(result).toEqual({ matched: true, response })
    expect(response.headers.get('X-Correlation-ID')).toBe('correlation-123')
  })

  test('can publish Server-Timing without enabling request IDs', async () => {
    const plugin = new AppContextPlugin({ features: { requestId: false, serverTiming: true } })
    const interceptor = plugin.initFetchHandlerOptions({}).fetchInterceptors?.[0]
    const response = new Response()

    await interceptor?.({
      context: {},
      next: () => {
        getAppContext()?.serverTiming?.push('db;dur=1.2')
        return Promise.resolve({ matched: true as const, response })
      },
      request: new Request('https://example.test'),
      toFetchResponseOptions: undefined
    })

    expect(response.headers.get('X-Request-ID')).toBeNull()
    expect(response.headers.get('Server-Timing')).toBe('db;dur=1.2')
  })
})
