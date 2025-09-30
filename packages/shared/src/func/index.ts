export { debounce, type DebounceOptions } from './debounce'
export { asyncSafety, syncSafety } from './safety'
export type { AsyncSafetyFn, Result, ResultFromFunc, SyncSafetyFn } from './safety'
export { throttle, type ThrottleOptions, type ThrottleWrapper } from './throttle'

/**
 * A no-operation function that does nothing.
 * @public
 */
export const noop = (): void => {}
