import { AsyncLocalStorage } from 'node:async_hooks'

import type { Context } from '@orpc/server'
import type { FetchHandlerFetchInterceptor, FetchHandlerOptions, FetchHandlerPlugin } from '@orpc/server/fetch'

const featuresSymbol: unique symbol = Symbol('features')

/**
 * Request-scoped values installed by {@link AppContextPlugin}.
 *
 * Retrieve this object with {@link getAppContext} only while an oRPC request is
 * being handled. The store is backed by `AsyncLocalStorage`, so it remains
 * available across `await` boundaries within that request and is unavailable
 * outside it.
 */
export type AppContext = {
  /** Client-provided or generated ID for correlating a request and response. */
  requestId?: string
  /** Server-Timing metrics collected for the current request. */
  serverTiming?: string[]
  /** @internal Plugin configuration retained as non-enumerable metadata. */
  [featuresSymbol]?: AppContextPluginOptions['features']
}

/** Configuration for {@link AppContextPlugin}. */
interface AppContextPluginOptions<T extends Context = Context> {
  /** Features to enable. Defaults to `{ requestId: true, serverTiming: false }`. */
  features?: {
    /** Generate, propagate, and return a request ID. Defaults to `true`. */
    requestId?: boolean
    /** Collect metrics and write the `Server-Timing` response header. Defaults to `false`. */
    serverTiming?: boolean
  }
  /** Response/request header used for the request ID. Defaults to `X-Request-ID`. */
  requestIdHeader?: string
  /**
   * Resolves an upstream request ID synchronously from the fetch interceptor options.
   *
   * When provided, this callback replaces the default lookup of
   * `requestIdHeader` in the incoming request. Returning `null` or `undefined`
   * generates a new UUID; it does not fall back to the incoming header.
   * Returning an empty string suppresses the context request ID and response
   * header without generating a UUID. The callback is not invoked when
   * `features.requestId` is `false`.
   *
   * The resolved ID is exposed through {@link getAppContext} and written to
   * `requestIdHeader` on matched responses. Callback errors propagate to the
   * caller before downstream interceptors run.
   *
   * @param options - Fetch interceptor options, including the request and oRPC context.
   * @returns The upstream ID, or a nullish value to generate a new UUID.
   *
   * @example
   * ```ts
   * new AppContextPlugin({
   *   getParentRequestId: ({ request }) => request.headers.get('X-Upstream-Request-ID'),
   * })
   * ```
   */
  getParentRequestId?: (options: Parameters<FetchHandlerFetchInterceptor<T>>[0]) => string | undefined | null
}

type FetchInterceptorOptions<T extends Context> = Parameters<FetchHandlerFetchInterceptor<T>>[0]

/**
 * Installs request-local context for an oRPC fetch handler.
 *
 * Add this plugin to the handler once. It reads or generates a request ID,
 * exposes it through {@link getAppContext}, and adds it to matched responses.
 * With `features.serverTiming` enabled, timing helpers append metrics to the
 * same context and this plugin emits their `Server-Timing` header after the
 * request completes.
 *
 * @typeParam T - oRPC context type used by the fetch handler.
 *
 * @example
 * ```ts
 * const handler = new RPCHandler(router, {
 *   plugins: [new AppContextPlugin({ features: { serverTiming: true } })],
 * })
 * ```
 */
export class AppContextPlugin<T extends Context> implements FetchHandlerPlugin<T> {
  static #appContext = new AsyncLocalStorage<AppContext>()
  /** Returns the context for the currently handled request, if any. */
  static getAppContext = (): AppContext | undefined => AppContextPlugin.#appContext.getStore()

  #requestIdHeader: string
  #features: Required<AppContextPluginOptions>['features']
  #getRequestId: (options: FetchInterceptorOptions<T>) => string | null | undefined
  /**
   * @param options - Feature flags, request-ID header name, and an optional upstream ID resolver.
   */
  constructor({ requestIdHeader, features = {}, getParentRequestId }: AppContextPluginOptions = {}) {
    this.#requestIdHeader = requestIdHeader ?? 'X-Request-ID'
    this.#features = { requestId: true, serverTiming: false, ...features }
    this.#getRequestId = getParentRequestId
      ? (options: FetchInterceptorOptions<T>): string | null | undefined => getParentRequestId(options)
      : (options: FetchInterceptorOptions<T>): string | null => options.request.headers.get(this.#requestIdHeader)
  }

  #interceptor = (options: FetchInterceptorOptions<T>): ReturnType<FetchHandlerFetchInterceptor<T>> => {
    const requestId = this.#features.requestId && (this.#getRequestId(options) ?? crypto.randomUUID())
    const serverTiming = this.#features.serverTiming ? [] : undefined
    const appContext: AppContext = { requestId: requestId || undefined }

    if (serverTiming) {
      appContext.serverTiming = serverTiming
    }

    Object.defineProperty(appContext, featuresSymbol, { value: this.#features })

    return AppContextPlugin.#appContext.run(appContext, async () => {
      const result = await options.next()

      if (!result.matched) {
        return result
      }

      if (this.#features.requestId && requestId) {
        result.response.headers.set(this.#requestIdHeader, requestId)
      }

      if (this.#features.serverTiming && serverTiming?.length) {
        result.response.headers.set('Server-Timing', serverTiming.join(','))
      }

      return result
    })
  }

  /**
   * Prepends the context interceptor while preserving pre-existing fetch
   * interceptors.
   *
   * @param options - oRPC fetch-handler options to augment.
   * @returns Options with the context interceptor installed.
   */
  initFetchHandlerOptions(options: FetchHandlerOptions<T>): FetchHandlerOptions<T> {
    return {
      ...options,
      fetchInterceptors: [this.#interceptor, ...(options.fetchInterceptors ?? [])]
    }
  }

  name = '@qingshaner/context'
}

/**
 * Gets the {@link AppContext} for the active oRPC request.
 *
 * Returns `undefined` when called outside an {@link AppContextPlugin}-managed
 * request. Consumers should therefore treat this as an optional context rather
 * than caching it beyond the current asynchronous request chain.
 */
export const getAppContext: typeof AppContextPlugin.getAppContext = AppContextPlugin.getAppContext
