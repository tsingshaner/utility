import { throttle, type ThrottleOptions, type ThrottleWrapper } from './throttle'

import type { AnyFunc } from '../types'

/**
 * An object to configure debounce options.
 *
 * @public
 */
export interface DebounceOptions extends Pick<ThrottleOptions, 'delay'> {
  /**
   * If atBegin is false, callback will only be executed `delay` milliseconds after the last debounced-function call.
   * If atBegin is true, callback will be executed only at the first debounced-function call.
   * (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
   *
   * @default false
   */
  atBegin: boolean
}

/**
 * Debounce execution of a function.
 * @param callback - A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is, to `callback` when the debounced-function is executed.
 * @param options - {@link DebounceOptions}.
 * @returns A new, debounced, function.
 *
 * @public
 */
export function debounce<T extends AnyFunc>(callback: T, options: Partial<DebounceOptions> = {}): ThrottleWrapper<T> {
  const { atBegin = false, delay = 100 } = options
  return throttle(callback, { _debounceMode: atBegin, delay })
}
