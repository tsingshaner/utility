import { SpanStatusCode, trace } from '@opentelemetry/api'

import { getAppContext } from '../context'

/**
 * Attributes attached to the OpenTelemetry span created by {@link measure}.
 *
 * Attribute names should use the semantic-convention name when one exists,
 * such as `db.system` or `http.request.method`.
 */
export type TimingAttributes = Record<string, string | number | boolean>

/** Options that control how {@link measure} reports an operation. */
export interface MeasureOptions {
  /** Attributes attached to the operation's OpenTelemetry span. */
  attributes?: TimingAttributes
  /** Human-readable label included as the Server-Timing metric description. */
  description?: string
  /** Number of fractional milliseconds in the Server-Timing duration. Defaults to `1`. */
  precision?: number
}

const tracer = trace.getTracer('@qingshaner/utility-orpc')
const timers = new WeakMap<object, Map<string, { description?: string; start: number }>>()

const formatMetric = (name: string, duration: number, options: MeasureOptions): string => {
  const metric = `${name.replaceAll(/[^a-zA-Z0-9_.-]/g, '_')};dur=${duration.toFixed(options.precision ?? 1)}`
  return options.description
    ? `${metric};desc="${options.description.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
    : metric
}

/**
 * Adds a completed Server-Timing metric to the current request.
 *
 * This is useful when duration is already available from another source. It
 * does not create an OpenTelemetry span.
 *
 * @param name - Header-safe metric name. Other characters are replaced with `_`.
 * @param duration - Metric duration in milliseconds.
 * @param description - Optional human-readable metric description.
 * @param precision - Number of fractional milliseconds. Defaults to `1`.
 */
export const setTime = (name: string, duration: number, description?: string, precision?: number): void => {
  getAppContext()?.serverTiming?.push(formatMetric(name, duration, { description, precision }))
}

/**
 * Starts a Server-Timing metric for the current request.
 *
 * Pair this with {@link endTime} using the same name. Starting a metric with a
 * name that is already running replaces its earlier start time. It does not
 * create an OpenTelemetry span.
 *
 * @param name - Stable metric name.
 * @param description - Optional human-readable metric description.
 */
export const startTime = (name: string, description?: string): void => {
  const appContext = getAppContext()

  if (!appContext?.serverTiming) {
    return
  }

  const requestTimers = timers.get(appContext) ?? new Map()
  requestTimers.set(name, { description, start: performance.now() })
  timers.set(appContext, requestTimers)
}

/**
 * Stops a Server-Timing metric started with {@link startTime} and appends it to
 * the current request's response header.
 *
 * Calling this without a matching timer is a no-op. It does not create an
 * OpenTelemetry span.
 *
 * @param name - Name supplied to {@link startTime}.
 * @param precision - Number of fractional milliseconds. Defaults to `1`.
 */
export const endTime = (name: string, precision?: number): void => {
  const appContext = getAppContext()
  const requestTimers = appContext && timers.get(appContext)
  const timer = requestTimers?.get(name)

  if (!(requestTimers && timer)) {
    return
  }

  requestTimers.delete(name)
  setTime(name, performance.now() - timer.start, timer.description, precision)
}

/**
 * Executes an operation while reporting its duration to Server-Timing and
 * OpenTelemetry.
 *
 * When called inside an {@link AppContextPlugin} request with the
 * `serverTiming` feature enabled, the completed operation is appended to the
 * response's `Server-Timing` header. Metric names are normalized to header-safe
 * characters and descriptions are escaped before being written.
 *
 * The operation also runs inside an active OpenTelemetry span. Register an
 * OpenTelemetry SDK in the application to export that span through OTLP; this
 * package intentionally depends only on the OpenTelemetry API.
 *
 * Errors are recorded on the span, the timing metric is still emitted, and the
 * original error is rethrown unchanged.
 *
 * @typeParam T - The operation's resolved result type.
 * @param name - Stable name shared by the Server-Timing metric and OTel span.
 * @param fn - Synchronous or asynchronous operation to execute.
 * @param options - Optional Server-Timing description, precision, and span attributes.
 * @returns A promise for the operation's result.
 *
 * @example
 * ```ts
 * const user = await measure('db.user.find', () => db.findUser(id), {
 *   description: 'User query',
 *   attributes: { 'db.system': 'postgresql' },
 * })
 * ```
 */
export const measure = <T>(name: string, fn: () => T | Promise<T>, options: MeasureOptions = {}): Promise<T> => {
  const start = performance.now()

  return tracer.startActiveSpan(name, { attributes: options.attributes }, async (span) => {
    try {
      return await fn()
    } catch (error) {
      span.recordException(error instanceof Error ? error : String(error))
      span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : undefined })
      throw error
    } finally {
      getAppContext()?.serverTiming?.push(formatMetric(name, performance.now() - start, options))
      span.end()
    }
  })
}
