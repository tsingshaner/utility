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

export type SyncSafetyFn<T, E> = T extends (...args: infer A) => infer R ? (...args: A) => Result<R, E> : undefined
export type AsyncSafetyFn<T, E> = T extends (...args: infer A) => Promise<infer R>
  ? (...args: A) => Promise<Result<R, E>>
  : undefined

/**
 * Wrap an async function to catch the error.
 * @param fn - The async function.
 * @template T - The typeof provide fn.
 * @template E - The typeof error maybe throw.
 * @returns The wrapped function.
 * @example
 * You should always check the results to deal with possible errors.
 * ```ts
 * const apiGetTaskList = asyncSafety<>((path: PathLick) => readfile(path, 'utf-8'))
 * const [data, success] = await apiGetTaskList<>()
 * ```
 *
 * @see {@link Result}
 *
 * @public
 */
export const asyncSafety = <T, E = unknown>(fn: T): AsyncSafetyFn<T, E> =>
  (typeof fn === 'function'
    ? async (...args) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          return [await fn(...args), true]
        } catch (error) {
          return [error as E, false]
        }
      }
    : undefined) as AsyncSafetyFn<T, E>

/**
 * Wrap a sync function to catch the error.
 * @param fn - The sync function.
 * @returns The wrapped function.
 * @see {@link Result}
 *
 * @public
 */
export const syncSafety = <T, E = unknown>(fn: T): SyncSafetyFn<T, E> =>
  (typeof fn === 'function'
    ? (...args) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          return [fn(...args), true]
        } catch (error) {
          return [error as E, false]
        }
      }
    : undefined) as SyncSafetyFn<T, E>
