import type { SetReturnType } from 'type-fest'

import type { AnyAsyncFunc, AnyFunc, AwaitedReturnType } from '../types'

/**
 * Generic result type from a func.
 *
 * @public
 */
export type ResultFromFunc<T extends AnyFunc, E> = Result<AwaitedReturnType<T>, E>
/**
 * Wrap async function with error handling.
 *
 * @public
 * @template T - The typeof provide fn.
 */
export type AsyncSafetyFn<T extends AnyAsyncFunc, E> = SetReturnType<T, Promise<ResultFromFunc<T, E>>>
/**
 * Wrap sync function with error handling.
 *
 * @public
 * @template T - The typeof provide fn.
 */
export type SyncSafetyFn<T extends AnyFunc, E> = SetReturnType<T, ResultFromFunc<T, E>>
/**
 * The result of a function that may throw an error.
 * @remarks
 * This tuple is used to return the result of a function that may throw an error.
 * The second element indicates whether the operation was successful.
 * If successful, the first element is the return value of the function;
 * if failed, the first element is the thrown error.
 *
 * @public
 */
export type Result<T, E = Error> = [cause: E, success: false] | [data: T, success: true]

/**
 * Wrap an async function to catch the error.
 * @param fn - The async function.
 * @template T - The typeof provide fn.
 * @template E - The typeof error maybe throw.
 * @returns The wrapped function.
 * @example
 * You should always check the results to deal with possible errors.
 * ```ts
 * const apiGetTaskList = asyncSafety((path: PathLick) => readfile(path, 'utf-8'))
 * const [data, success] = await apiGetTaskList<>()
 * ```
 *
 * @see {@link Result}
 *
 * @public
 */
export const asyncSafety = <T extends AnyAsyncFunc, E = unknown>(fn: T): AsyncSafetyFn<T, E> =>
  (async (...args: Parameters<T>) => {
    try {
      return [await fn(...args), true]
    } catch (error) {
      return [error as E, false]
    }
  }) as AsyncSafetyFn<T, E>

/**
 * Wrap a sync function to catch the error.
 * @param fn - The sync function.
 * @returns The wrapped function.
 * @see {@link Result}
 *
 * @public
 */
export const syncSafety = <T extends AnyFunc, E = unknown>(fn: T): SyncSafetyFn<T, E> =>
  ((...args: Parameters<T>) => {
    try {
      return [fn(...args), true]
    } catch (error) {
      return [error, false]
    }
  }) as SyncSafetyFn<T, E>
