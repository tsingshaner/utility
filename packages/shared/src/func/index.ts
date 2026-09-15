export { type DebounceOptions, debounce } from './debounce'
export { asyncSafety, syncSafety } from './safety'
export { type ThrottleOptions, type ThrottleWrapper, throttle } from './throttle'

export type { AsyncSafetyFn, Result, ResultFromFunc, SyncSafetyFn } from './safety'

/**
 * A no-operation function that does nothing.
 * @public
 */
export const noop = (): void => {}
