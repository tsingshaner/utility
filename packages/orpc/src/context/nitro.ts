import { AsyncLocalStorage } from 'node:async_hooks'

import type { NitroAppPlugin, NitroRuntimeHooks } from 'nitro/types'

type CleanFn = () => void | Promise<void>
const listeners = new Set<CleanFn>()

export const cleanup = (): Promise<PromiseSettledResult<void>[]> =>
  Promise.allSettled(Array.from(listeners, (fn) => Promise.resolve().then(fn)))
export const onShutdown = (fn: CleanFn): void => void listeners.add(fn)

/** Values scoped to a single Nitro request. */
export interface AppContext {
  requestId?: string
  serverTiming?: string[]
  startTime: number
}

export interface NitroPluginOptions {
  /** Omit to disable request logging. Async loggers are awaited. */
  logger?: {
    debug: (msg: string, props: Record<string, unknown>) => void | Promise<void>
    info: (msg: string, props: Record<string, unknown>) => void | Promise<void>
  }
  /** Defaults to requestId: true, serverTiming: false. */
  features?: { requestId?: boolean; serverTiming?: boolean }
  /** Defaults to X-Request-ID. */
  requestIdHeader?: string
  /** Replaces header lookup. Nullish values generate an ID; an empty string suppresses it. */
  getParentRequestId?: (event: Parameters<NitroRuntimeHooks['request']>[0]) => string | null | undefined
}

const appContext = new AsyncLocalStorage<AppContext>()

/** Returns undefined outside a request handled by nitroPlugin. */
export const getAppContext = (): AppContext | undefined => appContext.getStore()

/** Installs request context, response headers, optional logging, and shutdown hooks. */
export const nitroPlugin = ({
  logger,
  features = {},
  requestIdHeader = 'X-Request-ID',
  getParentRequestId
}: NitroPluginOptions = {}): NitroAppPlugin => {
  const { requestId: enableRequestId = true, serverTiming = false } = features

  const resolveRequestId =
    getParentRequestId ??
    (({ req }: Parameters<NitroRuntimeHooks['request']>[0]): string | null => req.headers.get(requestIdHeader))

  return (nitro: Parameters<NitroAppPlugin>[0]) => {
    const fetch = nitro.fetch.bind(nitro)
    nitro.fetch = (req: Request): ReturnType<typeof nitro.fetch> =>
      appContext.run({ serverTiming: serverTiming ? [] : undefined, startTime: performance.now() }, () => fetch(req))

    nitro.hooks.hook('request', async (event) => {
      const { req } = event
      const context = getAppContext()
      if (!context) {
        return
      }

      if (enableRequestId) {
        context.requestId = (resolveRequestId(event) ?? crypto.randomUUID()) || undefined
        if (context.requestId) {
          req.headers.set(requestIdHeader, context.requestId)
        }
      }
      req.context ??= {}
      Object.assign(req.context, context)

      const url = new URL(req.url)
      await logger?.debug('request start', {
        headers: Object.fromEntries(req.headers),
        method: req.method,
        pathname: url.pathname,
        query: url.search,
        requestId: context.requestId,
        runtime: req.runtime?.name
      })
    })

    nitro.hooks.hook('response', async (res, { req }) => {
      const context = getAppContext()
      if (!context) {
        return
      }

      if (context.requestId) {
        res.headers.set(requestIdHeader, context.requestId)
      }
      if (context.serverTiming?.length) {
        res.headers.set('Server-Timing', context.serverTiming.join(','))
      }

      const url = new URL(req.url)
      await logger?.info('request end', {
        durationMs: Math.round((performance.now() - context.startTime) * 100) / 100,
        headers: Object.fromEntries(res.headers),
        method: req.method,
        pathname: url.pathname,
        query: url.search,
        requestId: context.requestId,
        runtime: req.runtime?.name,
        status: res.status
      })
    })

    nitro.hooks.hook('close', cleanup)
  }
}
