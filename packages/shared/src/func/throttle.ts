// cSpell:ignore Nikolić, Alman

/**
 * This file is part of the utility package.
 *
 * Portions of this code are adapted from the following libraries:
 *
 * 1. `throttle-debounce` by Ivan Nikolić
 *    Copyright (c) Ivan Nikolić http://ivannikolic.com
 *    Licensed under the MIT License.
 *    Source: https://github.com/niksy/throttle-debounce
 *
 * 2. `jQuery throttle / debounce` by "Cowboy" Ben Alman
 *    Copyright (c) 2010 "Cowboy" Ben Alman
 *    Licensed under the MIT License.
 *    Source: https://github.com/cowboy/jquery-throttle-debounce
 *
 * Modifications:
 * - Refactored the `throttle` function to support TypeScript types.
 * - Improved documentation.
 */

import type { SetReturnType } from 'type-fest'

import type { AnyFunc, FuncWithProps, Timeout } from '../types'

/**
 * An object to configure throttle options.
 *
 * @import It should be noted that callback will never executed if both leading = false and trailing = true.
 *
 * @public
 */
export interface ThrottleOptions {
  /**
   * If `debounceMode` is undefined, this is a throttle wrapper
   * If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms.
   * If `debounceMode` is false (at end), schedule `callback` to execute after `delay` ms.
   *
   * @internal
   * @default undefined
   */
  _debounceMode?: boolean
  /**
   * The delay in milliseconds to waiting.
   *
   * @default 100
   */
  delay: number
  /**
   * If leading is true, the first throttled-function call will execute callback immediately.
   * If leading is false, the first the callback execution will be skipped.
   *
   * @default true
   */
  leading: boolean
  /**
   * If trailing is false, callback will only execute every `delay` milliseconds while the throttled-function is being called.
   * If trailing is true or unspecified, callback will be executed one final time after the last throttled-function call.
   * (After the throttled-function has not been called for `delay` milliseconds, the internal counter is reset).
   *
   * @default true
   */
  trailing: boolean
}
/**
 * Represents a function that can be throttled.
 *
 * @public
 */
export type ThrottleWrapper<T extends AnyFunc> = FuncWithProps<
  SetReturnType<T, void>,
  {
    /**
     * Cancel the feature execution.
     *
     * @remarks
     * If upcomingOnly is true, only skip the next execution in schedule.
     * If upcomingOnly is false or unspecified, skip all future executions.
     *
     * @param upcomingOnly - Weather only skip the upcoming execution.
     *
     * @default false
     */
    cancel: (upcomingOnly?: boolean) => void
  }
>

/**
 * Throttle execution of a function. Especially useful for rate limiting.
 *
 * @param delay - A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param callback - A function to be executed after delay milliseconds. The `this` context and all arguments are passed through, as-is, to `callback` when the throttled-function is executed.
 * @param options - {@link ThrottleOptions}.
 *
 * @returns A new, throttled, function.
 * @throws {Error} If `options.leading` and `options.trailing` all set `false` will throw error.
 *
 * @example
 * ```ts
 * const handleScroll = throttle(function () {
 *   // handle scroll
 * })
 *
 * container.addEventListener('scroll', handleScroll)
 * ```
 *
 * @public
 */
export function throttle<T extends AnyFunc>(callback: T, options: Partial<ThrottleOptions> = {}): ThrottleWrapper<T> {
  const { _debounceMode: atBegin, delay = 100, leading = true, trailing = true } = options
  if (!(leading || trailing)) {
    throw Error('`leading` and `trailing` could not all set `false`')
  }

  const isDebounce = atBegin !== undefined
  let cancelled = false
  let timer: Timeout | undefined
  /** If `at begin` is true this is used to clear the flag to allow future `callback` executions. */
  const clear = (): void => {
    timer = undefined
  }

  /** Keep track of the last timestamp `callback` was executed. */
  let lastExec = 0

  /** {@link ThrottleWrapper.cancel} */
  const cancel = (upcomingOnly = false): void => {
    clearTimeout(timer)
    cancelled = !upcomingOnly
  }

  /**
   * The `wrapper` function encapsulates all of the throttling / debouncing
   * functionality and when executed will limit the rate at which `callback`
   * is executed.
   */
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
  const wrapper = function (this: ThisType<T>, ...args: Parameters<T>): void {
    if (cancelled) {
      return
    }

    const elapsed = Date.now() - lastExec

    /** Execute `callback` and update the `lastExec` timestamp. */
    const exec = (): void => {
      lastExec = Date.now()
      callback.apply(this, args)
    }

    if (atBegin && leading && !timer) {
      exec()
    }

    clearTimeout(timer)

    if (!isDebounce && elapsed > delay) {
      // throttle mode and should exec
      if (leading) {
        exec()
        return
      }

      lastExec = Date.now()
      if (trailing) {
        timer = setTimeout(exec, delay)
      }
    } else if (trailing) {
      /*
       * In trailing throttle mode, since `delay` time has not been
       * exceeded, schedule `callback` to execute `delay` ms after most
       * recent execution.
       *
       * If `debounceMode` is true (at begin), schedule `clear` to execute after `delay` ms.
       * If `debounceMode` is false (at end), schedule `callback` to execute after `delay` ms.
       */
      timer = isDebounce ? setTimeout(atBegin ? clear : exec, delay) : setTimeout(exec, delay - elapsed)
    }
  } as T
  ;(wrapper as unknown as ThrottleWrapper<T>).cancel = cancel

  return wrapper as unknown as ThrottleWrapper<T>
}
